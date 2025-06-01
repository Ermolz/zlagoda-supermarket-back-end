CREATE TABLE employee_auth (
    id_employee VARCHAR(10) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_employee) REFERENCES employee(id_employee) ON DELETE CASCADE
);

-- Додаємо тестові дані для автентифікації
INSERT INTO employee_auth (id_employee, email, password) VALUES
('E001', 'petrenko@zlagoda.com', '$2b$10$YC/N3S/OgeztcEy/YT.4/useDLGUwneKT1/k3z8VZGYxdhSIQZUhW'), -- password: password123
('E002', 'kovalenko@zlagoda.com', '$2b$10$YC/N3S/OgeztcEy/YT.4/useDLGUwneKT1/k3z8VZGYxdhSIQZUhW'),
('E003', 'shevchenko@zlagoda.com', '$2b$10$YC/N3S/OgeztcEy/YT.4/useDLGUwneKT1/k3z8VZGYxdhSIQZUhW'),
('E004', 'kravchenko@zlagoda.com', '$2b$10$YC/N3S/OgeztcEy/YT.4/useDLGUwneKT1/k3z8VZGYxdhSIQZUhW'),
('E005', 'melnyk@zlagoda.com', '$2b$10$YC/N3S/OgeztcEy/YT.4/useDLGUwneKT1/k3z8VZGYxdhSIQZUhW'); 