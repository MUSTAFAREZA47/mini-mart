

// toggle the stock of a product
export async function POST(req) {
    try {
        const { userId } = getAuth(req)
        const { productId } = await req.json()

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
        }

        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'You are not authorized to toggle the stock of a product' }, { status: 401 })
        }

        // check if the product exists
        const product = await prisma.product.findFirst({
            where: { id: productId, storeId },
        })

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // toggle the stock of the product
        await prisma.product.update({
            where: { id: productId },
            data: { inStock: !product.inStock },
        })

        return NextResponse.json({ message: 'Stock toggled successfully' }, { status: 200 })
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.code }, { status: 400 })
    }
}