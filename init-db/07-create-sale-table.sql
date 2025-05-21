CREATE TABLE sale (
    UPC VARCHAR(12) NOT NULL,
    check_number VARCHAR(10) NOT NULL,
    product_number INT NOT NULL CHECK (product_number > 0),
    selling_price DECIMAL(13,4) NOT NULL CHECK (selling_price >= 0),
    PRIMARY KEY (UPC, check_number),
    FOREIGN KEY (UPC) REFERENCES store_in_product(UPC) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (check_number) REFERENCES checks(check_number) ON UPDATE CASCADE ON DELETE CASCADE
);