import { createAdminClient, syncGelatoCatalog } from "@pixora/api";
import { createGelatoClient } from "@pixora/providers";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), "apps/admin/.env.local") });
config({ path: resolve(process.cwd(), "packages/providers/.env") });
config({ path: resolve(process.cwd(), "packages/api/.env") });

const gelato = createGelatoClient();
const admin = createAdminClient();

if (!gelato || !admin) {
  console.error("Missing GELATO_API_KEY or Supabase admin config.");
  process.exit(1);
}

const result = await syncGelatoCatalog(admin, gelato);
console.log(JSON.stringify(result, null, 2));
