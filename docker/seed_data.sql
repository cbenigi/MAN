-- ============================================================================
-- MANBANK - Script de Datos de Prueba
-- ============================================================================
-- Este script inserta datos de prueba en la base de datos PostgreSQL
-- Uso: docker exec -i manbank-postgres psql -U user -d manbank < seed_data.sql
-- O desde dentro del contenedor: psql -U user -d manbank -f /seed_data.sql
-- ============================================================================

-- Limpiar datos existentes (opcional, comentar si no quieres limpiar)
TRUNCATE TABLE transactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE pipeline_runs RESTART IDENTITY CASCADE;

-- ============================================================================
-- Transacciones de Ejemplo (Datos Realistas Colombianos)
-- ============================================================================

-- Enero 2024 - Ingresos
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-01-05', 4500000, 'Pago de nómina - Empresa XYZ', 'ACC00001', 'inflow', 'Nómina'),
('2024-01-10', 3200000, 'Pago de nómina', 'ACC00002', 'inflow', 'Nómina'),
('2024-01-15', 5800000, 'Salario mensual', 'ACC00003', 'inflow', 'Nómina'),
('2024-01-20', 1500000, 'Freelance proyecto web', 'ACC00001', 'inflow', 'Freelance');

-- Enero 2024 - Gastos Recurrentes
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-01-08', -350000, 'Pago servicios públicos EPM', 'ACC00001', 'outflow', 'Servicios'),
('2024-01-08', -85000, 'Pago internet UNE', 'ACC00001', 'outflow', 'Servicios'),
('2024-01-10', -120000, 'Claro telefonía móvil', 'ACC00001', 'outflow', 'Servicios'),
('2024-01-15', -1200000, 'Arriendo apartamento', 'ACC00001', 'outflow', 'Vivienda');

-- Enero 2024 - Supermercado
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-01-06', -280000, 'Compra Éxito - Mercado semanal', 'ACC00001', 'outflow', 'Supermercado'),
('2024-01-13', -320000, 'Compra Carulla', 'ACC00001', 'outflow', 'Supermercado'),
('2024-01-20', -195000, 'Olimpica Supermarket', 'ACC00002', 'outflow', 'Supermercado'),
('2024-01-27', -410000, 'Compra Jumbo - Mercado mensual', 'ACC00003', 'outflow', 'Supermercado');

-- Enero 2024 - Restaurantes y Comida
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-01-07', -85000, 'Restaurante El Corral', 'ACC00001', 'outflow', 'Restaurantes'),
('2024-01-09', -45000, 'Almuerzo ejecutivo', 'ACC00001', 'outflow', 'Restaurantes'),
('2024-01-12', -65000, 'Dominos Pizza', 'ACC00002', 'outflow', 'Restaurantes'),
('2024-01-14', -38000, 'Juan Valdez Café', 'ACC00001', 'outflow', 'Restaurantes'),
('2024-01-18', -92000, 'Cena familiar - Crepes & Waffles', 'ACC00003', 'outflow', 'Restaurantes'),
('2024-01-22', -42000, 'Frisby pollo', 'ACC00002', 'outflow', 'Restaurantes'),
('2024-01-25', -78000, 'Subway sandwich', 'ACC00001', 'outflow', 'Restaurantes');

-- Enero 2024 - Transporte
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-01-08', -25000, 'Uber viaje trabajo', 'ACC00001', 'outflow', 'Transporte'),
('2024-01-09', -18000, 'Taxi', 'ACC00001', 'outflow', 'Transporte'),
('2024-01-11', -180000, 'Gasolina Terpel - Tanque lleno', 'ACC00002', 'outflow', 'Transporte'),
('2024-01-15', -12000, 'Peaje', 'ACC00002', 'outflow', 'Transporte'),
('2024-01-19', -32000, 'Uber a reunión', 'ACC00001', 'outflow', 'Transporte'),
('2024-01-23', -165000, 'Estación de servicio', 'ACC00003', 'outflow', 'Transporte');

-- Febrero 2024
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-02-05', 4500000, 'Pago de nómina', 'ACC00001', 'inflow', 'Nómina'),
('2024-02-10', 3200000, 'Salario mensual', 'ACC00002', 'inflow', 'Nómina'),
('2024-02-05', -340000, 'Servicios públicos', 'ACC00001', 'outflow', 'Servicios'),
('2024-02-08', -1200000, 'Arriendo', 'ACC00001', 'outflow', 'Vivienda'),
('2024-02-10', -450000, 'Compra supermercado', 'ACC00001', 'outflow', 'Supermercado'),
('2024-02-14', -250000, 'Cena San Valentín', 'ACC00001', 'outflow', 'Restaurantes'),
('2024-02-18', -75000, 'Uber varios viajes', 'ACC00001', 'outflow', 'Transporte');

-- Marzo 2024
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-03-05', 4500000, 'Nómina marzo', 'ACC00001', 'inflow', 'Nómina'),
('2024-03-10', 3200000, 'Pago salario', 'ACC00002', 'inflow', 'Nómina'),
('2024-03-05', -365000, 'Pago servicios', 'ACC00001', 'outflow', 'Servicios'),
('2024-03-08', -1200000, 'Arriendo mensual', 'ACC00001', 'outflow', 'Vivienda'),
('2024-03-12', -520000, 'Mercado Carulla', 'ACC00001', 'outflow', 'Supermercado'),
('2024-03-15', -850000, 'Ropa - Centro comercial', 'ACC00002', 'outflow', 'Compras'),
('2024-03-20', -320000, 'Farmacia - Medicamentos', 'ACC00001', 'outflow', 'Salud'),
('2024-03-25', -500000, 'Ahorro programado', 'ACC00001', 'outflow', 'Ahorros');

-- Abril 2024 - Incluye gastos extras
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-04-05', 4500000, 'Nómina abril', 'ACC00001', 'inflow', 'Nómina'),
('2024-04-10', 3200000, 'Salario', 'ACC00002', 'inflow', 'Nómina'),
('2024-04-03', -380000, 'Servicios públicos', 'ACC00001', 'outflow', 'Servicios'),
('2024-04-05', -1200000, 'Arriendo', 'ACC00001', 'outflow', 'Vivienda'),
('2024-04-10', -1250000, 'Reparación carro - Mecánica', 'ACC00002', 'outflow', 'Mantenimiento'),
('2024-04-15', -680000, 'Supermercado Jumbo', 'ACC00001', 'outflow', 'Supermercado'),
('2024-04-20', -450000, 'Cine y entretenimiento', 'ACC00003', 'outflow', 'Entretenimiento'),
('2024-04-25', -290000, 'Amazon compras online', 'ACC00001', 'outflow', 'Compras');

-- Mayo 2024
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-05-05', 4500000, 'Pago nómina mayo', 'ACC00001', 'inflow', 'Nómina'),
('2024-05-10', 3200000, 'Salario mensual', 'ACC00002', 'inflow', 'Nómina'),
('2024-05-15', 2100000, 'Bono por desempeño', 'ACC00001', 'inflow', 'Bonos'),
('2024-05-05', -370000, 'EPM servicios', 'ACC00001', 'outflow', 'Servicios'),
('2024-05-08', -1200000, 'Arriendo', 'ACC00001', 'outflow', 'Vivienda'),
('2024-05-12', -550000, 'Mercado Éxito', 'ACC00001', 'outflow', 'Supermercado'),
('2024-05-18', -890000, 'Electrodoméstico - Lavadora', 'ACC00002', 'outflow', 'Compras'),
('2024-05-25', -1000000, 'Ahorro CDT', 'ACC00001', 'outflow', 'Inversiones');

-- Junio 2024
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-06-05', 4500000, 'Nómina junio', 'ACC00001', 'inflow', 'Nómina'),
('2024-06-10', 3200000, 'Pago salario', 'ACC00002', 'inflow', 'Nómina'),
('2024-06-05', -385000, 'Servicios públicos', 'ACC00001', 'outflow', 'Servicios'),
('2024-06-08', -1200000, 'Arriendo', 'ACC00001', 'outflow', 'Vivienda'),
('2024-06-15', -2500000, 'Vacaciones - Vuelos y hotel', 'ACC00003', 'outflow', 'Viajes'),
('2024-06-20', -420000, 'Supermercado', 'ACC00001', 'outflow', 'Supermercado');

-- Julio 2024
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-07-05', 4500000, 'Nómina julio', 'ACC00001', 'inflow', 'Nómina'),
('2024-07-10', 3200000, 'Salario', 'ACC00002', 'inflow', 'Nómina'),
('2024-07-05', -395000, 'Servicios', 'ACC00001', 'outflow', 'Servicios'),
('2024-07-08', -1200000, 'Arriendo', 'ACC00001', 'outflow', 'Vivienda'),
('2024-07-12', -580000, 'Mercado mensual', 'ACC00001', 'outflow', 'Supermercado'),
('2024-07-20', -350000, 'Gimnasio anual', 'ACC00002', 'outflow', 'Deportes'),
('2024-07-25', -180000, 'Libros Amazon', 'ACC00001', 'outflow', 'Educación');

-- Agosto 2024
INSERT INTO transactions (date, amount, description, account_id, type, category) VALUES
('2024-08-05', 4500000, 'Nómina agosto', 'ACC00001', 'inflow', 'Nómina'),
('2024-08-10', 3200000, 'Pago salario', 'ACC00002', 'inflow', 'Nómina'),
('2024-08-05', -410000, 'EPM servicios', 'ACC00001', 'outflow', 'Servicios'),
('2024-08-08', -1200000, 'Arriendo', 'ACC00001', 'outflow', 'Vivienda'),
('2024-08-10', -720000, 'Supermercado Jumbo', 'ACC00001', 'outflow', 'Supermercado'),
('2024-08-15', -1450000, 'Seguro todo riesgo carro', 'ACC00002', 'outflow', 'Seguros'),
('2024-08-22', -280000, 'Dentista - Limpieza', 'ACC00001', 'outflow', 'Salud');

-- ============================================================================
-- Pipeline Runs (Estado de carga de datos)
-- ============================================================================

INSERT INTO pipeline_runs (run_date, status, records_processed, error_message) VALUES
(NOW() - INTERVAL '30 days', 'success', 150, NULL),
(NOW() - INTERVAL '15 days', 'success', 200, NULL),
(NOW() - INTERVAL '7 days', 'success', 180, NULL),
(NOW() - INTERVAL '1 day', 'success', 95, NULL),
(NOW(), 'success', 95, NULL);

-- ============================================================================
-- Resumen de datos insertados
-- ============================================================================

DO $$
DECLARE
    total_transactions INT;
    total_inflow DECIMAL(15,2);
    total_outflow DECIMAL(15,2);
    balance DECIMAL(15,2);
BEGIN
    SELECT COUNT(*) INTO total_transactions FROM transactions;
    SELECT COALESCE(SUM(amount), 0) INTO total_inflow FROM transactions WHERE type = 'inflow';
    SELECT COALESCE(SUM(ABS(amount)), 0) INTO total_outflow FROM transactions WHERE type = 'outflow';
    balance := total_inflow - total_outflow;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATOS DE PRUEBA CARGADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total transacciones: %', total_transactions;
    RAISE NOTICE 'Total ingresos: $%', to_char(total_inflow, 'FM999,999,999');
    RAISE NOTICE 'Total egresos: $%', to_char(total_outflow, 'FM999,999,999');
    RAISE NOTICE 'Balance neto: $%', to_char(balance, 'FM999,999,999');
    RAISE NOTICE '========================================';
END $$;

