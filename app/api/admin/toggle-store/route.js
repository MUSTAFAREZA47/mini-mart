import { getAuth } from '@clerk/nextjs/server'
import authAdmin from '@/middlewares/authAdmin'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// toggle store isActive
export async function POST(req) {
    try {
        const { userId } = getAuth(req)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { storeId } = await req.json()

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 })
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: {
                user: true,
            },
        })

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        }

        await prisma.store.update({
            where: { id: storeId },
            data: { isActive: !store.isActive },
        })

        return NextResponse.json({ message: 'Store isActive toggled successfully' }, { status: 200 })
        
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 500 },
        )
    }
}
