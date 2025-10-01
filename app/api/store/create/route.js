import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { imagekit } from '@/configs/imagekit'

// Create a store
export async function POST(req) {
    try {
        const { userId } = getAuth(req)

        if (!userId) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 },
            )
        }

        const formData = await req.formData()

        // get the data from the form
        const name = formData.get('name')
        const description = formData.get('description')
        const username = formData.get('username')
        const address = formData.get('address')
        const email = formData.get('email')
        const contact = formData.get('contact')
        const image = formData.get('image')

        // check if all fields are required
        if (
            !name ||
            !description ||
            !username ||
            !address ||
            !email ||
            !contact ||
            !image
        ) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 },
            )
        }

        // Ensure user exists in database, create if not exists
        let user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            // Get user data from Clerk to create the user
            const { currentUser } = await import('@clerk/nextjs/server')
            const clerkUser = await currentUser()

            if (!clerkUser) {
                return NextResponse.json(
                    { error: 'User not authenticated' },
                    { status: 401 },
                )
            }

            // Create user in database
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: `${clerkUser.firstName || ''} ${
                        clerkUser.lastName || ''
                    }`.trim(),
                    image: clerkUser.imageUrl,
                },
            })
        }

        // check if the user has a store already registered a store
        const existingStore = await prisma.store.findFirst({
            where: { userId: userId },
        })
        if (existingStore) {
            return NextResponse.json(
                { error: 'You already have a store registered' },
                { status: existingStore.status },
            )
        }

        // check is username is already taken
        const existingUsername = await prisma.store.findFirst({
            where: { username: username.toLowerCase() },
        })
        if (existingUsername) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 400 },
            )
        }

        // upload image to imagekit
        const buffer = Buffer.from(await image.arrayBuffer())
        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: 'logos',
        })

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: 'auto' },
                { format: 'webp' },
                { width: '512' },
            ],
        })

        // create a store
        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                address,
                email,
                contact,
                logo: optimizedImage,
            },
        })

        // link store to user
        await prisma.user.update({
            where: { id: userId },
            data: { store: { connect: { id: newStore.id } } },
        })

        return NextResponse.json(
            { message: 'Applied, waiting for approval' },
            { status: 200 },
        )
    } catch (error) {
        console.log('Store creation error:', error)

        // Handle specific Prisma errors
        if (error.code === 'P2003') {
            return NextResponse.json(
                {
                    error: 'Invalid user reference. Please try logging in again.',
                },
                { status: 400 },
            )
        }

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Store username already exists' },
                { status: 400 },
            )
        }

        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 },
        )
    }
}

// check is user have already registered a store if yes then send the status of the store
export async function GET(req) {
    try {
        const { userId } = getAuth(req)

        // check if the user has a store already registered a store
        const existingStore = await prisma.store.findFirst({
            where: { userId: userId },
        })

        // if the user has a store already registered a store then send the status of the store
        if (existingStore) {
            return NextResponse.json(
                { error: 'You already have a store registered' },
                { status: existingStore.status },
            )
        }

        // if the user has not registered a store then send the message that you have not registered a store
        return NextResponse.json(
            { message: 'You have not registered a store' },
            { status: 200 },
        )
    } catch (error) {
        console.log('Store status check error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 },
        )
    }
}
