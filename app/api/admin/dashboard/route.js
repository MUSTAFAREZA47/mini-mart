import { getAuth } from "@clerk/nextjs/server"
import authAdmin from "@/middlewares/authAdmin"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"


// Get dashboard data for admin (total orders, total earnings, total products, total stores)
export async function GET(req) {
    try {
        const { userId } = getAuth(req)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        // total orders
        const orders = await prisma.order.count()
        // total products
        const products = await prisma.product.count()
        // total stores
        const stores = await prisma.store.count()
        // get all orders include only createdAt and total & claculated total revenue
        const allOrders = await prisma.order.findMany({
            select: {
                createdAt: true,
                total: true,
            },
        })

        let totalRevenue = 0
        allOrders.forEach(order => {
            totalRevenue += order.total
        })

        const revenue = totalRevenue.toFixed(2)

        const dashboardData = {
            orders,
            products,
            stores,
            revenue,
            allOrders,
        }
        

        return NextResponse.json({ dashboardData }, { status: 200 })
    }

    catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 500 })
    }
}