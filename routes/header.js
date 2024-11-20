function getHeader() {
    return `
        <div style="background-color: #333; padding: 10px; text-align: center;">
            <a href="/" style="color: white; margin: 0 15px; text-decoration: none;">Home</a>
            <a href="/listprod" style="color: white; margin: 0 15px; text-decoration: none;">Products</a>
            <a href="/listorder" style="color: white; margin: 0 15px; text-decoration: none;">Orders</a>
            <a href="/cart" style="color: white; margin: 0 15px; text-decoration: none;">Cart</a>
        </div>
    `;
}

module.exports = getHeader;