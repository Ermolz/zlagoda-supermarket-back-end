export const validateEmployee = (req, res, next) => {
    const { 
        id_employee, empl_surname, empl_name, empl_patronymic, 
        empl_role, salary, date_of_birth, date_of_start,
        phone_number, city, street, zip_code,
        email, password 
    } = req.body;

    // For update operations, we don't require all fields
    const isUpdate = req.method === 'PUT';

    // Check required fields
    if (!isUpdate && (!id_employee || !empl_surname || !empl_name || !empl_role || !salary || 
        !phone_number || !city || !street || !zip_code ||
        !date_of_birth || !date_of_start || !email || !password)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate ID format if provided
    if (id_employee && !/^E\d{3}$/.test(id_employee)) {
        return res.status(400).json({ error: 'Employee ID must be in format E followed by 3 digits' });
    }

    // Validate role if provided
    if (empl_role && !['cashier', 'manager'].includes(empl_role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    // Validate phone number if provided
    if (phone_number && !/^\+380\d{9}$/.test(phone_number)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password if provided
    if (password && password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Validate dates if provided
    if (date_of_birth || date_of_start) {
        try {
            const birthDate = date_of_birth ? new Date(date_of_birth) : null;
            const startDate = date_of_start ? new Date(date_of_start) : null;
            const now = new Date();

            if (birthDate && isNaN(birthDate.getTime())) {
                throw new Error('Invalid birth date format');
            }

            if (startDate && isNaN(startDate.getTime())) {
                throw new Error('Invalid start date format');
            }

            if (birthDate && birthDate > now) {
                return res.status(400).json({ error: 'Birth date cannot be in the future' });
            }

            if (startDate && startDate > now) {
                return res.status(400).json({ error: 'Start date cannot be in the future' });
            }

            if (birthDate) {
                // Check age (minimum 18 years)
                const age = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
                if (age < 18) {
                    return res.status(400).json({ error: 'Employee must be at least 18 years old' });
                }
            }
        } catch (error) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
    }

    // Validate salary if provided
    if (salary !== undefined && (isNaN(salary) || salary <= 0)) {
        return res.status(400).json({ error: 'Salary must be a positive number' });
    }

    // Validate zip code if provided
    if (zip_code && zip_code.length > 9) {
        return res.status(400).json({ error: 'ZIP code is too long' });
    }

    next();
};

export const validateCategory = (req, res, next) => {
    const { category_name } = req.body;

    if (!category_name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    if (category_name.length > 50) {
        return res.status(400).json({ error: 'Category name is too long' });
    }

    next();
};

export const validateProduct = (req, res, next) => {
    const { category_number, product_name, producer, characteristics } = req.body;

    // For update operations, we don't require all fields
    const isUpdate = req.method === 'PUT';

    // Check required fields only for create operations
    if (!isUpdate && (!category_number || !product_name || !producer)) {
        return res.status(400).json({ error: 'Category number, product name and producer are required' });
    }

    // Validate string lengths if provided
    if (product_name && product_name.length > 50) {
        return res.status(400).json({ error: 'Product name is too long' });
    }

    if (producer && producer.length > 50) {
        return res.status(400).json({ error: 'Producer name is too long' });
    }

    if (characteristics && characteristics.length > 100) {
        return res.status(400).json({ error: 'Characteristics is too long' });
    }

    next();
};

export const validateStoreProduct = (req, res, next) => {
    const { UPC, id_product, selling_price, product_number, promotional_product } = req.body;

    // For update operations, we don't require all fields
    const isUpdate = req.method === 'PUT';

    // Check required fields only for create operations
    if (!isUpdate && (!UPC || !id_product || selling_price === undefined || product_number === undefined)) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate UPC format if provided
    if (UPC && UPC.length !== 12) {
        return res.status(400).json({ error: 'UPC must be 12 digits' });
    }

    // Validate numeric fields if provided
    if (selling_price !== undefined && selling_price <= 0) {
        return res.status(400).json({ error: 'Price must be positive' });
    }

    if (product_number !== undefined && product_number < 0) {
        return res.status(400).json({ error: 'Product number cannot be negative' });
    }

    next();
};

export const validateCustomerCard = (req, res, next) => {
    const { 
        card_number, cust_surname, cust_name, cust_patronymic,
        phone_number, city, street, zip_code, percent 
    } = req.body;

    // For update operations, we don't require all fields
    const isUpdate = req.method === 'PUT';

    // Check required fields only for create operations
    if (!isUpdate && (!card_number || !cust_surname || !cust_name || !phone_number || percent === undefined)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate card number format if provided
    if (card_number && !/^\d{12}$/.test(card_number)) {
        return res.status(400).json({ error: 'Card number must be 12 digits' });
    }

    // Validate phone number format if provided
    if (phone_number && !/^\+380\d{9}$/.test(phone_number)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate percent if provided
    if (percent !== undefined && (isNaN(percent) || percent < 0 || percent > 100)) {
        return res.status(400).json({ error: 'Percent must be between 0 and 100' });
    }

    // Validate string lengths if provided
    if (cust_surname && cust_surname.length > 50) {
        return res.status(400).json({ error: 'Customer surname is too long' });
    }

    if (cust_name && cust_name.length > 50) {
        return res.status(400).json({ error: 'Customer name is too long' });
    }

    if (cust_patronymic && cust_patronymic.length > 50) {
        return res.status(400).json({ error: 'Customer patronymic is too long' });
    }

    if (city && city.length > 50) {
        return res.status(400).json({ error: 'City name is too long' });
    }

    if (street && street.length > 50) {
        return res.status(400).json({ error: 'Street name is too long' });
    }

    if (zip_code && zip_code.length > 9) {
        return res.status(400).json({ error: 'ZIP code is too long' });
    }

    next();
};

export const validateCheck = (req, res, next) => {
    const { check, sales } = req.body;

    // Check required fields
    if (!check || !sales || !Array.isArray(sales)) {
        return res.status(400).json({ error: 'Invalid request format. Expected { check: {...}, sales: [...] }' });
    }

    // Validate check data
    const { check_number, id_employee, print_date, sum_total, vat } = check;

    if (!check_number || !id_employee || !print_date || sum_total === undefined || vat === undefined) {
        return res.status(400).json({ error: 'Missing required check fields' });
    }

    // Validate check number format
    if (!/^CHECK\d{3}$/.test(check_number)) {
        return res.status(400).json({ error: 'Check number must be in format CHECK followed by 3 digits' });
    }

    // Validate employee ID format
    if (!/^E\d{3}$/.test(id_employee)) {
        return res.status(400).json({ error: 'Employee ID must be in format E followed by 3 digits' });
    }

    // Validate print date
    try {
        const date = new Date(print_date);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
    } catch (error) {
        return res.status(400).json({ error: 'Invalid print date format' });
    }

    // Validate sum and VAT
    if (isNaN(sum_total) || sum_total < 0) {
        return res.status(400).json({ error: 'Sum total must be a non-negative number' });
    }

    if (isNaN(vat) || vat < 0) {
        return res.status(400).json({ error: 'VAT must be a non-negative number' });
    }

    // Validate sales data
    for (const sale of sales) {
        const { UPC, product_number, selling_price } = sale;

        if (!UPC || product_number === undefined || selling_price === undefined) {
            return res.status(400).json({ error: 'Missing required sale fields' });
        }

        // Validate UPC format
        if (!/^\d{12}$/.test(UPC)) {
            return res.status(400).json({ error: 'UPC must be 12 digits' });
        }

        // Validate product number
        if (isNaN(product_number) || product_number <= 0) {
            return res.status(400).json({ error: 'Product number must be a positive number' });
        }

        // Validate selling price
        if (isNaN(selling_price) || selling_price < 0) {
            return res.status(400).json({ error: 'Selling price must be a non-negative number' });
        }
    }

    next();
}; 