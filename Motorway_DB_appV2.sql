use Motorway_DB;
DROP TABLE IF EXISTS flag;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS hazard;

CREATE TABLE flag
(
flag_ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
hazard_Image INT NOT NULL REFERENCES hazard(hazard_ID),
flag_TimeStamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
longT VARCHAR(40) NOT NULL,
latT VARCHAR(40) NOT NULL
) ENGINE=INNODB; 

CREATE TABLE message
(
message_ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
flag_ID INT NOT NULL REFERENCES flag(flag_ID),
message_TimeStamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
message_Text VARCHAR(141) NOT NULL
) ENGINE = INNODB;

CREATE TABLE hazard
(
hazard_ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
hazard_Image VARCHAR(20) NOT NULL,
hazard_Name VARCHAR(20) NOT NULL
) ENGINE = INNODB;

INSERT INTO hazard (hazard_Image, hazard_Name) VALUES
('cow_small.png','Cow'),
('snow_small.png','Snow');

INSERT INTO flag (hazard_Image, latT, longT) VALUES
(1,'-45.87478395903501', '170.50128936767578'),
(2,'-45.88733167917952', '170.48463821411133');

INSERT INTO message (flag_ID, message_Text) VALUES
(1,'Herd of cows taking a stroll'),
(1,'Bloody cows still on the road'),
(1,'Cows are gone now'),
(2,'Starting to snow but still ok');
