CREATE OR REPLACE FUNCTION calculate_vat() RETURNS TRIGGER AS $$
BEGIN
    NEW.vat = NEW.sum_total * 0.2;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_vat_trigger
    BEFORE INSERT OR UPDATE ON checks
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vat();
