import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import authSeller from "@/middlewares/authSeller"
import prisma from "@/lib/prisma"


// Authorize a seller
export async function GET(req) {
    try {
        const { userId } = getAuth(req)
        const isSeller = await authSeller(userId)

        if (!isSeller) {
            return NextResponse.json({ error: 'You are not authorized to access this page' }, { status: 401 })
        }

        const storeInfo = await prisma.store.findUnique({
            where: { userId },
        })

        return NextResponse.json({ isSeller, storeInfo }, { status: 200 })
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}