import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config";

const credentials = readConfig();
export default defineConfig({
  schema: "src/lib/db/schema.ts",
  out: "src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: credentials.dbUrl,
  },
});