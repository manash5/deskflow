import { createApp } from "./app";
import { config } from "./config/env";
import { pingDb } from "./db/neon";
import { ensureSchema } from "./db/schema";
import { seedIfEmpty } from "./services/seed.service";

async function main() {
  await ensureSchema();
  const connected = await pingDb();
  if (!connected) {
    throw new Error("Could not reach Neon.");
  }
  await seedIfEmpty();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Deskflow API listening on http://127.0.0.1:${config.port}`);
    console.log("Neon Postgres connected.");
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
