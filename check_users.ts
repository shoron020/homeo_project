import { PrismaClient } from "./generated/prisma/index.js";
const db = new PrismaClient();
async function main() {
  const users = await db.user.findMany();
  console.log(JSON.stringify(users, null, 2));
}
main().catch(console.error).finally(() => db.$disconnect());
