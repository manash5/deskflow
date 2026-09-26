import { sql } from "../db/neon";
import { mapAdmin } from "../db/mappers";
import { Admin } from "../models/admin.model";

export const adminRepository = {
  async findByEmail(email: string): Promise<Admin | undefined> {
    const rows = await sql`
      SELECT id, email, name, password_hash, created_at
      FROM admins
      WHERE lower(email) = ${email.toLowerCase()}
      LIMIT 1
    `;
    return rows[0] ? mapAdmin(rows[0]) : undefined;
  },

  async findById(id: string): Promise<Admin | undefined> {
    const rows = await sql`
      SELECT id, email, name, password_hash, created_at
      FROM admins
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ? mapAdmin(rows[0]) : undefined;
  },

  async upsert(admin: Admin): Promise<Admin> {
    await sql`
      INSERT INTO admins (id, email, name, password_hash, created_at)
      VALUES (
        ${admin.id},
        ${admin.email},
        ${admin.name},
        ${admin.passwordHash},
        ${admin.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash
    `;
    return admin;
  },
};
