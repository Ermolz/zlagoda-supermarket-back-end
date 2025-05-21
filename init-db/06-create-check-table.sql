CREATE TABLE checks (
    check_number VARCHAR(10) PRIMARY KEY,
    id_employee VARCHAR(10) NOT NULL,
    card_number VARCHAR(13),
    print_date TIMESTAMP NOT NULL,
    sum_total DECIMAL(13,4) NOT NULL CHECK (sum_total >= 0),
    vat DECIMAL(13,3) NOT NULL CHECK (vat >= 0),
    FOREIGN KEY (id_employee) REFERENCES employee(id_employee) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (card_number) REFERENCES customer_card(card_number) ON UPDATE CASCADE ON DELETE NO ACTION
);