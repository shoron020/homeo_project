import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

// Admin: GET all orders, PUT update order status + push tracking
export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await db.order.findMany({
    include: { user: { select: { name: true, email: true } }, items: { include: { product: true } }, trackingEvents: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as { orderId: string; status: string; note?: string };
  const [order] = await Promise.all([
    db.order.update({ where: { id: body.orderId }, data: { status: body.status } }),
    db.orderTracking.create({ data: { orderId: body.orderId, status: body.status, note: body.note } }),
  ]);
  return NextResponse.json(order);
}
