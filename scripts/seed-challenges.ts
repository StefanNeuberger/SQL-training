/**
 * Seeds all topics and challenges into the app schema.
 * Run with: pnpm db:seed:challenges
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "dotenv";
import * as schema from "../src/server/db/app-schema";

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

type TopicInput = {
  name: string;
  slug: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  orderIndex: number;
  icon: string;
  challenges: ChallengeInput[];
};

type ChallengeInput = {
  title: string;
  description: string;
  difficulty: number;
  solutionQuery: string;
  hint: string;
  orderIndex: number;
  validationType: "exact" | "count" | "contains";
};

const TOPICS: TopicInput[] = [
  // ═══════════════════════════════════════════════════════
  //  BEGINNER
  // ═══════════════════════════════════════════════════════
  {
    name: "SELECT Basics",
    slug: "select-basics",
    description: "Learn how to retrieve data from a table using SELECT and FROM.",
    level: "beginner",
    orderIndex: 1,
    icon: "Table",
    challenges: [
      {
        title: "Select All Products",
        description:
          "Retrieve all columns from the `products` table. You should see all product rows.",
        difficulty: 1,
        solutionQuery: "SELECT * FROM products",
        hint: "Use SELECT * to select all columns from a table.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Select Specific Columns",
        description:
          "Select only the `name` and `price` columns from the `products` table.",
        difficulty: 1,
        solutionQuery: "SELECT name, price FROM products",
        hint: "List the column names separated by commas after SELECT.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Select with Alias",
        description:
          "Select `first_name` and `last_name` from `customers`, aliasing them as `first` and `last`.",
        difficulty: 2,
        solutionQuery:
          "SELECT first_name AS first, last_name AS last FROM customers",
        hint: "Use the AS keyword to create a column alias: SELECT col AS alias.",
        orderIndex: 3,
        validationType: "exact",
      },
      {
        title: "Select Distinct Countries",
        description:
          "Retrieve a list of unique countries from the `customers` table — no duplicates.",
        difficulty: 2,
        solutionQuery: "SELECT DISTINCT country FROM customers ORDER BY country",
        hint: "Use SELECT DISTINCT to remove duplicate rows. Don't forget to ORDER BY country.",
        orderIndex: 4,
        validationType: "exact",
      },
    ],
  },
  {
    name: "WHERE Filtering",
    slug: "where-filtering",
    description: "Filter rows using WHERE conditions with comparison and logical operators.",
    level: "beginner",
    orderIndex: 2,
    icon: "Filter",
    challenges: [
      {
        title: "Products Under €100",
        description:
          "Find all products with a price less than 100. Return all columns.",
        difficulty: 1,
        solutionQuery: "SELECT * FROM products WHERE price < 100",
        hint: "Use WHERE price < 100 after the FROM clause.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "German Customers",
        description:
          "Find all customers from Germany. Return `first_name`, `last_name`, and `city`.",
        difficulty: 1,
        solutionQuery:
          "SELECT first_name, last_name, city FROM customers WHERE country = 'Germany'",
        hint: "String comparisons use single quotes: WHERE country = 'Germany'.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "High-Salary Engineers",
        description:
          "Find employees in the Engineering department (department_id = 1) who earn more than 85000. Return their full name, title and salary.",
        difficulty: 2,
        solutionQuery:
          "SELECT first_name, last_name, title, salary FROM employees WHERE department_id = 1 AND salary > 85000",
        hint: "Combine conditions with AND: WHERE condition1 AND condition2.",
        orderIndex: 3,
        validationType: "exact",
      },
      {
        title: "Products in Price Range",
        description:
          "Find products priced between 100 and 500 (inclusive). Return `name` and `price`, ordered by price ascending.",
        difficulty: 2,
        solutionQuery:
          "SELECT name, price FROM products WHERE price BETWEEN 100 AND 500 ORDER BY price",
        hint: "Use BETWEEN for range checks: WHERE price BETWEEN 100 AND 500.",
        orderIndex: 4,
        validationType: "exact",
      },
      {
        title: "Orders by Status",
        description:
          "Find all orders that are either 'pending' or 'processing'. Return `id`, `customer_id`, `status`, and `total_amount`.",
        difficulty: 3,
        solutionQuery:
          "SELECT id, customer_id, status, total_amount FROM orders WHERE status IN ('pending', 'processing')",
        hint: "Use IN for multiple values: WHERE status IN ('value1', 'value2').",
        orderIndex: 5,
        validationType: "exact",
      },
    ],
  },
  {
    name: "ORDER BY & LIMIT",
    slug: "order-by-limit",
    description: "Sort query results and limit the number of rows returned.",
    level: "beginner",
    orderIndex: 3,
    icon: "ArrowUpDown",
    challenges: [
      {
        title: "Most Expensive Products",
        description:
          "List all products ordered by price from highest to lowest. Return `name` and `price`.",
        difficulty: 1,
        solutionQuery:
          "SELECT name, price FROM products ORDER BY price DESC",
        hint: "Use ORDER BY col DESC for descending order.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Top 5 Cheapest Products",
        description:
          "Find the 5 cheapest products. Return `name` and `price`, ordered by price ascending.",
        difficulty: 1,
        solutionQuery:
          "SELECT name, price FROM products ORDER BY price ASC LIMIT 5",
        hint: "Combine ORDER BY with LIMIT to restrict the number of results.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Most Recently Hired Employees",
        description:
          "Find the 3 most recently hired employees. Return `first_name`, `last_name`, and `hire_date`.",
        difficulty: 2,
        solutionQuery:
          "SELECT first_name, last_name, hire_date FROM employees ORDER BY hire_date DESC LIMIT 3",
        hint: "ORDER BY date_column DESC gives you the most recent dates first.",
        orderIndex: 3,
        validationType: "exact",
      },
      {
        title: "Alphabetical Products with Offset",
        description:
          "List products 6 through 10 (inclusive) sorted alphabetically by name. Return `name` only.",
        difficulty: 3,
        solutionQuery:
          "SELECT name FROM products ORDER BY name ASC LIMIT 5 OFFSET 5",
        hint: "Use OFFSET to skip rows: LIMIT 5 OFFSET 5 skips the first 5 rows and returns the next 5.",
        orderIndex: 4,
        validationType: "exact",
      },
    ],
  },
  {
    name: "Aggregate Functions",
    slug: "aggregate-functions",
    description: "Summarize data using COUNT, SUM, AVG, MIN, and MAX.",
    level: "beginner",
    orderIndex: 4,
    icon: "Calculator",
    challenges: [
      {
        title: "Count All Products",
        description: "How many products are in the `products` table? Return a single number aliased as `total_products`.",
        difficulty: 1,
        solutionQuery: "SELECT COUNT(*) AS total_products FROM products",
        hint: "Use COUNT(*) to count all rows in a table.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Total Revenue from Orders",
        description:
          "Calculate the total revenue across all orders (sum of `total_amount`). Return the result aliased as `total_revenue`.",
        difficulty: 1,
        solutionQuery:
          "SELECT SUM(total_amount) AS total_revenue FROM orders",
        hint: "Use SUM(column) to calculate the total.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Average Product Price",
        description:
          "Find the average price of all products. Round the result to 2 decimal places. Alias it `avg_price`.",
        difficulty: 2,
        solutionQuery:
          "SELECT ROUND(AVG(price), 2) AS avg_price FROM products",
        hint: "Use AVG(column) for the mean. Wrap with ROUND(value, 2) for 2 decimal places.",
        orderIndex: 3,
        validationType: "exact",
      },
      {
        title: "Salary Statistics",
        description:
          "Find the minimum salary, maximum salary, and average salary across all employees. Alias them `min_salary`, `max_salary`, and `avg_salary`. Round avg_salary to 2 decimal places.",
        difficulty: 2,
        solutionQuery:
          "SELECT MIN(salary) AS min_salary, MAX(salary) AS max_salary, ROUND(AVG(salary), 2) AS avg_salary FROM employees",
        hint: "You can use multiple aggregate functions in one SELECT.",
        orderIndex: 4,
        validationType: "exact",
      },
    ],
  },
  {
    name: "GROUP BY",
    slug: "group-by",
    description: "Aggregate data across groups of rows.",
    level: "beginner",
    orderIndex: 5,
    icon: "Layers",
    challenges: [
      {
        title: "Products per Category",
        description:
          "Count how many products belong to each category. Return `category_id` and `product_count`, ordered by `product_count` descending.",
        difficulty: 2,
        solutionQuery:
          "SELECT category_id, COUNT(*) AS product_count FROM products GROUP BY category_id ORDER BY product_count DESC",
        hint: "GROUP BY category_id groups all rows with the same category together, then COUNT(*) counts each group.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Orders by Status Count",
        description:
          "Count how many orders exist for each status. Return `status` and `count`, ordered by status alphabetically.",
        difficulty: 2,
        solutionQuery:
          "SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY status",
        hint: "GROUP BY status and use COUNT(*) to count orders per status.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Average Salary per Department",
        description:
          "Calculate the average salary for each department. Return `department_id` and `avg_salary` (rounded to 2 decimal places), ordered by avg_salary descending.",
        difficulty: 3,
        solutionQuery:
          "SELECT department_id, ROUND(AVG(salary), 2) AS avg_salary FROM employees GROUP BY department_id ORDER BY avg_salary DESC",
        hint: "GROUP BY department_id, then use AVG(salary) and ROUND().",
        orderIndex: 3,
        validationType: "exact",
      },
      {
        title: "Revenue by Customer",
        description:
          "Calculate total spending per customer (sum of `total_amount`). Return `customer_id` and `total_spent`, ordered by `total_spent` descending.",
        difficulty: 3,
        solutionQuery:
          "SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY customer_id ORDER BY total_spent DESC",
        hint: "SUM(total_amount) grouped by customer_id gives you each customer's total spending.",
        orderIndex: 4,
        validationType: "exact",
      },
    ],
  },
  {
    name: "LIKE & Patterns",
    slug: "like-patterns",
    description: "Search for text patterns using LIKE and ILIKE operators.",
    level: "beginner",
    orderIndex: 6,
    icon: "Search",
    challenges: [
      {
        title: "Products Containing 'Pro'",
        description:
          "Find all products whose name contains the word 'Pro'. Return `name` and `price`.",
        difficulty: 1,
        solutionQuery:
          "SELECT name, price FROM products WHERE name LIKE '%Pro%'",
        hint: "Use LIKE '%text%' to match any string containing 'text'. % is a wildcard for any characters.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Customers with Gmail",
        description:
          "Find all customers whose email ends with '@email.com'. Return `first_name`, `last_name`, and `email`.",
        difficulty: 1,
        solutionQuery:
          "SELECT first_name, last_name, email FROM customers WHERE email LIKE '%@email.com'",
        hint: "Use LIKE '%@email.com' — % matches any characters before the suffix.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Employees Named 'M...'",
        description:
          "Find employees whose first name starts with 'M'. Return `first_name`, `last_name`. Use case-insensitive matching.",
        difficulty: 2,
        solutionQuery:
          "SELECT first_name, last_name FROM employees WHERE first_name ILIKE 'M%'",
        hint: "ILIKE is the case-insensitive version of LIKE in PostgreSQL.",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },
  {
    name: "NULL Handling",
    slug: "null-handling",
    description: "Work with NULL values using IS NULL, IS NOT NULL, and COALESCE.",
    level: "beginner",
    orderIndex: 7,
    icon: "CircleOff",
    challenges: [
      {
        title: "Orders Without Shipping Date",
        description:
          "Find orders that have not yet been shipped (shipped_at is NULL). Return `id`, `customer_id`, and `status`.",
        difficulty: 1,
        solutionQuery:
          "SELECT id, customer_id, status FROM orders WHERE shipped_at IS NULL",
        hint: "Use IS NULL to check for NULL values — never use = NULL.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Employees Without a Manager",
        description:
          "Find employees who have no manager (top-level executives). Return `first_name`, `last_name`, and `title`.",
        difficulty: 1,
        solutionQuery:
          "SELECT first_name, last_name, title FROM employees WHERE manager_id IS NULL",
        hint: "manager_id IS NULL means the employee reports to no one — they are at the top.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Products with COALESCE",
        description:
          "Select product `name` and `description`. For products with no description, show 'No description available' instead. Alias the description column as `product_description`.",
        difficulty: 2,
        solutionQuery:
          "SELECT name, COALESCE(description, 'No description available') AS product_description FROM products",
        hint: "COALESCE(value, fallback) returns fallback when value is NULL.",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  //  INTERMEDIATE
  // ═══════════════════════════════════════════════════════
  {
    name: "INNER JOIN",
    slug: "inner-join",
    description: "Combine rows from two tables where a matching condition is met.",
    level: "intermediate",
    orderIndex: 8,
    icon: "Link",
    challenges: [
      {
        title: "Products with Category Names",
        description:
          "Join `products` and `categories` to show each product's `name`, `price`, and the category `name` (aliased as `category_name`). Order by product name.",
        difficulty: 3,
        solutionQuery: `SELECT p.name, p.price, c.name AS category_name
FROM products p
INNER JOIN categories c ON p.category_id = c.id
ORDER BY p.name`,
        hint: "Use INNER JOIN ... ON to connect tables via a matching key. p.category_id = c.id.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Orders with Customer Names",
        description:
          "Join `orders` and `customers` to display each order's `id`, `status`, `total_amount`, and the customer's full name (first_name + last_name as `customer_name`). Order by order id.",
        difficulty: 3,
        solutionQuery: `SELECT o.id, o.status, o.total_amount,
       c.first_name || ' ' || c.last_name AS customer_name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
ORDER BY o.id`,
        hint: "Concatenate strings with || in PostgreSQL: 'Hello' || ' ' || 'World'.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Employees with Department Names",
        description:
          "Show each employee's `first_name`, `last_name`, `title`, and their department `name` (aliased `department_name`). Order by department name, then last name.",
        difficulty: 4,
        solutionQuery: `SELECT e.first_name, e.last_name, e.title, d.name AS department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
ORDER BY d.name, e.last_name`,
        hint: "Join employees to departments using department_id = d.id.",
        orderIndex: 3,
        validationType: "exact",
      },
      {
        title: "Three-Table Join",
        description:
          "Join `order_items`, `orders`, and `products` to show: order `id`, product `name`, `quantity`, and `unit_price`. Order by order id.",
        difficulty: 5,
        solutionQuery: `SELECT o.id AS order_id, p.name AS product_name, oi.quantity, oi.unit_price
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
ORDER BY o.id`,
        hint: "Chain multiple JOINs: each JOIN adds another table to the query.",
        orderIndex: 4,
        validationType: "exact",
      },
    ],
  },
  {
    name: "LEFT JOIN",
    slug: "left-join",
    description: "Include all rows from the left table, even when there's no match on the right.",
    level: "intermediate",
    orderIndex: 9,
    icon: "ArrowLeft",
    challenges: [
      {
        title: "Customers Without Orders",
        description:
          "Find all customers who have never placed an order. Return `first_name`, `last_name`, and `email`. Order by last name.",
        difficulty: 4,
        solutionQuery: `SELECT c.first_name, c.last_name, c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL
ORDER BY c.last_name`,
        hint: "LEFT JOIN keeps all customers. Filter WHERE o.id IS NULL to find those with no matching order.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Products with Review Count",
        description:
          "Show all products with their review count (0 if none). Return `name`, `price`, and `review_count`. Order by review_count descending, then name.",
        difficulty: 4,
        solutionQuery: `SELECT p.name, p.price, COUNT(r.id) AS review_count
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.price
ORDER BY review_count DESC, p.name`,
        hint: "LEFT JOIN + COUNT(r.id) counts matching reviews — COUNT(r.id) returns 0 when there are no reviews (unlike COUNT(*) which would return 1).",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Employees with Manager Names",
        description:
          "Show all employees with their manager's full name. For employees without a manager, show NULL. Return `first_name`, `last_name`, `title`, and `manager_name`. Order by last name.",
        difficulty: 5,
        solutionQuery: `SELECT e.first_name, e.last_name, e.title,
       m.first_name || ' ' || m.last_name AS manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
ORDER BY e.last_name`,
        hint: "Self-join: join employees to themselves — alias one as 'e' (employee) and one as 'm' (manager).",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },
  {
    name: "RIGHT JOIN",
    slug: "right-join",
    description: "Include all rows from the right table, even when there's no match on the left.",
    level: "intermediate",
    orderIndex: 10,
    icon: "ArrowRight",
    challenges: [
      {
        title: "Suppliers Without Products",
        description:
          "Find suppliers that currently supply no products. Use a RIGHT JOIN between `product_suppliers` and `suppliers`. Return `supplier_id` (aliased from suppliers.id) and `name`. Order by name.",
        difficulty: 4,
        solutionQuery: `SELECT s.id AS supplier_id, s.name
FROM product_suppliers ps
RIGHT JOIN suppliers s ON ps.supplier_id = s.id
WHERE ps.product_id IS NULL
ORDER BY s.name`,
        hint: "RIGHT JOIN keeps all suppliers. WHERE ps.product_id IS NULL filters those with no product matches.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "All Departments with Employee Count",
        description:
          "Show all departments (even those with no employees), along with the employee count. Return `department_name` (departments.name) and `employee_count`. Order by employee_count descending.",
        difficulty: 5,
        solutionQuery: `SELECT d.name AS department_name, COUNT(e.id) AS employee_count
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY employee_count DESC`,
        hint: "RIGHT JOIN departments keeps all departments. COUNT(e.id) returns 0 for departments with no employees.",
        orderIndex: 2,
        validationType: "exact",
      },
    ],
  },
  {
    name: "FULL OUTER JOIN",
    slug: "full-outer-join",
    description: "Combine all rows from both tables, with NULLs where there's no match.",
    level: "intermediate",
    orderIndex: 11,
    icon: "Combine",
    challenges: [
      {
        title: "Products and Suppliers — Full Outer",
        description:
          "Using a FULL OUTER JOIN between `products` and `product_suppliers`, find any products without a supplier OR suppliers without any products. Return `product_id` (products.id), `product_name` (products.name), and `supplier_id` (product_suppliers.supplier_id). Show only rows where one side is NULL. Order by product_id NULLS LAST.",
        difficulty: 5,
        solutionQuery: `SELECT p.id AS product_id, p.name AS product_name, ps.supplier_id
FROM products p
FULL OUTER JOIN product_suppliers ps ON p.id = ps.product_id
WHERE p.id IS NULL OR ps.supplier_id IS NULL
ORDER BY p.id NULLS LAST`,
        hint: "FULL OUTER JOIN returns all rows from both sides. Filter WHERE one side IS NULL to find unmatched rows.",
        orderIndex: 1,
        validationType: "exact",
      },
    ],
  },
  {
    name: "HAVING",
    slug: "having",
    description: "Filter grouped results using HAVING after GROUP BY.",
    level: "intermediate",
    orderIndex: 12,
    icon: "SlidersHorizontal",
    challenges: [
      {
        title: "Busy Customers",
        description:
          "Find customers who have placed more than 1 order. Return `customer_id` and `order_count`, ordered by `order_count` descending.",
        difficulty: 3,
        solutionQuery: `SELECT customer_id, COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 1
ORDER BY order_count DESC`,
        hint: "HAVING filters after GROUP BY. Use HAVING COUNT(*) > 1 to keep only customers with more than one order.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Well-Reviewed Products",
        description:
          "Find products with an average rating above 4 and at least 2 reviews. Return `product_id` and `avg_rating` (rounded to 1 decimal), ordered by avg_rating descending.",
        difficulty: 4,
        solutionQuery: `SELECT product_id, ROUND(AVG(rating), 1) AS avg_rating
FROM reviews
GROUP BY product_id
HAVING AVG(rating) > 4 AND COUNT(*) >= 2
ORDER BY avg_rating DESC`,
        hint: "Combine multiple conditions in HAVING with AND.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Large Departments",
        description:
          "Find departments with an average employee salary above 80000 AND at least 3 employees. Return `department_id` and `avg_salary` (rounded to 2 decimal places), ordered by avg_salary descending.",
        difficulty: 5,
        solutionQuery: `SELECT department_id, ROUND(AVG(salary), 2) AS avg_salary
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 80000 AND COUNT(*) >= 3
ORDER BY avg_salary DESC`,
        hint: "HAVING can reference aggregate functions you didn't SELECT.",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },
  {
    name: "Subqueries",
    slug: "subqueries",
    description: "Use queries nested inside other queries.",
    level: "intermediate",
    orderIndex: 13,
    icon: "Braces",
    challenges: [
      {
        title: "Products Above Average Price",
        description:
          "Find all products priced above the average product price. Return `name` and `price`, ordered by price descending.",
        difficulty: 4,
        solutionQuery: `SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products)
ORDER BY price DESC`,
        hint: "A subquery in WHERE evaluates to a single value: WHERE price > (SELECT AVG(price) FROM ...).",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Customers Who Ordered",
        description:
          "Find all customers who have placed at least one order, using a subquery. Return `first_name`, `last_name`, and `email`. Order by last name.",
        difficulty: 4,
        solutionQuery: `SELECT first_name, last_name, email
FROM customers
WHERE id IN (SELECT DISTINCT customer_id FROM orders)
ORDER BY last_name`,
        hint: "Use WHERE id IN (subquery) to match IDs from another query.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Most Expensive per Category",
        description:
          "Find each category's most expensive product. Return `category_id`, `name`, and `price`. Order by category_id.",
        difficulty: 6,
        solutionQuery: `SELECT category_id, name, price
FROM products p
WHERE price = (
  SELECT MAX(price)
  FROM products
  WHERE category_id = p.category_id
)
ORDER BY category_id`,
        hint: "A correlated subquery references the outer query (p.category_id) to compute a per-group max.",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },
  {
    name: "UNION & Set Operations",
    slug: "union-set-operations",
    description: "Combine result sets using UNION, INTERSECT, and EXCEPT.",
    level: "intermediate",
    orderIndex: 14,
    icon: "GitMerge",
    challenges: [
      {
        title: "All Names in the System",
        description:
          "Create a combined list of all first names from both `customers` and `employees`. Use UNION (removes duplicates). Return a single column aliased `name`, ordered alphabetically.",
        difficulty: 4,
        solutionQuery: `SELECT first_name AS name FROM customers
UNION
SELECT first_name FROM employees
ORDER BY name`,
        hint: "UNION combines two SELECT results and removes duplicates. Columns must match in number and type.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Products Never Ordered",
        description:
          "Find products that have never appeared in any order. Use EXCEPT. Return `id` and `name`, ordered by id.",
        difficulty: 5,
        solutionQuery: `SELECT id, name FROM products
EXCEPT
SELECT p.id, p.name FROM products p
INNER JOIN order_items oi ON p.id = oi.product_id
ORDER BY id`,
        hint: "EXCEPT returns rows in the first query that don't exist in the second.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Cities with Both Customers and Employees",
        description:
          "Find cities that appear in both the `customers` table (city column) and the `employees` table (join to departments.location). Use INTERSECT. Return unique city names, ordered alphabetically.",
        difficulty: 6,
        solutionQuery: `SELECT city FROM customers
INTERSECT
SELECT d.location FROM employees e
INNER JOIN departments d ON e.department_id = d.id
ORDER BY city`,
        hint: "INTERSECT returns only rows that appear in both SELECT results.",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },
  {
    name: "CASE Expressions",
    slug: "case-expressions",
    description: "Add conditional logic to your queries with CASE WHEN.",
    level: "intermediate",
    orderIndex: 15,
    icon: "GitBranch",
    challenges: [
      {
        title: "Product Price Tier",
        description:
          "Categorize products into price tiers: 'Budget' (< 50), 'Mid-Range' (50-500), 'Premium' (> 500). Return `name`, `price`, and `tier`. Order by price.",
        difficulty: 4,
        solutionQuery: `SELECT name, price,
  CASE
    WHEN price < 50 THEN 'Budget'
    WHEN price BETWEEN 50 AND 500 THEN 'Mid-Range'
    ELSE 'Premium'
  END AS tier
FROM products
ORDER BY price`,
        hint: "CASE WHEN condition THEN result ... ELSE fallback END creates conditional columns.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Order Status Labels",
        description:
          "Show orders with a user-friendly status label: 'delivered' → 'Completed', 'shipped' → 'In Transit', 'processing' → 'Being Prepared', 'pending' → 'Waiting', 'cancelled' → 'Cancelled'. Return `id` and `status_label`. Order by id.",
        difficulty: 4,
        solutionQuery: `SELECT id,
  CASE status
    WHEN 'delivered' THEN 'Completed'
    WHEN 'shipped' THEN 'In Transit'
    WHEN 'processing' THEN 'Being Prepared'
    WHEN 'pending' THEN 'Waiting'
    WHEN 'cancelled' THEN 'Cancelled'
  END AS status_label
FROM orders
ORDER BY id`,
        hint: "CASE column WHEN value THEN result is a shorter form when you compare one column to multiple values.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Employee Salary Bands",
        description:
          "Count employees in each salary band: 'Junior' (< 70000), 'Mid' (70000-90000), 'Senior' (> 90000). Return `band` and `count`, ordered by count descending.",
        difficulty: 5,
        solutionQuery: `SELECT
  CASE
    WHEN salary < 70000 THEN 'Junior'
    WHEN salary BETWEEN 70000 AND 90000 THEN 'Mid'
    ELSE 'Senior'
  END AS band,
  COUNT(*) AS count
FROM employees
GROUP BY band
ORDER BY count DESC`,
        hint: "You can GROUP BY a CASE expression to count per category.",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },
  {
    name: "Date Functions",
    slug: "date-functions",
    description: "Extract, format, and calculate with date and timestamp values.",
    level: "intermediate",
    orderIndex: 16,
    icon: "Calendar",
    challenges: [
      {
        title: "Orders in January 2024",
        description:
          "Find all orders placed in January 2024. Return `id`, `status`, and `created_at`. Order by created_at.",
        difficulty: 3,
        solutionQuery: `SELECT id, status, created_at
FROM orders
WHERE EXTRACT(YEAR FROM created_at) = 2024
  AND EXTRACT(MONTH FROM created_at) = 1
ORDER BY created_at`,
        hint: "Use EXTRACT(YEAR FROM column) and EXTRACT(MONTH FROM column) to filter by date parts.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Delivery Time",
        description:
          "Calculate the delivery time in days for delivered orders. Return `id`, and `delivery_days` (difference between delivered_at and created_at). Order by delivery_days.",
        difficulty: 4,
        solutionQuery: `SELECT id,
  EXTRACT(DAY FROM (delivered_at - created_at)) AS delivery_days
FROM orders
WHERE delivered_at IS NOT NULL
ORDER BY delivery_days`,
        hint: "Subtract timestamps in PostgreSQL: delivered_at - created_at gives an INTERVAL. EXTRACT(DAY FROM interval) gets the days.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Employees Hired This Decade",
        description:
          "Find employees hired after 2019-12-31 (i.e., from 2020 onwards). Return `first_name`, `last_name`, `hire_date`. Order by hire_date.",
        difficulty: 3,
        solutionQuery: `SELECT first_name, last_name, hire_date
FROM employees
WHERE hire_date > '2019-12-31'
ORDER BY hire_date`,
        hint: "Compare DATE columns with string literals in 'YYYY-MM-DD' format.",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  //  ADVANCED
  // ═══════════════════════════════════════════════════════
  {
    name: "Window Functions",
    slug: "window-functions",
    description: "Compute values across rows related to the current row without collapsing them.",
    level: "advanced",
    orderIndex: 17,
    icon: "BarChart2",
    challenges: [
      {
        title: "Rank Products by Price",
        description:
          "Rank all products by price descending using RANK(). Return `name`, `price`, and `price_rank`. Order by price_rank.",
        difficulty: 6,
        solutionQuery: `SELECT name, price,
  RANK() OVER (ORDER BY price DESC) AS price_rank
FROM products
ORDER BY price_rank`,
        hint: "RANK() OVER (ORDER BY col DESC) assigns rank 1 to the highest value.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Rank Employees by Salary within Department",
        description:
          "Rank employees by salary descending within their department. Return `first_name`, `last_name`, `department_id`, `salary`, and `dept_rank`. Order by department_id, then dept_rank.",
        difficulty: 7,
        solutionQuery: `SELECT first_name, last_name, department_id, salary,
  RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_rank
FROM employees
ORDER BY department_id, dept_rank`,
        hint: "PARTITION BY divides the ranking within each group. RANK() restarts for each department.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Running Total of Order Revenue",
        description:
          "Compute a running total of `total_amount` ordered by `created_at`. Return `id`, `total_amount`, and `running_total`. Order by created_at.",
        difficulty: 7,
        solutionQuery: `SELECT id, total_amount,
  SUM(total_amount) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM orders
ORDER BY created_at`,
        hint: "SUM() OVER (ORDER BY col) computes a cumulative sum. Add ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for an explicit frame.",
        orderIndex: 3,
        validationType: "exact",
      },
      {
        title: "Previous and Next Order Amount",
        description:
          "For each order, show the previous order's total_amount (as `prev_amount`) and the next order's total_amount (as `next_amount`), ordered by id. NULL for the first/last rows is fine.",
        difficulty: 8,
        solutionQuery: `SELECT id, total_amount,
  LAG(total_amount) OVER (ORDER BY id) AS prev_amount,
  LEAD(total_amount) OVER (ORDER BY id) AS next_amount
FROM orders
ORDER BY id`,
        hint: "LAG() looks at the previous row, LEAD() looks at the next row in the window.",
        orderIndex: 4,
        validationType: "exact",
      },
    ],
  },
  {
    name: "CTEs (WITH clause)",
    slug: "ctes",
    description: "Write readable, reusable query blocks using Common Table Expressions.",
    level: "advanced",
    orderIndex: 18,
    icon: "FileCode",
    challenges: [
      {
        title: "Top Spending Customers via CTE",
        description:
          "Use a CTE to first calculate total spending per customer, then select customers who spent more than 1000. Return `customer_id` and `total_spent`. Order by total_spent descending.",
        difficulty: 6,
        solutionQuery: `WITH customer_spending AS (
  SELECT customer_id, SUM(total_amount) AS total_spent
  FROM orders
  GROUP BY customer_id
)
SELECT customer_id, total_spent
FROM customer_spending
WHERE total_spent > 1000
ORDER BY total_spent DESC`,
        hint: "WITH cte_name AS (query) defines a temporary named result set you can reference in the main query.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Department Salary vs Average",
        description:
          "Use two CTEs: one for average salary per department, one for total department headcount. Then show `department_id`, `avg_salary` (rounded to 2 dp), and `headcount`. Order by avg_salary descending.",
        difficulty: 7,
        solutionQuery: `WITH dept_avg AS (
  SELECT department_id, ROUND(AVG(salary), 2) AS avg_salary
  FROM employees
  GROUP BY department_id
),
dept_count AS (
  SELECT department_id, COUNT(*) AS headcount
  FROM employees
  GROUP BY department_id
)
SELECT a.department_id, a.avg_salary, c.headcount
FROM dept_avg a
JOIN dept_count c ON a.department_id = c.department_id
ORDER BY a.avg_salary DESC`,
        hint: "You can define multiple CTEs in one WITH clause, separated by commas.",
        orderIndex: 2,
        validationType: "exact",
      },
      {
        title: "Top Product per Category",
        description:
          "Use a CTE with RANK() to find the top-priced product in each category. Return `category_id`, `name`, and `price`. Order by category_id.",
        difficulty: 8,
        solutionQuery: `WITH ranked AS (
  SELECT category_id, name, price,
    RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS rk
  FROM products
)
SELECT category_id, name, price
FROM ranked
WHERE rk = 1
ORDER BY category_id`,
        hint: "Compute window functions inside a CTE, then filter in the outer query.",
        orderIndex: 3,
        validationType: "exact",
      },
    ],
  },
  {
    name: "Recursive CTEs",
    slug: "recursive-ctes",
    description: "Query hierarchical and graph-structured data using recursive CTEs.",
    level: "advanced",
    orderIndex: 19,
    icon: "GitFork",
    challenges: [
      {
        title: "Category Hierarchy",
        description:
          "Use a recursive CTE to list all categories with their hierarchy level (top-level = 1, children = 2). Return `id`, `name`, `parent_id`, and `level`. Order by level, then name.",
        difficulty: 7,
        solutionQuery: `WITH RECURSIVE cat_tree AS (
  -- Base case: top-level categories
  SELECT id, name, parent_id, 1 AS level
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: children
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  INNER JOIN cat_tree ct ON c.parent_id = ct.id
)
SELECT id, name, parent_id, level
FROM cat_tree
ORDER BY level, name`,
        hint: "WITH RECURSIVE has two parts: a base case (non-recursive) and a recursive case joined with UNION ALL.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Employee Reporting Chain",
        description:
          "Find all employees who directly or indirectly report to the CTO (employee id = 1). Use a recursive CTE. Return `id`, `first_name`, `last_name`, and `depth` (direct reports = 1, their reports = 2, etc.). Order by depth, then last_name.",
        difficulty: 8,
        solutionQuery: `WITH RECURSIVE reports AS (
  SELECT id, first_name, last_name, manager_id, 1 AS depth
  FROM employees
  WHERE manager_id = 1

  UNION ALL

  SELECT e.id, e.first_name, e.last_name, e.manager_id, r.depth + 1
  FROM employees e
  INNER JOIN reports r ON e.manager_id = r.id
)
SELECT id, first_name, last_name, depth
FROM reports
ORDER BY depth, last_name`,
        hint: "Start the recursion with direct reports (manager_id = 1), then recursively find their subordinates.",
        orderIndex: 2,
        validationType: "exact",
      },
    ],
  },
  {
    name: "Self Joins",
    slug: "self-joins",
    description: "Join a table to itself to compare rows or traverse hierarchies.",
    level: "advanced",
    orderIndex: 20,
    icon: "RefreshCw",
    challenges: [
      {
        title: "Employees and Their Managers",
        description:
          "Use a self-join to show each employee with their manager's name. Include employees with no manager (show NULL for manager). Return `employee_name` (e.first_name || ' ' || e.last_name) and `manager_name`. Order by employee_name.",
        difficulty: 6,
        solutionQuery: `SELECT
  e.first_name || ' ' || e.last_name AS employee_name,
  m.first_name || ' ' || m.last_name AS manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
ORDER BY employee_name`,
        hint: "Alias the same table twice: FROM employees e LEFT JOIN employees m ON e.manager_id = m.id.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Employees Earning More Than Their Manager",
        description:
          "Find employees who earn more than their direct manager. Return `employee_name`, `employee_salary`, `manager_name`, and `manager_salary`. Order by employee_name.",
        difficulty: 7,
        solutionQuery: `SELECT
  e.first_name || ' ' || e.last_name AS employee_name,
  e.salary AS employee_salary,
  m.first_name || ' ' || m.last_name AS manager_name,
  m.salary AS manager_salary
FROM employees e
INNER JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary
ORDER BY employee_name`,
        hint: "Use INNER JOIN (not LEFT JOIN) because employees without managers can't earn more than them.",
        orderIndex: 2,
        validationType: "exact",
      },
    ],
  },
  {
    name: "Correlated Subqueries",
    slug: "correlated-subqueries",
    description: "Write subqueries that reference the outer query for row-by-row computation.",
    level: "advanced",
    orderIndex: 21,
    icon: "Workflow",
    challenges: [
      {
        title: "Employees Above Department Average",
        description:
          "Find employees who earn more than the average salary in their own department. Return `first_name`, `last_name`, `department_id`, and `salary`. Order by department_id, then salary descending.",
        difficulty: 7,
        solutionQuery: `SELECT first_name, last_name, department_id, salary
FROM employees e
WHERE salary > (
  SELECT AVG(salary)
  FROM employees
  WHERE department_id = e.department_id
)
ORDER BY department_id, salary DESC`,
        hint: "The subquery references e.department_id from the outer query — it runs once per row, computing the average for that specific department.",
        orderIndex: 1,
        validationType: "exact",
      },
      {
        title: "Customers Who Ordered Every Month",
        description:
          "Find customers who placed at least one order in both January and February 2024. Use EXISTS or correlated subqueries. Return `customer_id`. Order by customer_id.",
        difficulty: 8,
        solutionQuery: `SELECT DISTINCT o1.customer_id
FROM orders o1
WHERE EXISTS (
  SELECT 1 FROM orders o2
  WHERE o2.customer_id = o1.customer_id
    AND EXTRACT(YEAR FROM o2.created_at) = 2024
    AND EXTRACT(MONTH FROM o2.created_at) = 1
)
AND EXISTS (
  SELECT 1 FROM orders o3
  WHERE o3.customer_id = o1.customer_id
    AND EXTRACT(YEAR FROM o3.created_at) = 2024
    AND EXTRACT(MONTH FROM o3.created_at) = 2
)
ORDER BY o1.customer_id`,
        hint: "EXISTS returns TRUE if the subquery returns any rows. Use two EXISTS clauses, one for each month.",
        orderIndex: 2,
        validationType: "exact",
      },
    ],
  },
  {
    name: "EXPLAIN & Query Performance",
    slug: "explain-performance",
    description: "Analyse query execution plans using EXPLAIN and EXPLAIN ANALYZE.",
    level: "advanced",
    orderIndex: 22,
    icon: "Gauge",
    challenges: [
      {
        title: "Explain a Simple Scan",
        description:
          "Run EXPLAIN (without ANALYZE) on a simple SELECT of all products. Write the EXPLAIN query that shows the execution plan for: SELECT * FROM products.",
        difficulty: 6,
        solutionQuery: "EXPLAIN SELECT * FROM products",
        hint: "Simply prepend EXPLAIN to any SELECT statement to see its plan.",
        orderIndex: 1,
        validationType: "count",
      },
      {
        title: "Explain a Filtered Query",
        description:
          "Use EXPLAIN to show the plan for selecting products where price > 1000. Write the full EXPLAIN query.",
        difficulty: 7,
        solutionQuery: "EXPLAIN SELECT * FROM products WHERE price > 1000",
        hint: "EXPLAIN works with any SELECT statement, including those with WHERE clauses.",
        orderIndex: 2,
        validationType: "count",
      },
    ],
  },
];

async function main() {
  console.log("Seeding topics and challenges...");

  // Clear existing data
  await db.delete(schema.userProgress);
  await db.delete(schema.challenges);
  await db.delete(schema.topics);

  for (const topicData of TOPICS) {
    const { challenges: challengeInputs, ...topicFields } = topicData;

    console.log(`  Creating topic: ${topicFields.name}`);
    const [topic] = await db
      .insert(schema.topics)
      .values(topicFields)
      .returning();

    for (const challenge of challengeInputs) {
      await db
        .insert(schema.challenges)
        .values({ ...challenge, topicId: topic.id });
    }
  }

  console.log("\n✅ Topics and challenges seeded successfully!");
  console.log(`   ${TOPICS.length} topics`);
  console.log(`   ${TOPICS.reduce((acc, t) => acc + t.challenges.length, 0)} challenges`);

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
