import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as { name: string; slug: string; description?: string; image?: string };
  const category = await db.category.create({ data: body, include: { _count: { select: { products: true } } } });
  return NextResponse.json(category, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, ...data } = await req.json() as { id: string; [key: string]: unknown };
  const category = await db.category.update({ where: { id }, data, include: { _count: { select: { products: true } } } });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json() as { id: string };

  // Don't allow deletion if category has products
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0)
    return NextResponse.json({ error: `Cannot delete: ${count} product(s) use this category` }, { status: 409 });

  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
