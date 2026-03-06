import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reviews = await db.review.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json() as { id: string };
  await db.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
