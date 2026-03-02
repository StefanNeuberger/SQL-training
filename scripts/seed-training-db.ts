/**
 * Creates the `training` schema with realistic sample data for SQL exercises.
 * Run with: pnpm db:seed:training
 */
import { Pool } from "pg";
import { config } from "dotenv";

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
  const client = await pool.connect();
  try {
    console.log("Creating training schema and tables...");

    await client.query("BEGIN");

    // ─── Schema ───────────────────────────────────────────────────────────────
    await client.query(`CREATE SCHEMA IF NOT EXISTS training`);

    // ─── Drop existing tables in reverse dependency order ─────────────────────
    await client.query(`
      DROP TABLE IF EXISTS training.reviews CASCADE;
      DROP TABLE IF EXISTS training.order_items CASCADE;
      DROP TABLE IF EXISTS training.orders CASCADE;
      DROP TABLE IF EXISTS training.product_suppliers CASCADE;
      DROP TABLE IF EXISTS training.products CASCADE;
      DROP TABLE IF EXISTS training.suppliers CASCADE;
      DROP TABLE IF EXISTS training.categories CASCADE;
      DROP TABLE IF EXISTS training.customers CASCADE;
      DROP TABLE IF EXISTS training.employees CASCADE;
      DROP TABLE IF EXISTS training.departments CASCADE;
    `);

    // ─── Departments ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE training.departments (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        budget      NUMERIC(12, 2) NOT NULL,
        location    VARCHAR(100)
      )
    `);

    // ─── Employees (self-referencing manager) ─────────────────────────────────
    await client.query(`
      CREATE TABLE training.employees (
        id            SERIAL PRIMARY KEY,
        first_name    VARCHAR(100) NOT NULL,
        last_name     VARCHAR(100) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        department_id INT REFERENCES training.departments(id),
        manager_id    INT REFERENCES training.employees(id),
        salary        NUMERIC(10, 2) NOT NULL,
        hire_date     DATE NOT NULL,
        title         VARCHAR(100) NOT NULL
      )
    `);

    // ─── Categories (self-referencing parent) ─────────────────────────────────
    await client.query(`
      CREATE TABLE training.categories (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        parent_id   INT REFERENCES training.categories(id)
      )
    `);

    // ─── Suppliers ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE training.suppliers (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        country     VARCHAR(100) NOT NULL,
        contact_email VARCHAR(255),
        rating      NUMERIC(3, 1) CHECK (rating BETWEEN 1 AND 5)
      )
    `);

    // ─── Products ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE training.products (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(200) NOT NULL,
        description     TEXT,
        price           NUMERIC(10, 2) NOT NULL,
        stock_quantity  INT NOT NULL DEFAULT 0,
        category_id     INT REFERENCES training.categories(id),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Product–Supplier junction ────────────────────────────────────────────
    await client.query(`
      CREATE TABLE training.product_suppliers (
        product_id  INT REFERENCES training.products(id),
        supplier_id INT REFERENCES training.suppliers(id),
        unit_cost   NUMERIC(10, 2) NOT NULL,
        PRIMARY KEY (product_id, supplier_id)
      )
    `);

    // ─── Customers ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE training.customers (
        id          SERIAL PRIMARY KEY,
        first_name  VARCHAR(100) NOT NULL,
        last_name   VARCHAR(100) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        city        VARCHAR(100),
        country     VARCHAR(100),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Orders ───────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE training.orders (
        id            SERIAL PRIMARY KEY,
        customer_id   INT REFERENCES training.customers(id),
        status        VARCHAR(50) NOT NULL
                        CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
        total_amount  NUMERIC(10, 2),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        shipped_at    TIMESTAMPTZ,
        delivered_at  TIMESTAMPTZ
      )
    `);

    // ─── Order items ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE training.order_items (
        id          SERIAL PRIMARY KEY,
        order_id    INT REFERENCES training.orders(id),
        product_id  INT REFERENCES training.products(id),
        quantity    INT NOT NULL CHECK (quantity > 0),
        unit_price  NUMERIC(10, 2) NOT NULL
      )
    `);

    // ─── Reviews ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE training.reviews (
        id          SERIAL PRIMARY KEY,
        product_id  INT REFERENCES training.products(id),
        customer_id INT REFERENCES training.customers(id),
        rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment     TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    console.log("Seeding departments...");
    await client.query(`
      INSERT INTO training.departments (name, budget, location) VALUES
        ('Engineering',    1200000.00, 'Berlin'),
        ('Marketing',       450000.00, 'Munich'),
        ('Sales',           800000.00, 'Hamburg'),
        ('Human Resources', 300000.00, 'Berlin'),
        ('Finance',         500000.00, 'Frankfurt'),
        ('Operations',      650000.00, 'Munich'),
        ('Product',         750000.00, 'Berlin'),
        ('Customer Support',350000.00, 'Hamburg')
    `);

    console.log("Seeding employees...");
    await client.query(`
      INSERT INTO training.employees (first_name, last_name, email, department_id, manager_id, salary, hire_date, title) VALUES
        ('Maria',   'Schmidt',  'maria.schmidt@corp.com',    1, NULL,  120000, '2018-03-15', 'CTO'),
        ('Thomas',  'Mueller',  'thomas.mueller@corp.com',   3, NULL,  115000, '2017-06-01', 'VP of Sales'),
        ('Anna',    'Weber',    'anna.weber@corp.com',       2, NULL,  105000, '2019-01-10', 'CMO'),
        ('Klaus',   'Bauer',    'klaus.bauer@corp.com',      5, NULL,  110000, '2016-11-20', 'CFO'),
        ('Julia',   'Fischer',  'julia.fischer@corp.com',    1,   1,   95000, '2020-04-01', 'Senior Engineer'),
        ('Peter',   'Hoffman',  'peter.hoffman@corp.com',    1,   1,   90000, '2020-07-15', 'Senior Engineer'),
        ('Lisa',    'Wagner',   'lisa.wagner@corp.com',      2,   3,   75000, '2021-02-28', 'Marketing Manager'),
        ('Michael', 'Becker',   'michael.becker@corp.com',  3,   2,   80000, '2020-09-01', 'Sales Manager'),
        ('Sara',    'Schulz',   'sara.schulz@corp.com',      7,  NULL,  98000, '2019-05-15', 'Head of Product'),
        ('David',   'Braun',    'david.braun@corp.com',      1,   1,   88000, '2021-08-01', 'Engineer'),
        ('Emma',    'Zimmermann','emma.zimmermann@corp.com', 1,   5,   72000, '2022-01-10', 'Junior Engineer'),
        ('Felix',   'Koch',     'felix.koch@corp.com',       3,   8,   65000, '2022-06-01', 'Sales Rep'),
        ('Sophie',  'Richter',  'sophie.richter@corp.com',   3,   8,   67000, '2022-03-15', 'Sales Rep'),
        ('Leon',    'Wolf',     'leon.wolf@corp.com',        4,  NULL,  85000, '2018-09-01', 'HR Manager'),
        ('Mia',     'Neumann',  'mia.neumann@corp.com',      6,  NULL,  80000, '2019-12-01', 'Operations Manager'),
        ('Luca',    'Schwarz',  'luca.schwarz@corp.com',     1,   5,   74000, '2022-10-01', 'Engineer'),
        ('Lea',     'Braun',    'lea.braun@corp.com',        7,   9,   70000, '2023-01-15', 'Product Manager'),
        ('Noah',    'Hartmann', 'noah.hartmann@corp.com',    8,  NULL,  60000, '2022-05-01', 'Support Lead'),
        ('Finn',    'Lange',    'finn.lange@corp.com',       5,   4,   75000, '2020-11-01', 'Financial Analyst'),
        ('Hannah',  'Krause',   'hannah.krause@corp.com',   2,   7,   62000, '2023-03-01', 'Marketing Specialist')
    `);

    console.log("Seeding categories...");
    await client.query(`
      INSERT INTO training.categories (name, parent_id) VALUES
        ('Electronics',    NULL),
        ('Clothing',       NULL),
        ('Home & Garden',  NULL),
        ('Sports',         NULL),
        ('Books',          NULL),
        ('Smartphones',       1),
        ('Laptops',           1),
        ('Headphones',        1),
        ('Cameras',           1),
        ('Men''s Clothing',   2),
        ('Women''s Clothing', 2),
        ('Footwear',          2),
        ('Furniture',         3),
        ('Kitchen',           3),
        ('Garden Tools',      3),
        ('Running',           4),
        ('Cycling',           4),
        ('Fitness',           4),
        ('Fiction',           5),
        ('Non-Fiction',       5)
    `);

    console.log("Seeding suppliers...");
    await client.query(`
      INSERT INTO training.suppliers (name, country, contact_email, rating) VALUES
        ('TechGlobal GmbH',    'Germany',  'supply@techglobal.de',  4.5),
        ('AsiaComponents Ltd', 'China',    'orders@asiacomp.cn',    3.8),
        ('NordTech AS',        'Sweden',   'info@nordtech.se',      4.2),
        ('FastShip Inc',       'USA',      'biz@fastship.com',      4.0),
        ('QualityParts SA',    'France',   'contact@qparts.fr',     4.7),
        ('GlobalTextile AG',   'Turkey',   'sales@globaltex.tr',    3.5),
        ('ProSports Ltd',      'UK',       'orders@prosports.co.uk',4.1),
        ('EcoGoods BV',        'Netherlands','eco@ecogoods.nl',     4.3)
    `);

    console.log("Seeding products...");
    await client.query(`
      INSERT INTO training.products (name, description, price, stock_quantity, category_id) VALUES
        ('iPhone 15 Pro',         'Apple flagship smartphone 256GB',             1199.00,  45,  6),
        ('Samsung Galaxy S24',    'Samsung flagship smartphone 128GB',            999.00,  62,  6),
        ('Google Pixel 8',        'Google smartphone with AI camera',             799.00,  38,  6),
        ('MacBook Pro 14"',       'Apple M3 chip, 16GB RAM, 512GB SSD',          2499.00,  20,  7),
        ('Dell XPS 15',           'Intel Core i9, 32GB RAM, 1TB SSD',            1899.00,  25,  7),
        ('Lenovo ThinkPad X1',    'Business ultrabook, 16GB RAM, 512GB',         1599.00,  30,  7),
        ('Sony WH-1000XM5',       'Premium noise-cancelling headphones',          349.00,  80,  8),
        ('Apple AirPods Pro',     'Active noise cancellation, MagSafe case',      279.00,  95,  8),
        ('Bose QuietComfort 45',  'Wireless noise-cancelling headphones',         329.00,  55,  8),
        ('Sony A7 IV',            'Full-frame mirrorless camera body',           2799.00,  15,  9),
        ('Canon EOS R6 Mark II',  'Professional mirrorless camera',             2499.00,  18,  9),
        ('Nikon Z6 III',          'Mirrorless camera with 24.5MP sensor',       2199.00,  22,  9),
        ('Adidas Running Jacket', 'Lightweight windproof running jacket M',        89.00, 120, 10),
        ('Nike Dri-FIT Shirt',    'Performance training shirt, various colors',    45.00, 200, 10),
        ('Levi''s 501 Jeans',     'Classic straight-leg denim, size 32/32',        89.00, 150, 10),
        ('Zara Summer Dress',     'Floral print midi dress, size S',               59.00, 180, 11),
        ('H&M Blazer',            'Tailored fit blazer, black, size 38',           79.00, 140, 11),
        ('Nike Air Max 270',      'Lifestyle running shoes, size 42',             149.00, 110, 12),
        ('Adidas Ultraboost 23',  'Running shoes with Boost technology, size 43', 189.00,  85, 12),
        ('IKEA BILLY Bookcase',   'White bookcase 80x28x202cm',                    79.00,  40, 13),
        ('Bosch KitchenMixer',    '1000W stand mixer with accessories',           299.00,  35, 14),
        ('Nespresso Vertuo',      'Coffee machine with milk frother',             199.00,  60, 14),
        ('Gardena Garden Hose',   '20m expandable garden hose with fittings',      49.00,  75, 15),
        ('Garmin Forerunner 265', 'GPS running watch with heart rate monitor',    449.00,  50, 16),
        ('Trek Domane AL 3',      'Road bike with carbon fork, size 56cm',       1199.00,  12, 17),
        ('Bowflex SelectTech 552','Adjustable dumbbells 2-24kg pair',             429.00,  28, 18),
        ('The Great Gatsby',      'F. Scott Fitzgerald classic novel',             12.99, 300, 19),
        ('1984',                  'George Orwell dystopian masterpiece',           11.99, 280, 19),
        ('Atomic Habits',         'James Clear - life-changing habit guide',       22.99, 350, 20),
        ('Sapiens',               'Yuval Noah Harari - brief history of humankind',24.99, 220, 20)
    `);

    console.log("Seeding product_suppliers...");
    await client.query(`
      INSERT INTO training.product_suppliers (product_id, supplier_id, unit_cost) VALUES
        (1,  2, 650.00), (1,  4, 680.00),
        (2,  2, 520.00), (2,  1, 550.00),
        (3,  2, 420.00),
        (4,  1, 1400.00),(4,  5, 1450.00),
        (5,  1, 1000.00),(5,  4, 1020.00),
        (6,  1,  850.00),
        (7,  3,  190.00),(7,  5,  200.00),
        (8,  2,  150.00),
        (9,  3,  175.00),
        (10, 1, 1800.00),
        (11, 1, 1600.00),(11, 5, 1650.00),
        (12, 3, 1400.00),
        (13, 6,   45.00),
        (14, 6,   22.00),(14, 7,  24.00),
        (15, 6,   40.00),
        (16, 6,   28.00),
        (17, 6,   35.00),
        (18, 7,   75.00),(18, 6,  72.00),
        (19, 7,   95.00),
        (20, 8,   35.00),
        (21, 1,  150.00),
        (22, 1,  100.00),
        (23, 8,   22.00),
        (24, 1,  250.00),
        (25, 7,  650.00),
        (26, 7,  210.00),
        (27, 8,    5.50),
        (28, 8,    5.00),
        (29, 8,   10.00),
        (30, 8,   11.00)
    `);

    console.log("Seeding customers...");
    await client.query(`
      INSERT INTO training.customers (first_name, last_name, email, city, country) VALUES
        ('Alice',     'Johnson',  'alice.johnson@email.com',     'Berlin',    'Germany'),
        ('Bob',       'Smith',    'bob.smith@email.com',         'London',    'UK'),
        ('Charlotte', 'Dubois',   'charlotte.dubois@email.com',  'Paris',     'France'),
        ('Daniel',    'Müller',   'daniel.mueller@email.com',    'Munich',    'Germany'),
        ('Emma',      'Garcia',   'emma.garcia@email.com',       'Madrid',    'Spain'),
        ('Frank',     'Rossi',    'frank.rossi@email.com',       'Rome',      'Italy'),
        ('Grace',     'Hansen',   'grace.hansen@email.com',      'Copenhagen','Denmark'),
        ('Henry',     'Kowalski', 'henry.kowalski@email.com',    'Warsaw',    'Poland'),
        ('Isabella',  'Silva',    'isabella.silva@email.com',    'Lisbon',    'Portugal'),
        ('James',     'Wilson',   'james.wilson@email.com',      'Edinburgh', 'UK'),
        ('Kate',      'Brown',    'kate.brown@email.com',        'Dublin',    'Ireland'),
        ('Leo',       'Martinez', 'leo.martinez@email.com',      'Barcelona', 'Spain'),
        ('Maya',      'Patel',    'maya.patel@email.com',        'Amsterdam', 'Netherlands'),
        ('Nathan',    'Thomas',   'nathan.thomas@email.com',     'Brussels',  'Belgium'),
        ('Olivia',    'Anderson', 'olivia.anderson@email.com',   'Vienna',    'Austria'),
        ('Paul',      'Jackson',  'paul.jackson@email.com',      'Zurich',    'Switzerland'),
        ('Quinn',     'White',    'quinn.white@email.com',       'Berlin',    'Germany'),
        ('Rachel',    'Harris',   'rachel.harris@email.com',     'Hamburg',   'Germany'),
        ('Samuel',    'Martin',   'samuel.martin@email.com',     'Lyon',      'France'),
        ('Tina',      'Thompson', 'tina.thompson@email.com',     'Milan',     'Italy'),
        ('Uma',       'Clark',    'uma.clark@email.com',         'Stockholm', 'Sweden'),
        ('Victor',    'Lewis',    'victor.lewis@email.com',      'Oslo',      'Norway'),
        ('Wendy',     'Robinson', 'wendy.robinson@email.com',    'Helsinki',  'Finland'),
        ('Xavier',    'Walker',   'xavier.walker@email.com',     'Prague',    'Czech Republic'),
        ('Yara',      'Hall',     'yara.hall@email.com',         'Budapest',  'Hungary'),
        ('Zach',      'Allen',    'zach.allen@email.com',        'Bucharest', 'Romania'),
        ('Aria',      'Young',    'aria.young@email.com',        'Frankfurt', 'Germany'),
        ('Blake',     'King',     'blake.king@email.com',        'Munich',    'Germany'),
        ('Cleo',      'Wright',   'cleo.wright@email.com',       'Cologne',   'Germany'),
        ('Dylan',     'Scott',    'dylan.scott@email.com',       'Stuttgart', 'Germany')
    `);

    console.log("Seeding orders...");
    await client.query(`
      INSERT INTO training.orders (customer_id, status, total_amount, created_at, shipped_at, delivered_at) VALUES
        (1,  'delivered',  1199.00, '2024-01-05 10:00:00+00', '2024-01-07 08:00:00+00', '2024-01-09 14:00:00+00'),
        (2,  'delivered',  2499.00, '2024-01-08 14:30:00+00', '2024-01-10 09:00:00+00', '2024-01-12 16:00:00+00'),
        (3,  'delivered',   428.00, '2024-01-12 09:15:00+00', '2024-01-14 11:00:00+00', '2024-01-16 15:30:00+00'),
        (4,  'delivered',  3698.00, '2024-01-15 16:45:00+00', '2024-01-17 08:30:00+00', '2024-01-20 12:00:00+00'),
        (5,  'shipped',    1899.00, '2024-02-01 11:00:00+00', '2024-02-03 10:00:00+00', NULL),
        (6,  'shipped',     349.00, '2024-02-05 13:30:00+00', '2024-02-07 09:00:00+00', NULL),
        (7,  'processing',  279.00, '2024-02-10 10:00:00+00', NULL, NULL),
        (8,  'processing', 2799.00, '2024-02-12 15:00:00+00', NULL, NULL),
        (9,  'pending',    1199.00, '2024-02-15 09:00:00+00', NULL, NULL),
        (10, 'cancelled',   429.00, '2024-01-20 12:00:00+00', NULL, NULL),
        (1,  'delivered',   558.00, '2024-01-25 10:30:00+00', '2024-01-27 09:00:00+00', '2024-01-29 14:00:00+00'),
        (3,  'delivered',    89.00, '2024-01-28 11:00:00+00', '2024-01-30 10:00:00+00', '2024-02-01 15:00:00+00'),
        (5,  'delivered',  2499.00, '2023-12-01 10:00:00+00', '2023-12-03 09:00:00+00', '2023-12-05 14:00:00+00'),
        (12, 'delivered',   449.00, '2024-01-03 14:00:00+00', '2024-01-05 10:00:00+00', '2024-01-07 16:00:00+00'),
        (13, 'delivered',   199.00, '2024-01-10 09:30:00+00', '2024-01-12 08:00:00+00', '2024-01-14 14:30:00+00'),
        (14, 'shipped',    1599.00, '2024-02-08 16:00:00+00', '2024-02-10 09:00:00+00', NULL),
        (15, 'processing',  329.00, '2024-02-13 11:30:00+00', NULL, NULL),
        (16, 'delivered',  2199.00, '2023-11-15 10:00:00+00', '2023-11-17 09:00:00+00', '2023-11-19 14:00:00+00'),
        (17, 'delivered',   149.00, '2024-01-18 13:00:00+00', '2024-01-20 10:00:00+00', '2024-01-22 15:00:00+00'),
        (18, 'delivered',   189.00, '2024-01-22 10:00:00+00', '2024-01-24 09:00:00+00', '2024-01-26 14:00:00+00'),
        (19, 'cancelled',   999.00, '2024-01-30 15:00:00+00', NULL, NULL),
        (20, 'delivered',    79.00, '2024-02-02 11:00:00+00', '2024-02-04 09:00:00+00', '2024-02-06 15:00:00+00'),
        (21, 'delivered',   299.00, '2024-01-08 14:00:00+00', '2024-01-10 10:00:00+00', '2024-01-12 16:00:00+00'),
        (22, 'shipped',     449.00, '2024-02-09 10:00:00+00', '2024-02-11 09:00:00+00', NULL),
        (27, 'delivered',  2498.00, '2024-01-05 09:00:00+00', '2024-01-07 08:00:00+00', '2024-01-10 14:00:00+00'),
        (28, 'delivered',  3698.00, '2024-01-12 10:00:00+00', '2024-01-14 09:00:00+00', '2024-01-16 15:00:00+00'),
        (29, 'processing',  178.00, '2024-02-14 13:00:00+00', NULL, NULL),
        (30, 'pending',    2799.00, '2024-02-16 10:00:00+00', NULL, NULL),
        (2,  'delivered',   449.00, '2023-10-15 10:00:00+00', '2023-10-17 09:00:00+00', '2023-10-19 14:00:00+00'),
        (4,  'delivered',   199.00, '2023-11-01 14:00:00+00', '2023-11-03 10:00:00+00', '2023-11-05 16:00:00+00')
    `);

    console.log("Seeding order_items...");
    await client.query(`
      INSERT INTO training.order_items (order_id, product_id, quantity, unit_price) VALUES
        (1,  1,  1, 1199.00),
        (2,  4,  1, 2499.00),
        (3,  7,  1,  349.00), (3, 8, 1, 279.00) ,
        (4,  5,  1, 1899.00), (4, 10, 1, 2799.00) ,
        (5,  5,  1, 1899.00),
        (6,  7,  1,  349.00),
        (7,  8,  1,  279.00),
        (8,  10, 1, 2799.00),
        (9,  25, 1, 1199.00),
        (10, 26, 1,  429.00),
        (11, 7,  1,  349.00), (11, 8,  1, 279.00) ,
        (12, 13, 1,   89.00),
        (13, 4,  1, 2499.00),
        (14, 24, 1,  449.00),
        (15, 22, 1,  199.00),
        (16, 14, 1, 1599.00),
        (17, 9,  1,  329.00),
        (18, 12, 1, 2199.00),
        (19, 18, 1,  149.00),
        (20, 19, 1,  189.00),
        (21, 2,  1,  999.00),
        (22, 20, 1,   79.00),
        (23, 21, 1,  299.00),
        (24, 24, 1,  449.00),
        (25, 4,  1, 2499.00), (25, 1, 1, 1199.00) ,
        (26, 5,  1, 1899.00), (26, 10, 1, 2799.00) ,
        (27, 16, 2,   59.00), (27, 17, 1,  79.00)  ,
        (28, 10, 1, 2799.00),
        (29, 24, 1,  449.00),
        (30, 22, 1,  199.00)
    `);

    console.log("Seeding reviews...");
    await client.query(`
      INSERT INTO training.reviews (product_id, customer_id, rating, comment, created_at) VALUES
        (1,   1, 5, 'Amazing phone! The camera is incredible.',    '2024-01-15 10:00:00+00'),
        (1,   4, 4, 'Great phone but expensive.',                   '2024-01-22 14:00:00+00'),
        (4,   2, 5, 'Best laptop I have ever owned. Worth every penny.','2024-01-18 09:00:00+00'),
        (7,   3, 5, 'Outstanding noise cancellation!',             '2024-01-28 11:00:00+00'),
        (7,   6, 4, 'Very comfortable for long sessions.',         '2024-02-03 16:00:00+00'),
        (8,   7, 3, 'Good but the case gets dirty easily.',        '2024-02-15 10:00:00+00'),
        (5,   5, 4, 'Solid machine, runs everything smoothly.',    '2024-02-10 14:00:00+00'),
        (10,  8, 5, 'Exceptional image quality. A7IV is a beast.',  '2024-02-20 09:00:00+00'),
        (2,  20, 4, 'Good Android experience, nice display.',      '2024-02-08 13:00:00+00'),
        (24, 14, 5, 'GPS accuracy is flawless. Love this watch!',  '2024-01-20 15:00:00+00'),
        (22, 15, 4, 'Makes great coffee, easy to use.',            '2024-01-28 10:00:00+00'),
        (26, 10, 5, 'Perfect weight range for home workouts.',     '2024-01-12 11:00:00+00'),
        (18, 17, 4, 'Comfortable, great cushioning for running.',  '2024-01-25 12:00:00+00'),
        (29, 21, 5, 'Changed my life. Highly recommend!',          '2024-02-01 09:00:00+00'),
        (28, 22, 5, 'Classic book, should be mandatory reading.',  '2024-01-15 14:00:00+00'),
        (3,  12, 3, 'Decent phone but camera struggles at night.', '2024-01-10 10:00:00+00'),
        (9,  16, 4, 'Very comfortable, good sound quality.',       '2024-01-20 16:00:00+00'),
        (12, 18, 5, 'Incredible camera system. Love Nikon.',       '2023-12-10 10:00:00+00'),
        (19, 27, 4, 'Well made shoes, good for half marathons.',   '2024-01-15 13:00:00+00'),
        (25, 28, 5, 'Beautiful road bike, very responsive.',       '2024-01-20 15:00:00+00'),
        (4,   5, 5, 'Second MacBook Pro. Never going back.',       '2023-12-15 10:00:00+00'),
        (30, 29, 4, 'Dense but very rewarding read.',              '2024-02-05 11:00:00+00'),
        (1,  17, 5, 'Best iPhone yet. The action button is great.','2024-01-30 14:00:00+00')
    `);

    await client.query("COMMIT");

    console.log("\n✅ Training database seeded successfully!");
    console.log("Tables: departments, employees, categories, suppliers, products, product_suppliers, customers, orders, order_items, reviews");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
