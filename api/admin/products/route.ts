import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await db.product.findMany({
    include: { category: true, _count: { select: { orderItems: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as { name: string; slug: string; categoryId: string; potency?: string; indications?: string; dosage?: string; ingredients?: string; directions?: string; price: number; stock: number; image?: string; isFeatured?: boolean };
  const product = await db.product.create({ data: body, include: { category: true } });
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, ...data } = await req.json() as { id: string; [key: string]: unknown };
  const product = await db.product.update({ where: { id }, data, include: { category: true } });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json() as { id: string };
  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
