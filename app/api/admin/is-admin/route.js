import { getAuth } from "@clerk/nextjs/server"
import authAdmin from "@/middlewares/authAdmin"
import { NextResponse } from "next/server"


// Auth Admin
export async function GET(req) {
    try {
        const { userId } = getAuth(req)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json( {error: 'Unauthorized'}, { status: 401 })
        }

        return NextResponse.json({ isAdmin }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: error.code || error.message }, { status: 500 })
    }
}