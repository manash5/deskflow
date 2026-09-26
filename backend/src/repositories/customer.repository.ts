import { sql } from "../db/neon";
import { mapCustomer } from "../db/mappers";
import { Customer } from "../models/customer.model";

export const customerRepository = {
  async list(): Promise<Customer[]> {
    const rows = await sql`
      SELECT id, name, email, company, notes, created_at, updated_at
      FROM customers
      ORDER BY created_at DESC
    `;
    return rows.map(mapCustomer);
  },

  async findById(id: string): Promise<Customer | undefined> {
    const rows = await sql`
      SELECT id, name, email, company, notes, created_at, updated_at
      FROM customers
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ? mapCustomer(rows[0]) : undefined;
  },

  async save(customer: Customer): Promise<Customer> {
    await sql`
      INSERT INTO customers (id, name, email, company, notes, created_at, updated_at)
      VALUES (
        ${customer.id},
        ${customer.name},
        ${customer.email},
        ${customer.company},
        ${customer.notes},
        ${customer.createdAt},
        ${customer.updatedAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        company = EXCLUDED.company,
        notes = EXCLUDED.notes,
        updated_at = EXCLUDED.updated_at
    `;
    return customer;
  },

  async remove(id: string): Promise<void> {
    await sql`DELETE FROM customers WHERE id = ${id}`;
  },
};
