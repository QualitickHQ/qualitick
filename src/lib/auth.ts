import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'

interface DecodedToken {
    userId: string
    organizationId: string
}

export async function getAuthToken(): Promise<DecodedToken> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')

    if (!token) {
        redirect('/auth/login')
    }

    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET as string) as DecodedToken
        return decoded
    } catch (error) {
        console.error('Invalid token:', error)
        redirect('/auth/login')
    }
}
