import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Get store info and store product
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const username = searchParams.get('username').toLowerCase()

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 },
            )
        }

        // Get info and inStock products with ratings
        const store = await prisma.store.findUnique({
            where: { username, isActive: true },
            include: {
                products: {
                    where: { inStock: true },
                    include: { rating: true },
                },
            },
        })

        if (!store) {
            return NextResponse.json(
                { error: 'Store not found' },
                { status: 404 },
            )
        }

        return NextResponse.json({ store }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 },
        )
    }
}
