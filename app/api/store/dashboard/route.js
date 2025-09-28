import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import authSeller from "@/middlewares/authSeller"


// Get dashboard data for seller (total orders, total earnings, total products, total ratings)
export async function GET(req) {
    try {
        const { userId } = getAuth(req)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'You are not authorized to access this page' }, { status: 401 })
        }
        
        //Get all orders for seller
        const orders = await prisma.order.findMany({
            where: { storeId },
        })

        //Get all products with ratings for seller
        const products = await prisma.product.findMany({
            where: { storeId },
        })

        const ratings = await prisma.rating.findMany({
            where: { productId: { in: products.map(product => product.id) } },
            include: { user: true, product: true },
        })

        const dashboardData = {
            ratings,
            totalOrders: orders.length,
            totalProducts: products.length,
            totalEarnings: Math.round(orders.reduce((acc, order) => acc + order.total, 0)),
            totalProducts: products.length,
        }

        return NextResponse.json({ dashboardData }, { status: 200 })
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}