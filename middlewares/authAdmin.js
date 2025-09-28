import { clerkClient } from '@clerk/nextjs/server'

const authAdmin = async (userId) => {
    try {
        if (!userId) {
            return new Response('Unauthorized', { status: 401 })
        }

        const client = await clerkClient()
        const user = await client.users.getUser(userId)

        return process.env.ADMIN_EMAILS.split(',').includes(user.emailAddresses[0].emailAddress) || false
    } catch (error) {
        console.log(error)
        return new Response('Unauthorized', { status: 401 })
        return false
    }
}

export default authAdmin;