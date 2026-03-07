import { PrismaClient } from "./generated/prisma/index.js";
const db = new PrismaClient();
async function main() {
  const accounts = await db.account.findMany();
  console.log(JSON.stringify(accounts, null, 2));
}
main().catch(console.error).finally(() => db.$disconnect());
