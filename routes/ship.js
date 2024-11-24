const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    const orderId = req.query.orderId;

    if (!orderId) {
        res.write("<p>Invalid order ID.</p>");
        res.end();
        return;
    }

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
            const transaction = new sql.Transaction(pool);

            await transaction.begin();

            const request = new sql.Request(transaction);

            const orderItemsQuery = `
                SELECT productId, quantity 
                FROM dbo.orderItems 
                WHERE orderId = @orderId
            `;
            request.input('orderId', sql.Int, orderId);
            const orderItemsResult = await request.query(orderItemsQuery);

            if (orderItemsResult.recordset.length === 0) {
                res.write("<p>No items found for this order.</p>");
                await transaction.rollback();
                res.end();
                return;
            }

            const shipmentQuery = `
                INSERT INTO dbo.shipments (orderId, shipmentDate) 
                VALUES (@orderId, @shipmentDate)
            `;
            request.input('shipmentDate', sql.DateTime, new Date());
            await request.query(shipmentQuery);

            for (const item of orderItemsResult.recordset) {
                const inventoryQuery = `
                    SELECT quantity 
                    FROM dbo.inventory 
                    WHERE productId = @productId AND warehouseId = 1
                `;
                request.input('productId', sql.Int, item.productId);
                const inventoryResult = await request.query(inventoryQuery);

                if (inventoryResult.recordset.length === 0 || inventoryResult.recordset[0].quantity < item.quantity) {
                    res.write("<p>Insufficient inventory for product ID " + item.productId + ".</p>");
                    await transaction.rollback();
                    res.end();
                    return;
                }

                const updateInventoryQuery = `
                    UPDATE dbo.inventory 
                    SET quantity = quantity - @quantity 
                    WHERE productId = @productId AND warehouseId = 1
                `;
                request.input('quantity', sql.Int, item.quantity);
                await request.query(updateInventoryQuery);
            }

            await transaction.commit();
            res.write("<p>Order shipped successfully.</p>");
            res.end();
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
