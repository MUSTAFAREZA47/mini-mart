import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import authSeller from '@/middlewares/authSeller'
import { imagekit } from '@/configs/imagekit'


// add a product
export async function POST(req) {
    try {
        const { userId } = getAuth(req)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'You are not authorized to add a product' }, { status: 401 })
        }
        // get the data from the form
        const formData = await req.formData()

        const name = formData.get('name')
        const description = formData.get('description')
        const mrp = Number(formData.get('mrp'))
        const price = Number(formData.get('price'))
        const category = formData.get('category')
        const images = formData.getAll('images')

        // check if all fields are required
        if (!name || !description || !mrp || !price || !category || !images.length < 1) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        // upload images to imagekit
        const imageUrl = await Promise.all(images.map(async (image) => {
            const buffer = Buffer.from(await image.arrayBuffer())
            const response = await imagekit.upload({
                file: buffer,
                fileName: image.name,
                folder: 'products',
            })

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: "auto"},
                    {format: "webp"},
                    {width: "512"}
                ]
            })

            return url;
        }))

        await prisma.product.create({
            data: {
                name,
                description,
                mrp,
                price,
                category,
                images: imageUrl,
                storeId,
            }
        })

        return NextResponse.json({ message: 'Product added successfully' }, { status: 200 })
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code }, { status: 400 })
    }
}

// get all products for a seller
export async function GET(req) {
    try {
        const { userId } = getAuth(req)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'You are not authorized to get products' }, { status: 401 })
        }

        const products = await prisma.product.findMany({
            where: { storeId },
        })

        return NextResponse.json({ products }, { status: 200 })
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code }, { status: 400 })
    }
}