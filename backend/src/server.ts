import { createApp } from "./app";
import { config } from "./config/env";
import { seedIfEmpty } from "./services/seed.service";

async function main() {
  await seedIfEmpty();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Deskflow API listening on http://127.0.0.1:${config.port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
