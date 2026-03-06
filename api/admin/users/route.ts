import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      loyaltyPoints: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, role } = await req.json() as { id: string; role: string };
  const user = await db.user.update({ where: { id }, data: { role } });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json() as { id: string };

  // Prevent self-deletion
  if (id === session.user.id)
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });

  await db.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
