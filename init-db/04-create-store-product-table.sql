CREATE TABLE store_in_product (
    UPC VARCHAR(12) PRIMARY KEY,
    UPC_prom VARCHAR(12),
    id_product INT NOT NULL,
    selling_price DECIMAL(13,4) NOT NULL CHECK (selling_price >= 0),
    product_number INT NOT NULL CHECK (product_number >= 0),
    promotional_product BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (UPC_prom) REFERENCES store_in_product(UPC) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (id_product) REFERENCES product(id_product) ON UPDATE CASCADE ON DELETE NO ACTION
);