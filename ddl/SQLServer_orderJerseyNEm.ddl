-- Create and use the orders database
CREATE DATABASE orders;
GO

USE orders;
GO

-- Drop existing tables if they exist
DROP TABLE review;
DROP TABLE shipment;
DROP TABLE productinventory;
DROP TABLE warehouse;
DROP TABLE orderproduct;
DROP TABLE incart;
DROP TABLE product;
DROP TABLE category;
DROP TABLE ordersummary;
DROP TABLE paymentmethod;
DROP TABLE customer;

-- Create tables
CREATE TABLE customer (
    customerId          INT IDENTITY,
    firstName           VARCHAR(40),
    lastName            VARCHAR(40),
    email               VARCHAR(50),
    phonenum            VARCHAR(20),
    address             VARCHAR(50),
    city                VARCHAR(40),
    state               VARCHAR(20),
    postalCode          VARCHAR(20),
    country             VARCHAR(40),
    userid              VARCHAR(20),
    password            VARCHAR(30),
    PRIMARY KEY (customerId)
);

CREATE TABLE paymentmethod (
    paymentMethodId     INT IDENTITY,
    paymentType         VARCHAR(20),
    paymentNumber       VARCHAR(30),
    paymentExpiryDate   DATE,
    customerId          INT,
    PRIMARY KEY (paymentMethodId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE 
);


CREATE TABLE ordersummary (
    orderId             INT IDENTITY,
    orderDate           DATETIME,
    totalAmount         DECIMAL(10,2),
    shiptoAddress       VARCHAR(50),
    shiptoCity          VARCHAR(40),
    shiptoState         VARCHAR(20),
    shiptoPostalCode    VARCHAR(20),
    shiptoCountry       VARCHAR(40),
    customerId          INT,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE 
);


CREATE TABLE product (
    productId           INT IDENTITY(1,1),
    productName         VARCHAR(40),
    productPrice        DECIMAL(10,2),
    productDesc         VARCHAR(1000),
    categoryId          INT,
    teamId              INT,
    PRIMARY KEY (productId)
);

CREATE TABLE orderproduct (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE incart (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE warehouse (
    warehouseId         INT IDENTITY,
    warehouseName       VARCHAR(30),    
    PRIMARY KEY (warehouseId)
);

CREATE TABLE shipment (
    shipmentId          INT IDENTITY,
    shipmentDate        DATETIME,   
    shipmentDesc        VARCHAR(100),   
    warehouseId         INT, 
    PRIMARY KEY (shipmentId),
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE productinventory ( 
    productId           INT,
    warehouseId         INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (productId, warehouseId),   
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE review (
    reviewId            INT IDENTITY,
    reviewRating        INT,
    reviewDate          DATETIME,   
    customerId          INT,
    productId           INT,
    reviewComment       VARCHAR(1000),          
    PRIMARY KEY (reviewId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE CASCADE
);


-- Insert warehouse
INSERT INTO warehouse(warehouseName) VALUES ('NBA Warehouse');

-- Populate product inventory
INSERT INTO productinventory (productId, warehouseId, quantity, price) VALUES (1, 1, 50, 100.00);
INSERT INTO productinventory (productId, warehouseId, quantity, price) VALUES (2, 1, 40, 110.00);
INSERT INTO productinventory (productId, warehouseId, quantity, price) VALUES (3, 1, 30, 120.00);
INSERT INTO productinventory (productId, warehouseId, quantity, price) VALUES (4, 1, 25, 95.00);
INSERT INTO productinventory (productId, warehouseId, quantity, price) VALUES (5, 1, 35, 105.00);
INSERT INTO productinventory (productId, warehouseId, quantity, price) VALUES (6, 1, 45, 100.00);

-- Insert customers
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) 
VALUES ('John', 'Doe', 'john.doe@gmail.com', '123-456-7890', '123 Main Street', 'Los Angeles', 'CA', '90001', 'USA', 'john123', 'password1');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Arnold', 'Anderson', 'a.anderson@gmail.com', '204-111-2222', '103 AnyWhere Street', 'Winnipeg', 'MB', 'R3X 45T', 'Canada', 'arnold' , 'test');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Bobby', 'Brown', 'bobby.brown@hotmail.ca', '572-342-8911', '222 Bush Avenue', 'Boston', 'MA', '22222', 'United States', 'bobby' , 'bobby');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Candace', 'Cole', 'cole@charity.org', '333-444-5555', '333 Central Crescent', 'Chicago', 'IL', '33333', 'United States', 'candace' , 'password');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Darren', 'Doe', 'oe@doe.com', '250-807-2222', '444 Dover Lane', 'Kelowna', 'BC', 'V1V 2X9', 'Canada', 'darren' , 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Elizabeth', 'Elliott', 'engel@uiowa.edu', '555-666-7777', '555 Everwood Street', 'Iowa City', 'IA', '52241', 'United States', 'beth' , 'test');

-- Add orders
DECLARE @orderId INT;
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (1, '2024-12-01', 220.00);
SELECT @orderId = @@IDENTITY;
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 1, 1, 100.00);
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 2, 1, 110.00);

INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (1, '2024-12-02', 120.00);
SELECT @orderId = @@IDENTITY;
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 3, 1, 120.00);



--- MEGA INSERTS ---
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES 
('Stephen Curry', 1, 95.00, 'A 3-time NBA champion and two-time MVP, widely regarded as the greatest shooter in NBA history.', 1),
('Klay Thompson', 1, 89.00, 'A five-time NBA champion and one of the most prolific shooters of his generation.', 1),
('Draymond Green', 1, 85.00, 'A defensive powerhouse and three-time NBA champion with unparalleled versatility.', 1),
('Andrew Wiggins', 1, 90.00, 'A key contributor to the Warriors with exceptional athleticism and scoring ability.', 1),
('Jordan Poole', 1, 92.00, 'A young star known for his scoring ability, especially as a 3-point shooter.', 1),
('Kevon Looney', 1, 83.00, 'A reliable rebounder and defender, essential to the Warriors’ success in recent seasons.', 1),
('Wilt Chamberlain', 2, 115.00, 'A dominant force in the NBA, holding numerous scoring records, including 100 points in a game.', 1),
('Rick Barry', 2, 110.00, 'A Hall of Famer and 1975 Finals MVP, known for his excellent scoring and leadership.', 1),
('Chris Mullin', 2, 105.00, 'A sharpshooter and one of the best scorers in NBA history, part of the iconic "Run TMC" trio.', 1),
('Kevin Durant', 2, 120.00, 'A two-time NBA champion and Finals MVP, known for his scoring prowess and versatility.', 1),
('Nate Thurmond', 2, 105.00, 'A Hall of Fame forward, known for his incredible defense and rebounding ability.', 1),
('Baron Davis', 2, 110.00, 'A dynamic point guard who helped lead the Warriors to the 2007 playoffs in a historic upset.', 1);

-- Los Angeles Lakers (TeamID = 2)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('LeBron James', 1, 98.00, 'A four-time NBA champion and four-time MVP, considered one of the greatest players of all time.', 2),
('Anthony Davis', 1, 90.00, 'A dominant force on both ends of the court, with elite defense and scoring ability.', 2),
('Russell Westbrook', 1, 88.00, 'A former MVP and one of the most explosive point guards in NBA history.', 2),
('Austin Reaves', 1, 85.00, 'A young rising star with excellent shooting and playmaking skills.', 2),
('DAngelo Russell', 1, 93.00, 'A skilled guard known for his scoring and leadership on the floor.', 2),
('Troy Brown Jr.', 1, 82.00, 'A versatile forward with a strong defensive presence and solid scoring ability.', 2),
('Kareem Abdul-Jabbar', 2, 120.00, 'The NBA’s all-time leading scorer, a six-time NBA champion and legendary center.', 2),
('Magic Johnson', 2, 115.00, 'A five-time NBA champion and one of the greatest point guards to ever play the game.', 2),
('Kobe Bryant', 2, 118.00, 'A five-time NBA champion, one of the most skilled and iconic players of all time.', 2),
('Shaquille O’Neal', 2, 120.00, 'A dominant center and four-time NBA champion, known for his unstoppable presence in the paint.', 2),
('Elgin Baylor', 2, 110.00, 'A Hall of Famer and one of the most prolific scorers of the 1960s.', 2),
('Jerry West', 2, 105.00, 'A Hall of Fame guard and the NBA’s logo, known for his scoring and clutch performances.', 2);

-- Chicago Bulls (TeamID = 3)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Zach LaVine', 1, 92.00, 'A two-time NBA Slam Dunk Contest champion and explosive scorer for the Bulls.', 3),
('DeMar DeRozan', 1, 95.00, 'A veteran forward known for his mid-range game and clutch scoring ability.', 3),
('Nikola Vucevic', 1, 90.00, 'A skilled center with excellent rebounding and scoring ability.', 3),
('Patrick Williams', 1, 85.00, 'A young forward with great defensive potential and a growing offensive game.', 3),
('Ayo Dosunmu', 1, 87.00, 'A promising young guard with a well-rounded game and strong leadership skills.', 3),
('Coby White', 1, 80.00, 'A talented point guard known for his scoring ability and perimeter shooting.', 3),
('Michael Jordan', 2, 120.00, 'Widely regarded as the greatest basketball player of all time, a six-time NBA champion and five-time MVP.', 3),
('Scottie Pippen', 2, 115.00, 'A Hall of Famer and six-time NBA champion, one of the best all-around players in NBA history.', 3),
('Dennis Rodman', 2, 110.00, 'A defensive and rebounding legend, a five-time NBA champion and Hall of Famer.', 3),
('Derrick Rose', 2, 100.00, 'A former MVP and the youngest ever to win the award, known for his explosive athleticism.', 3),
('Joakim Noah', 2, 105.00, 'A two-time NBA All-Star and Defensive Player of the Year, known for his leadership and intensity.', 3),
('Luol Deng', 2, 100.00, 'A skilled forward known for his defense and consistency throughout his career with the Bulls.', 3);

-- Boston Celtics (TeamID = 4)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Jayson Tatum', 1, 95.00, 'A young star forward with a dynamic offensive game and strong defense.', 4),
('Jaylen Brown', 1, 92.00, 'A versatile two-way player and key contributor to the Celtics’ success.', 4),
('Marcus Smart', 1, 88.00, 'A gritty defender and the 2022 NBA Defensive Player of the Year.', 4),
('Derrick White', 1, 85.00, 'A well-rounded guard with strong playmaking and defensive skills.', 4),
('Al Horford', 1, 90.00, 'A veteran leader with excellent defense and basketball IQ, key to the Celtics’ recent success.', 4),
('Robert Williams III', 1, 82.00, 'A rising star known for his shot-blocking and rebounding ability.', 4),
('Bill Russell', 2, 120.00, 'A legendary center and 11-time NBA champion, considered one of the greatest defenders ever.', 4),
('Larry Bird', 2, 115.00, 'A three-time NBA champion and one of the greatest players in NBA history, known for his shooting and passing.', 4),
('John Havlicek', 2, 110.00, 'An eight-time NBA champion and one of the most relentless two-way players of all time.', 4),
('Paul Pierce', 2, 105.00, 'A 2008 Finals MVP and 2008 NBA champion, known for his scoring and leadership.', 4),
('Kevin Garnett', 2, 110.00, 'A Hall of Famer and 2008 NBA champion, renowned for his defense and intensity.', 4),
('Ray Allen', 2, 100.00, 'The NBA’s all-time leader in 3-point field goals made, and a key part of the 2008 Celtics championship.', 4);

-- Brooklyn Nets (TeamID = 5)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Kevin Durant', 1, 98.00, 'A two-time NBA champion and Finals MVP, known for his scoring and versatility.', 5),
('Kyrie Irving', 1, 90.00, 'A masterful ball-handler and one of the most skilled point guards in the NBA.', 5),
('Ben Simmons', 1, 85.00, 'A strong defender and playmaker, known for his versatility and athleticism.', 5),
('Mikael Bridges', 1, 88.00, 'A dynamic scorer and defender, acquired as part of the blockbuster trade with Phoenix.', 5),
('Cam Johnson', 1, 87.00, 'A sharpshooting forward with excellent offensive skills.', 5),
('Nic Claxton', 1, 83.00, 'A rising star known for his elite shot-blocking and rebounding ability.', 5),
('Jason Kidd', 2, 110.00, 'A Hall of Fame point guard and NBA champion, known for his exceptional court vision and leadership.', 5),
('Julius Erving', 2, 115.00, 'A Hall of Famer and one of the greatest forwards in NBA history, with both scoring and defense.', 5),
('Vince Carter', 2, 120.00, 'One of the most electrifying dunkers and high-flyers in NBA history, with a long career.', 5),
('Derrick Coleman', 2, 105.00, 'A dominant forward and former Rookie of the Year, known for his rebounding and scoring.', 5),
('Brook Lopez', 2, 100.00, 'A consistent center known for his scoring, shot-blocking, and leadership.', 5),
('Richard Jefferson', 2, 100.00, 'A versatile forward who won an NBA championship with the Cleveland Cavaliers in 2016.', 5);

-- Milwaukee Bucks (TeamID = 6)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Giannis Antetokounmpo', 1, 98.00, 'A two-time MVP and NBA champion, known for his incredible versatility and athleticism.', 6),
('Jrue Holiday', 1, 90.00, 'A dynamic guard known for his elite defense and leadership on both ends of the floor.', 6),
('Khris Middleton', 1, 92.00, 'A skilled scorer and two-time NBA champion, known for his clutch performances in the playoffs.', 6),
('Brook Lopez', 1, 88.00, 'A center known for his shot-blocking and perimeter shooting, key to the Bucks’ defense.', 6),
('Bobby Portis', 1, 85.00, 'A passionate player and fan favorite, known for his scoring off the bench and energy on the court.', 6),
('Grayson Allen', 1, 84.00, 'A sharpshooting guard with strong perimeter defense and consistency.', 6),
('Oscar Robertson', 2, 115.00, 'A Hall of Famer and the first player to average a triple-double for an entire season.', 6),
('Kareem Abdul-Jabbar', 2, 120.00, 'A six-time NBA champion and the NBA’s all-time leading scorer.', 6),
('Ray Allen', 2, 110.00, 'A Hall of Famer and one of the best shooters in NBA history, with numerous 3-point records.', 6),
('Sidney Moncrief', 2, 105.00, 'A two-time Defensive Player of the Year and key player in the Bucks’ 1980s success.', 6),
('Michael Redd', 2, 100.00, 'A prolific scorer and one of the best shooters in franchise history.', 6),
('Brandon Knight', 2, 100.00, 'A talented point guard known for his scoring and playmaking abilities in the early 2010s.', 6);

-- San Antonio Spurs (TeamID = 7)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Victor Wembanyama', 1, 95.00, 'A once-in-a-generation talent, known for his shot-blocking and scoring ability.', 7),
('Devin Vassell', 1, 88.00, 'A versatile scorer and defender, showing strong potential as a future star for the Spurs.', 7),
('Keldon Johnson', 1, 90.00, 'A promising forward with excellent athleticism and a knack for scoring.', 7),
('Tre Jones', 1, 85.00, 'A solid point guard known for his playmaking and defensive skills.', 7),
('Zach Collins', 1, 82.00, 'A skilled center with strong rebounding and defensive ability.', 7),
('Malaki Branham', 1, 80.00, 'A young guard with great shooting ability and high basketball IQ.', 7),
('Tim Duncan', 2, 120.00, 'A five-time NBA champion and two-time MVP, regarded as one of the greatest power forwards of all time.', 7),
('David Robinson', 2, 115.00, 'A two-time NBA champion and former MVP, known for his elite defense and rebounding.', 7),
('Manu Ginóbili', 2, 110.00, 'A four-time NBA champion and one of the most skilled and crafty shooting guards in NBA history.', 7),
('Tony Parker', 2, 105.00, 'A four-time NBA champion and Finals MVP, known for his speed and leadership.', 7),
('Kawhi Leonard', 2, 120.00, 'A two-time NBA champion and Finals MVP, known for his elite defense and scoring ability.', 7),
('Sean Elliott', 2, 100.00, 'A key member of the Spurs’ 1999 championship team, known for his clutch shooting and defense.', 7);

-- Dallas Mavericks (TeamID = 8)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Luka Dončić', 1, 98.00, 'A young MVP-caliber talent, known for his elite playmaking and scoring.', 8),
('Kyrie Irving', 1, 92.00, 'A dynamic scorer and elite ball handler, known for his clutch performances.', 8),
('Tim Hardaway Jr.', 1, 90.00, 'A sharpshooter with strong scoring ability and solid perimeter defense.', 8),
('Jaden Ivey', 1, 85.00, 'A rising star with great speed and a promising scoring ability.', 8),
('Dwight Powell', 1, 83.00, 'A solid center known for his rebounding and energy on the floor.', 8),
('Josh Green', 1, 80.00, 'A young player with great defense and versatility in the backcourt.', 8),
('Dirk Nowitzki', 2, 120.00, 'A 2011 NBA champion and one of the best power forwards of all time, known for his shooting and longevity.', 8),
('Mark Aguirre', 2, 110.00, 'A dynamic forward who was a key part of the Mavericks’ early success in the 1980s.', 8),
('Jason Kidd', 2, 115.00, 'A Hall of Fame point guard and NBA champion, known for his vision and leadership on the court.', 8),
('Steve Nash', 2, 100.00, 'A two-time MVP and one of the greatest point guards of all time, known for his passing.', 8),
('Rolando Blackman', 2, 105.00, 'A talented guard known for his scoring and leadership during the Mavericks’ 1980s and 1990s success.', 8),
('J.J. Barea', 2, 100.00, 'A key player in the 2011 championship run, known for his leadership and ability to score in key moments.', 8);

-- Philadelphia 76ers (TeamID = 9)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Joel Embiid', 1, 98.00, 'A dominant center known for his scoring, rebounding, and shot-blocking.', 9),
('Tyrese Maxey', 1, 92.00, 'A young, explosive guard known for his speed and scoring ability.', 9),
('James Harden', 1, 95.00, 'A former MVP and one of the most dynamic scorers and playmakers in NBA history.', 9),
('Tobias Harris', 1, 90.00, 'A versatile forward known for his scoring and leadership on both ends of the floor.', 9),
('P.J. Tucker', 1, 85.00, 'A veteran forward known for his defense and rebounding ability.', 9),
('DeAnthony Melton', 1, 82.00, 'A solid defensive guard with strong shooting and playmaking skills.', 9),
('Wilt Chamberlain', 2, 120.00, 'A dominant force in the NBA, holding numerous scoring records, including 100 points in a game.', 9),
('Allen Iverson', 2, 115.00, 'A Hall of Fame guard and one of the greatest scorers in NBA history, known for his toughness and tenacity.', 9),
('Julius Erving', 2, 110.00, 'A legendary forward and one of the best all-around players, known for his dazzling dunks and smooth game.', 9),
('Bobby Jones', 2, 105.00, 'A key part of the 1983 championship team, known for his defense and versatility.', 9),
('Charles Barkley', 2, 110.00, 'A Hall of Fame forward and MVP, known for his scoring, rebounding, and leadership.', 9),
('Dikembe Mutombo', 2, 100.00, 'One of the greatest shot-blockers and defenders in NBA history, known for his iconic finger wag.', 9);

-- Denver Nuggets (TeamID = 10)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Nikola Jokić', 1, 99.00, 'A two-time MVP and one of the most versatile centers in NBA history.', 10),
('Jamal Murray', 1, 92.00, 'A dynamic guard known for his clutch performances and scoring ability.', 10),
('Michael Porter Jr.', 1, 90.00, 'A talented forward known for his shooting and scoring consistency.', 10),
('Aaron Gordon', 1, 85.00, 'A versatile forward known for his athleticism and defense.', 10),
('Kentavious Caldwell-Pope', 1, 88.00, 'A strong defender and 3-point shooter, known for his championship experience.', 10),
('Bruce Brown', 1, 84.00, 'A defensive specialist and athletic guard who provides energy off the bench.', 10),
('Alex English', 2, 115.00, 'A Hall of Famer and one of the greatest scorers in Nuggets history.', 10),
('Carmelo Anthony', 2, 120.00, 'A 10-time NBA All-Star and one of the greatest scorers in NBA history.', 10),
('Chauncey Billups', 2, 110.00, 'A key leader for the 2004 Pistons championship, known for his defense and clutch moments.', 10),
('David Thompson', 2, 105.00, 'A prolific scorer and Hall of Famer, known for his athleticism and scoring ability.', 10),
('Nene', 2, 100.00, 'A veteran center known for his rebounding and scoring in the post.', 10),
('Dan Issel', 2, 100.00, 'A Hall of Famer and one of the best big men in Nuggets history.', 10);

-- Phoenix Suns (TeamID = 11)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Devin Booker', 1, 98.00, 'A dynamic scorer and the face of the Suns franchise in the modern era.', 11),
('Kevin Durant', 1, 100.00, 'A two-time NBA champion and one of the most prolific scorers of all time.', 11),
('Chris Paul', 1, 95.00, 'A future Hall of Fame point guard known for his passing and leadership.', 11),
('Deandre Ayton', 1, 90.00, 'A powerful center known for his rebounding, defense, and finishing ability.', 11),
('Matisse Thybulle', 1, 85.00, 'A defensive specialist who can guard multiple positions and provide scoring.', 11),
('Josh Okogie', 1, 83.00, 'A versatile defender with a strong all-around game and athleticism.', 11),
('Charles Barkley', 2, 120.00, 'A Hall of Fame forward and one of the greatest players in Suns history.', 11),
('Steve Nash', 2, 115.00, 'A two-time MVP and one of the best point guards in NBA history, known for his passing.', 11),
('Alvan Adams', 2, 110.00, 'A Hall of Famer and one of the best big men in Suns history, known for his scoring and defense.', 11),
('Tom Chambers', 2, 105.00, 'A prolific scorer and key player for the Suns in the 1990s.', 11),
('Dick Van Arsdale', 2, 100.00, 'A two-time All-Star and key player in the early history of the Suns.', 11),
('Walter Davis', 2, 100.00, 'A scoring machine and Hall of Famer, known for his smooth style and shooting ability.', 11);

-- Miami Heat (TeamID = 12)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Jimmy Butler', 1, 98.00, 'A fierce competitor, known for his clutch performances and leadership on the court.', 12),
('Bam Adebayo', 1, 95.00, 'A dynamic center with elite defense and versatile offensive skills.', 12),
('Tyler Herro', 1, 90.00, 'A talented young guard known for his 3-point shooting and scoring ability.', 12),
('Kyle Lowry', 1, 92.00, 'A veteran point guard with championship pedigree and strong leadership.', 12),
('Jae Crowder', 1, 87.00, 'A tough defender and versatile forward, key to the Heat’s success in recent years.', 12),
('Max Strus', 1, 85.00, 'A sharpshooting guard with great perimeter shooting and solid defense.', 12),
('Dwyane Wade', 2, 120.00, 'A Hall of Famer and three-time NBA champion, considered one of the greatest shooting guards of all time.', 12),
('Alonzo Mourning', 2, 110.00, 'A dominant center and two-time NBA champion, known for his shot-blocking and leadership.', 12),
('Shaquille O’Neal', 2, 120.00, 'A dominant center and four-time NBA champion, known for his unstoppable presence in the paint.', 12),
('LeBron James', 2, 115.00, 'A four-time NBA champion and four-time MVP, considered one of the greatest players of all time.', 12),
('Chris Bosh', 2, 110.00, 'A versatile forward and key part of the Heat’s 2012 and 2013 championship teams.', 12),
('Udonis Haslem', 2, 100.00, 'A loyal Heat player, known for his leadership and gritty play throughout his career.', 12);

-- Atlanta Hawks (TeamID = 13)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Trae Young', 1, 98.00, 'A young superstar point guard with elite passing and scoring abilities.', 13),
('Dejounte Murray', 1, 92.00, 'A two-way guard known for his defense and scoring consistency.', 13),
('John Collins', 1, 90.00, 'A versatile forward known for his rebounding and scoring in the paint.', 13),
('De’Andre Hunter', 1, 85.00, 'A solid defender with a smooth offensive game and potential as a two-way player.', 13),
('Clint Capela', 1, 88.00, 'A rebounding and shot-blocking machine, key to the Hawks’ defense.', 13),
('Bogdan Bogdanović', 1, 87.00, 'A sharpshooter with a knack for scoring and creating for teammates.', 13),
('Dominique Wilkins', 2, 120.00, 'A Hall of Fame forward and one of the best dunkers in NBA history.', 13),
('Joe Johnson', 2, 115.00, 'A skilled scorer and clutch performer, known for his shooting and ball handling.', 13),
('Al Horford', 2, 110.00, 'A two-time NBA champion known for his defense and leadership on the court.', 13),
('Dikembe Mutombo', 2, 105.00, 'A dominant shot-blocker and rebounder, known for his finger wag and defense.', 13),
('Josh Smith', 2, 100.00, 'A versatile forward known for his defense, rebounding, and athleticism.', 13),
('Mookie Blaylock', 2, 100.00, 'A defensive-minded point guard known for his steals and leadership.', 13);

-- Charlotte Hornets (TeamID = 14)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('LaMelo Ball', 1, 94.00, 'A flashy and talented point guard known for his passing and scoring ability.', 14),
('Gordon Hayward', 1, 88.00, 'A veteran forward known for his all-around game and ability to score in multiple ways.', 14),
('Terry Rozier', 1, 90.00, 'A dynamic scorer and playmaker with the ability to take over games.', 14),
('Miles Bridges', 1, 85.00, 'An explosive forward known for his athleticism and scoring ability.', 14),
('Kelly Oubre Jr.', 1, 83.00, 'A high-flying wing with strong scoring and defensive capabilities.', 14),
('Mark Williams', 1, 80.00, 'A skilled center known for his rebounding, shot-blocking, and defense.', 14),
('Alonzo Mourning', 2, 120.00, 'A Hall of Fame center and one of the best shot-blockers in NBA history.', 14),
('Larry Johnson', 2, 110.00, 'A key forward in the 1990s, known for his powerful game and toughness.', 14),
('Muggsy Bogues', 2, 100.00, 'A diminutive point guard who made a huge impact with his speed and playmaking.', 14),
('Dell Curry', 2, 105.00, 'A sharp-shooter and father of Stephen Curry, known for his 3-point shooting ability.', 14),
('Kemba Walker', 2, 115.00, 'A dynamic guard who led the Hornets for many years with his scoring and leadership.', 14),
('Gerald Wallace', 2, 100.00, 'A tenacious defender and high-flyer known for his hustle and athleticism.', 14);

-- Detroit Pistons (TeamID = 15)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Cade Cunningham', 1, 98.00, 'A highly skilled point guard and future leader for the Pistons franchise.', 15),
('Jaden Ivey', 1, 90.00, 'A young guard known for his explosive speed and scoring ability.', 15),
('Jalen Duren', 1, 88.00, 'A talented young center with great rebounding and shot-blocking skills.', 15),
('Isaiah Stewart', 1, 85.00, 'A tough, gritty forward who brings energy and hustle every game.', 15),
('Bojan Bogdanović', 1, 92.00, 'A versatile scorer with a strong shooting touch and scoring ability.', 15),
('Alec Burks', 1, 87.00, 'A veteran guard known for his scoring and shooting ability off the bench.', 15),
('Isaiah Thomas', 2, 110.00, 'A two-time All-Star and former MVP candidate known for his scoring and leadership.', 15),
('Ben Wallace', 2, 115.00, 'A Hall of Fame defensive player and key to the Pistons’ 2004 championship run.', 15),
('Chauncey Billups', 2, 120.00, 'A clutch performer and Finals MVP who led the Pistons to a championship in 2004.', 15),
('Grant Hill', 2, 105.00, 'A Hall of Fame forward known for his all-around game and early career dominance.', 15),
('Rasheed Wallace', 2, 100.00, 'A versatile forward who was known for his defense, scoring, and leadership.', 15),
('Joe Dumars', 2, 100.00, 'A Hall of Fame guard known for his defense and leadership in the 1980s and 90s.', 15);

-- Indiana Pacers (TeamID = 16)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Tyrese Haliburton', 1, 95.00, 'A skilled point guard with exceptional court vision and playmaking ability.', 16),
('Myles Turner', 1, 90.00, 'A dominant shot-blocker and key piece to the Pacers defense and offense.', 16),
('Buddy Hield', 1, 85.00, 'A sharp-shooting guard with a deadly 3-point shooting ability.', 16),
('Jalen Smith', 1, 82.00, 'A young forward with solid defense and scoring potential.', 16),
('Bennedict Mathurin', 1, 88.00, 'A talented wing with a scoring mentality and potential to be an All-Star.', 16),
('Andrew Nembhard', 1, 80.00, 'A strong, two-way guard known for his playmaking and defensive prowess.', 16),
('Reggie Miller', 2, 120.00, 'One of the greatest shooters in NBA history and a Hall of Famer.', 16),
('Paul George', 2, 115.00, 'A multi-time All-Star and one of the league’s best two-way players.', 16),
('Jermaine O’Neal', 2, 110.00, 'A dominant center known for his scoring, rebounding, and defensive presence.', 16),
('David West', 2, 105.00, 'A tough, physical forward and key player for the Pacers during their 2000s success.', 16),
('Danny Granger', 2, 100.00, 'A high-scoring forward and one of the most underrated players in Pacers history.', 16),
('Detlef Schrempf', 2, 100.00, 'A versatile forward and two-time All-Star for the Pacers in the 90s.', 16);

-- Toronto Raptors (TeamID = 17)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Pascal Siakam', 1, 97.00, 'A dynamic forward and one of the best all-around players in the league today.', 17),
('Fred VanVleet', 1, 92.00, 'A tough, undersized guard known for his defense, leadership, and clutch shooting.', 17),
('OG Anunoby', 1, 90.00, 'A standout defender with a developing offensive game.', 17),
('Scottie Barnes', 1, 88.00, 'A versatile and athletic young forward with great potential on both ends of the floor.', 17),
('Gary Trent Jr.', 1, 85.00, 'A scoring guard with deep 3-point shooting range and a strong defensive presence.', 17),
('Jakob Pöltl', 1, 82.00, 'A solid center with excellent rebounding and shot-blocking ability.', 17),
('Vince Carter', 2, 120.00, 'A future Hall of Famer and one of the best dunkers in NBA history.', 17),
('Kyle Lowry', 2, 115.00, 'A championship-winning point guard known for his leadership and defense.', 17),
('Chris Bosh', 2, 110.00, 'A Hall of Famer and one of the best power forwards of his era.', 17),
('DeMar DeRozan', 2, 105.00, 'A highly skilled scorer and mid-range specialist for the Raptors during the 2010s.', 17),
('Andrea Bargnani', 2, 100.00, 'A skilled big man with a great shooting touch for a seven-footer.', 17),
('Antonio Davis', 2, 100.00, 'A solid center and forward who was a key piece for the Raptors in the early 2000s.', 17);

-- Orlando Magic (TeamID = 18)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Paolo Banchero', 1, 94.00, 'A talented rookie forward with elite scoring and playmaking ability.', 18),
('Franz Wagner', 1, 90.00, 'A versatile wing with strong scoring ability and great potential on both ends of the floor.', 18),
('Jalen Suggs', 1, 85.00, 'A competitive and talented guard with solid defense and playmaking skills.', 18),
('Markelle Fultz', 1, 80.00, 'A young point guard with great vision and the ability to drive and score.', 18),
('Wendell Carter Jr.', 1, 88.00, 'A skilled big man known for his rebounding and defensive presence.', 18),
('Bol Bol', 1, 82.00, 'A unique player with great height, shot-blocking ability, and offensive potential.', 18),
('Dwight Howard', 2, 120.00, 'A dominant center and three-time Defensive Player of the Year for the Magic.', 18),
('Shaquille O’Neal', 2, 115.00, 'A Hall of Fame center who was one of the most dominant players in NBA history.', 18),
('Penny Hardaway', 2, 110.00, 'A Hall of Fame guard known for his skill, vision, and leadership in the 90s.', 18),
('Nick Anderson', 2, 105.00, 'A key player during the Magic’s early years and an underrated all-around talent.', 18),
('Horace Grant', 2, 100.00, 'A key defensive player and rebounder for the Magic during their 90s success.', 18),
('Terry Catledge', 2, 100.00, 'A forward who was a key piece for the Magic during the 1990s.', 18);

-- Washington Wizards (TeamID = 19)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Bradley Beal', 1, 95.00, 'A dynamic scorer and one of the top shooting guards in the league.', 19),
('Kyle Kuzma', 1, 90.00, 'A versatile forward with scoring ability and an improving defensive game.', 19),
('Kristaps Porzingis', 1, 92.00, 'A skilled big man with elite shot-blocking and three-point shooting ability.', 19),
('Jordan Poole', 1, 85.00, 'A high-scoring guard with great ball-handling and shooting skills.', 19),
('Monte Morris', 1, 82.00, 'A reliable point guard known for his efficiency and leadership.', 19),
('Deni Avdija', 1, 80.00, 'A young forward with great potential as a versatile defender and playmaker.', 19),
('Wes Unseld Jr.', 2, 110.00, 'A skilled point guard and the heart of the Wizards during their 1970s success.', 19),
('Elvin Hayes', 2, 115.00, 'A Hall of Fame forward and one of the best scorers and rebounders of the 70s.', 19),
('Chris Webber', 2, 120.00, 'A Hall of Fame forward known for his playmaking and rebounding.', 19),
('Gilbert Arenas', 2, 100.00, 'A dynamic and explosive guard who led the Wizards to the playoffs in the 2000s.', 19),
('John Wall', 2, 105.00, 'A star point guard known for his speed, playmaking, and defensive ability.', 19),
('Antawn Jamison', 2, 100.00, 'A consistent scorer and rebounder for the Wizards in the 2000s.', 19);

-- Cleveland Cavaliers (TeamID = 20)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Darius Garland', 1, 98.00, 'A highly skilled point guard with exceptional playmaking and scoring ability.', 20),
('Donovan Mitchell', 1, 95.00, 'An explosive scorer and one of the league’s top shooting guards.', 20),
('Evan Mobley', 1, 92.00, 'A rising star forward with elite defensive skills and potential to be a two-way star.', 20),
('Jarrett Allen', 1, 88.00, 'A shot-blocking specialist and excellent rim protector for the Cavaliers.', 20),
('Caris LeVert', 1, 85.00, 'A versatile guard known for his ability to score and create plays.', 20),
('Isaac Okoro', 1, 82.00, 'A young wing player with strong defense and potential to grow as a scorer.', 20),
('LeBron James', 2, 120.00, 'A four-time NBA champion and one of the greatest players in NBA history.', 20),
('Kyrie Irving', 2, 115.00, 'A dynamic scorer and one of the best ball handlers in NBA history.', 20),
('Zydrunas Ilgauskas', 2, 110.00, 'A Hall of Fame center who spent most of his career with the Cavaliers.', 20),
('Mark Price', 2, 105.00, 'A four-time All-Star and one of the best point guards in Cavs history.', 20),
('Brad Daugherty', 2, 100.00, 'A five-time All-Star and one of the Cavaliers’ most consistent players in the 90s.', 20),
('Larry Nance Sr.', 2, 100.00, 'A versatile forward known for his defense and highlight-reel dunks.', 20);

-- Minnesota Timberwolves (TeamID = 21)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Anthony Edwards', 1, 98.00, 'A young star guard known for his athleticism and scoring ability.', 21),
('Karl-Anthony Towns', 1, 95.00, 'A skilled big man with a rare combination of size, shooting, and playmaking.', 21),
('Rudy Gobert', 1, 92.00, 'A dominant center known for his defense, rebounding, and shot-blocking.', 21),
('Jaden Ivey', 1, 88.00, 'A dynamic guard with speed and scoring ability off the dribble.', 21),
('Naz Reid', 1, 85.00, 'A versatile forward with the ability to shoot and defend at a high level.', 21),
('Jaylen Nowell', 1, 82.00, 'A young guard with a smooth scoring touch and playmaking ability.', 21),
('Kevin Garnett', 2, 120.00, 'A Hall of Fame forward and one of the best defenders and rebounders of his era.', 21),
('Sam Cassell', 2, 115.00, 'A key player for the Timberwolves during their 2000s playoff runs.', 21),
('Latrell Sprewell', 2, 110.00, 'A talented scorer and key player for the Timberwolves during their successful seasons.', 21),
('Tom Gugliotta', 2, 105.00, 'A solid forward who played a key role in the Timberwolves’ 1990s success.', 21),
('Wally Szczerbiak', 2, 100.00, 'A sharpshooting forward who was one of the Timberwolves’ main scoring threats.', 21),
('Ricky Rubio', 2, 100.00, 'A flashy point guard known for his exceptional passing and court vision.', 21);

-- New Orleans Pelicans (TeamID = 22)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Zion Williamson', 1, 100.00, 'A powerful forward with an explosive game and immense potential.', 22),
('Brandon Ingram', 1, 95.00, 'A skilled scorer and playmaker with the ability to dominate games.', 22),
('CJ McCollum', 1, 90.00, 'A dynamic shooting guard with excellent scoring ability and leadership skills.', 22),
('Herb Jones', 1, 88.00, 'A defensive specialist with potential to become an elite two-way player.', 22),
('Trey Murphy III', 1, 85.00, 'A sharpshooting wing known for his scoring and athleticism.', 22),
('Jonas Valančiūnas', 1, 82.00, 'A strong center known for his rebounding and scoring presence in the paint.', 22),
('Anthony Davis', 2, 120.00, 'A versatile big man known for his elite defense and rebounding ability.', 22),
('Chris Paul', 2, 115.00, 'A Hall of Fame point guard and one of the best playmakers in NBA history.', 22),
('Alonzo Mourning', 2, 110.00, 'A Hall of Fame center known for his incredible shot-blocking and rebounding.', 22),
('David West', 2, 105.00, 'A skilled forward known for his scoring and leadership on the court.', 22),
('Peja Stojaković', 2, 100.00, 'A sharpshooter and one of the best 3-point shooters in NBA history.', 22),
('Muggsy Bogues', 2, 100.00, 'A legendary point guard, known for his quickness and leadership despite being undersized.', 22);

-- Sacramento Kings (TeamID = 23)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('De’Aaron Fox', 1, 95.00, 'A speedy and explosive point guard known for his leadership and scoring ability.', 23),
('Domantas Sabonis', 1, 92.00, 'A versatile big man with elite passing and rebounding skills.', 23),
('Kevin Huerter', 1, 88.00, 'A sharp-shooting guard known for his three-point ability and smart playmaking.', 23),
('Keegan Murray', 1, 85.00, 'A talented forward with a smooth scoring touch and elite defense potential.', 23),
('Malik Monk', 1, 80.00, 'A dynamic guard with the ability to score in bunches off the bench.', 23),
('Harrison Barnes', 1, 90.00, 'A veteran forward known for his scoring, defense, and winning mentality.', 23),
('Chris Webber', 2, 120.00, 'A Hall of Fame forward known for his playmaking and rebounding skills.', 23),
('Vlade Divac', 2, 115.00, 'A skilled center known for his passing ability and leadership on the floor.', 23),
('Peja Stojaković', 2, 110.00, 'A sharpshooter and one of the best 3-point shooters in NBA history.', 23),
('Jason Williams', 2, 105.00, 'A flashy point guard known for his no-look passes and creativity on the court.', 23),
('Mike Bibby', 2, 100.00, 'A steady point guard and key part of the Kings’ successful 2000s teams.', 23),
('Bobby Jackson', 2, 100.00, 'A clutch guard known for his scoring and defensive ability off the bench.', 23);

-- Utah Jazz (TeamID = 24)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Lauri Markkanen', 1, 95.00, 'A versatile forward with excellent shooting and rebounding skills.', 24),
('Jordan Clarkson', 1, 90.00, 'A dynamic scorer with the ability to light up the scoreboard off the bench.', 24),
('Walker Kessler', 1, 88.00, 'A young center with elite shot-blocking ability and solid rebounding skills.', 24),
('Collin Sexton', 1, 85.00, 'A quick and aggressive guard known for his scoring and leadership.', 24),
('Talen Horton-Tucker', 1, 82.00, 'A young guard with potential as a versatile two-way player.', 24),
('Mike Conley', 1, 90.00, 'A veteran point guard known for his playmaking, leadership, and defense.', 24),
('Karl Malone', 2, 120.00, 'A Hall of Fame forward and one of the greatest power forwards in NBA history.', 24),
('John Stockton', 2, 115.00, 'The all-time leader in assists and steals, a Hall of Fame point guard.', 24),
('Jeff Hornacek', 2, 110.00, 'A sharp-shooting guard known for his scoring and passing ability.', 24),
('Andrei Kirilenko', 2, 105.00, 'A versatile forward known for his defensive prowess and basketball IQ.', 24),
('Gordon Hayward', 2, 100.00, 'A skilled forward with a solid all-around game, known for his scoring and passing.', 24),
('Ronnie Brewer', 2, 100.00, 'A defensive-minded guard known for his versatility and athleticism.', 24);

-- Oklahoma City Thunder (TeamID = 25)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Shai Gilgeous-Alexander', 1, 98.00, 'A rising star guard with elite scoring, passing, and defense.', 25),
('Josh Giddey', 1, 92.00, 'A skilled playmaker with impressive court vision and size for a guard.', 25),
('Jalen Williams', 1, 88.00, 'A talented wing player with scoring ability and defensive potential.', 25),
('Chet Holmgren', 1, 90.00, 'A highly anticipated big man known for his shot-blocking and versatility.', 25),
('Aleksej Pokuševski', 1, 85.00, 'A talented big man with an outside shot and high potential as a two-way player.', 25),
('Lu Dort', 1, 80.00, 'A tough, defensive-minded guard who can contribute on offense when needed.', 25),
('Kevin Durant', 2, 120.00, 'A two-time NBA champion and one of the most dominant scorers in NBA history.', 25),
('Russell Westbrook', 2, 115.00, 'A former MVP known for his athleticism, aggression, and triple-double ability.', 25),
('James Harden', 2, 110.00, 'A former MVP and one of the best scoring guards of his generation.', 25),
('Serge Ibaka', 2, 105.00, 'A defensive force and key player for the Thunder’s 2012 Finals run.', 25),
('Nick Collison', 2, 100.00, 'A fan-favorite forward known for his rebounding and leadership in Oklahoma City.', 25),
('Enes Kanter', 2, 100.00, 'A strong center known for his rebounding and scoring around the basket.', 25);

-- Houston Rockets (TeamID = 26)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Jalen Green', 1, 92.00, 'A rising star with explosive scoring ability and athleticism.', 26),
('Alperen Sengun', 1, 88.00, 'A skilled big man known for his excellent playmaking and footwork.', 26),
('Fred VanVleet', 1, 94.00, 'A tough and versatile guard, known for his defense and clutch shooting.', 26),
('Kevin Porter Jr.', 1, 85.00, 'A dynamic guard with an offensive skill set that’s still developing.', 26),
('Jabari Smith Jr.', 1, 90.00, 'A highly talented forward with a great shooting touch and defensive prowess.', 26),
('Kenyon Martin Jr.', 1, 80.00, 'A high-energy player with strong athleticism and defensive ability.', 26),
('Hakeem Olajuwon', 2, 120.00, 'A Hall of Fame center and two-time NBA champion, known for his unmatched footwork and defense.', 26),
('Yao Ming', 2, 115.00, 'One of the greatest centers in NBA history, a global icon and Hall of Famer.', 26),
('Clyde Drexler', 2, 110.00, 'A Hall of Famer known for his athleticism, scoring, and leadership on the court.', 26),
('Ralph Sampson', 2, 105.00, 'A dominant center who was part of the Twin Towers duo with Hakeem Olajuwon.', 26),
('Moses Malone', 2, 120.00, 'A Hall of Fame center, a three-time MVP known for his rebounding and scoring.', 26),
('Tracy McGrady', 2, 115.00, 'A Hall of Famer and prolific scorer, known for his incredible scoring outbursts.', 26);

-- New York Knicks (TeamID = 27)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Julius Randle', 1, 95.00, 'A versatile forward known for his scoring and rebounding.', 27),
('Jalen Brunson', 1, 92.00, 'A crafty point guard with excellent leadership and scoring ability.', 27),
('RJ Barrett', 1, 90.00, 'A talented wing player known for his scoring, rebounding, and defense.', 27),
('Mitchell Robinson', 1, 88.00, 'A dominant shot blocker and rebounder, with elite rim protection.', 27),
('Quentin Grimes', 1, 84.00, 'A young guard with excellent defensive ability and a developing offensive game.', 27),
('Immanuel Quickley', 1, 80.00, 'A dynamic guard known for his scoring and speed on the floor.', 27),
('Patrick Ewing', 2, 120.00, 'A Hall of Fame center and the face of the Knicks in the 1990s, known for his scoring and defense.', 27),
('Clyde Frazier', 2, 115.00, 'A Hall of Famer and one of the best all-around guards in NBA history, known for his defense and leadership.', 27),
('Charles Oakley', 2, 110.00, 'A tough and physical forward who played a key role in the Knicks’ success in the 1990s.', 27),
('Walt Frazier', 2, 105.00, 'A key member of the Knicks’ 1970 championship team, known for his defense and leadership.', 27),
('Bernard King', 2, 120.00, 'A prolific scorer who led the Knicks in the 1980s with his unstoppable scoring ability.', 27),
('Allan Houston', 2, 115.00, 'A skilled shooting guard known for his scoring, especially in clutch moments.', 27);

-- Los Angeles Clippers (TeamID = 28)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Kawhi Leonard', 1, 98.00, 'A two-time NBA champion and Finals MVP, known for his elite defense and scoring.', 28),
('Paul George', 1, 95.00, 'A two-way star known for his scoring, playmaking, and elite defense.', 28),
('Terance Mann', 1, 88.00, 'A versatile wing known for his defense and hustle on the court.', 28),
('Ivica Zubac', 1, 85.00, 'A reliable center known for his rebounding and rim protection.', 28),
('Norman Powell', 1, 92.00, 'A strong scorer with great athleticism and a knack for hitting clutch shots.', 28),
('Marcus Morris', 1, 84.00, 'A veteran forward known for his toughness and scoring ability.', 28),
('Chris Paul', 2, 120.00, 'A Hall of Fame point guard, one of the best playmakers and floor generals of all time.', 28),
('Blake Griffin', 2, 115.00, 'A multiple-time All-Star known for his dunking, athleticism, and leadership.', 28),
('DeAndre Jordan', 2, 110.00, 'A dominant center known for his rebounding, shot-blocking, and alley-oop dunks.', 28),
('Lamar Odom', 2, 105.00, 'A versatile forward known for his all-around play and leadership on the floor.', 28),
('Elton Brand', 2, 120.00, 'A former No. 1 overall pick, known for his scoring and rebounding ability.', 28),
('Danny Manning', 2, 115.00, 'A skilled forward known for his scoring and versatility during the 1990s.', 28);

-- Memphis Grizzlies (TeamID = 29)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Ja Morant', 1, 100.00, 'A high-flying point guard known for his explosive athleticism and scoring.', 29),
('Jaren Jackson Jr.', 1, 92.00, 'A dominant defensive presence with shot-blocking ability and improving offense.', 29),
('Desmond Bane', 1, 90.00, 'A sharpshooting guard with elite scoring ability and a developing all-around game.', 29),
('Dillon Brooks', 1, 85.00, 'A tenacious defender and scorer, known for his physicality on the court.', 29),
('Steven Adams', 1, 88.00, 'A strong and physical center known for his rebounding and screening ability.', 29),
('Tyus Jones', 1, 80.00, 'A reliable backup point guard with great playmaking and leadership skills.', 29),
('Zach Randolph', 2, 115.00, 'A rugged forward known for his scoring, rebounding, and toughness on the court.', 29),
('Marc Gasol', 2, 120.00, 'A skilled center with excellent passing and defense, key to the Grizzlies’ “Grit and Grind” era.', 29),
('Mike Conley', 2, 110.00, 'A steady point guard and all-time franchise leader in assists and steals.', 29),
('Rudy Gay', 2, 105.00, 'A skilled forward known for his scoring and versatility during the 2010s era.', 29),
('Tony Allen', 2, 120.00, 'A defensive specialist and key member of the Grizzlies’ “Grit and Grind” identity.', 29),
('Pau Gasol', 2, 115.00, 'A Hall of Fame center, known for his exceptional basketball IQ and all-around game.', 29);

-- Portland Trail Blazers (TeamID = 30)
INSERT INTO product (productName, categoryId, productPrice, productDesc, teamId) VALUES
('Damian Lillard', 1, 98.00, 'A dynamic point guard and multiple-time All-Star known for his clutch shooting.', 30),
('Anfernee Simons', 1, 85.00, 'A talented guard with deep shooting range and a developing all-around game.', 30),
('Jusuf Nurkic', 1, 90.00, 'A skilled center known for his rebounding, passing, and tough interior play.', 30),
('Jerami Grant', 1, 92.00, 'A versatile forward who excels in both offense and defense.', 30),
('Matisse Thybulle', 1, 82.00, 'An elite defender with improving offensive skills, known for his perimeter defense.', 30),
('Shaedon Sharpe', 1, 80.00, 'A young athletic guard with high potential and scoring ability.', 30),
('Clyde Drexler', 2, 120.00, 'A Hall of Famer and one of the best all-around guards in NBA history.', 30),
('Bill Walton', 2, 115.00, 'A Hall of Fame center known for his passing and amazing vibes off the court.',30);