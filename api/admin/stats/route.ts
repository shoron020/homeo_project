import { NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalBlogs,
    totalCategories,
    totalReviews,
    pendingOrders,
    lowStockProducts,
    revenueAgg,
  ] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count(),
    db.blogPost.count(),
    db.category.count(),
    db.review.count(),
    db.order.count({ where: { status: { in: ["PLACED", "CONFIRMED", "PROCESSING"] } } }),
    db.product.count({ where: { stock: { lt: 10 } } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
  ]);

  return NextResponse.json({
    totalProducts,
    totalOrders,
    totalUsers,
    totalBlogs,
    totalCategories,
    totalReviews,
    pendingOrders,
    lowStockProducts,
    totalRevenue: revenueAgg._sum.total ?? 0,
  });
}
