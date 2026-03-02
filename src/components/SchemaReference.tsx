"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Database } from "lucide-react";

interface Column {
  name: string;
  type: string;
  note?: string;
}

interface TableSchema {
  name: string;
  columns: Column[];
}

const TABLES: TableSchema[] = [
  {
    name: "products",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "name", type: "varchar(200)" },
      { name: "description", type: "text" },
      { name: "price", type: "numeric(10,2)" },
      { name: "stock_quantity", type: "integer" },
      { name: "category_id", type: "integer", note: "FK→categories" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "categories",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "name", type: "varchar(100)" },
      { name: "parent_id", type: "integer", note: "FK→categories" },
    ],
  },
  {
    name: "customers",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "first_name", type: "varchar(100)" },
      { name: "last_name", type: "varchar(100)" },
      { name: "email", type: "varchar(255)" },
      { name: "city", type: "varchar(100)" },
      { name: "country", type: "varchar(100)" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "orders",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "customer_id", type: "integer", note: "FK→customers" },
      { name: "status", type: "varchar(50)" },
      { name: "total_amount", type: "numeric(10,2)" },
      { name: "created_at", type: "timestamptz" },
      { name: "shipped_at", type: "timestamptz" },
      { name: "delivered_at", type: "timestamptz" },
    ],
  },
  {
    name: "order_items",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "order_id", type: "integer", note: "FK→orders" },
      { name: "product_id", type: "integer", note: "FK→products" },
      { name: "quantity", type: "integer" },
      { name: "unit_price", type: "numeric(10,2)" },
    ],
  },
  {
    name: "employees",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "first_name", type: "varchar(100)" },
      { name: "last_name", type: "varchar(100)" },
      { name: "email", type: "varchar(255)" },
      { name: "department_id", type: "integer", note: "FK→departments" },
      { name: "manager_id", type: "integer", note: "FK→employees" },
      { name: "salary", type: "numeric(10,2)" },
      { name: "hire_date", type: "date" },
      { name: "title", type: "varchar(100)" },
    ],
  },
  {
    name: "departments",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "name", type: "varchar(100)" },
      { name: "budget", type: "numeric(12,2)" },
      { name: "location", type: "varchar(100)" },
    ],
  },
  {
    name: "suppliers",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "name", type: "varchar(200)" },
      { name: "country", type: "varchar(100)" },
      { name: "contact_email", type: "varchar(255)" },
      { name: "rating", type: "numeric(3,1)" },
    ],
  },
  {
    name: "product_suppliers",
    columns: [
      { name: "product_id", type: "integer", note: "FK→products" },
      { name: "supplier_id", type: "integer", note: "FK→suppliers" },
      { name: "unit_cost", type: "numeric(10,2)" },
    ],
  },
  {
    name: "reviews",
    columns: [
      { name: "id", type: "serial", note: "PK" },
      { name: "product_id", type: "integer", note: "FK→products" },
      { name: "customer_id", type: "integer", note: "FK→customers" },
      { name: "rating", type: "integer" },
      { name: "comment", type: "text" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
];

function TableRow({ table }: { table: TableSchema }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-800 transition-colors text-left"
      >
        {open ? (
          <ChevronDown className="h-3 w-3 text-neutral-500 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 text-neutral-500 shrink-0" />
        )}
        <span className="font-mono text-xs text-blue-300">{table.name}</span>
      </button>
      {open && (
        <div className="ml-5 mb-1 space-y-0.5">
          {table.columns.map((col) => (
            <div key={col.name} className="flex items-center gap-2 py-0.5 px-2">
              <span className="font-mono text-xs text-neutral-300">{col.name}</span>
              <span className="font-mono text-xs text-neutral-600">{col.type}</span>
              {col.note && (
                <span className="text-xs text-amber-600/80">{col.note}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SchemaReference() {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-2">
        <Database className="h-3.5 w-3.5 text-neutral-500" />
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Schema Reference
        </span>
      </div>
      <div className="space-y-0.5">
        {TABLES.map((table) => (
          <TableRow key={table.name} table={table} />
        ))}
      </div>
    </div>
  );
}
