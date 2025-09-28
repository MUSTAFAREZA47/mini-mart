import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { imagekit } from '@/configs/imagekit'


// Create a store
export async function POST(req) {
    try {
        const { userId } = getAuth(req)
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
       const buffer = Buffer.from(await image.arrayBuffer());
       const response = await imagekit.upload({
        file: buffer,
        fileName: image.name,
        folder: 'logos',
       })

       const optimizedImage = imagekit.url({
        path: response.filePath,
        transformation: [
            {quality: "auto"},
            {format: "webp"},
            {width: "512"}
        ]
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

       return NextResponse.json({ message: 'Applied, waiting for approval' }, { status: 200 })
       
       
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code }, { status: 400 })
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
        return NextResponse.json({ message: 'You have not registered a store' }, { status: 200 })
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code }, { status: 400 })
    }
}