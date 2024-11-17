
CREATE TABLE Products (
    productID INT PRIMARY KEY,              
    playerName NVARCHAR(100) NOT NULL,      
    jerseyNum INT NOT NULL,                 
    productPrice DECIMAL(10, 2) NOT NULL           
);


CREATE TABLE Customer (
    custID INT PRIMARY KEY,                
    custName NVARCHAR(100) NOT NULL,        
    custAddress NVARCHAR(255) NOT NULL      
);


CREATE TABLE Orders (
    orderID INT PRIMARY KEY,              
    orderDate DATE NOT NULL,                
    custID INT NOT NULL,                    
    productID INT NOT NULL,                 
    quantity INT NOT NULL,                  
    totalCost DOUBLE NOT NULL, 
    CONSTRAINT FK_Order_Customer FOREIGN KEY (custID) REFERENCES Customer(custID),
    CONSTRAINT FK_Order_Product FOREIGN KEY (productID) REFERENCES Products(productID)
);