import { neon } from "@neondatabase/serverless";
import { config } from "../config/env";

if (!config.neonDbUrl) {
  throw new Error(
    "Missing NEON_DB_URL. Add the Neon connection string to backend/.env.",
  );
}

export const sql = neon(config.neonDbUrl);

export async function pingDb() {
  const rows = await sql`SELECT 1 AS ok`;
  return Boolean(rows.length);
}
