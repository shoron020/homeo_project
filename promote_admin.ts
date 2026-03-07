import { PrismaClient } from "./generated/prisma/index.js";
const db = new PrismaClient();
async function main() {
  const user = await db.user.update({
    where: { email: "admin@admin.com" },
    data: { role: "ADMIN" }
  });
  console.log("Successfully promoted user to ADMIN:", user.email);
}
main().catch(console.error).finally(() => db.$disconnect());
