'use server'

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

export async function loginUser(email: string) {

    if(!email) {
        throw new Error("no email found")
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await prisma.user.update({
        where: { email },
        data: { otp },
    })

    const emailResult = await sendEmail(
        email,
        'Your Login OTP',
        `Your OTP is: ${otp}. It will expire in 10 minutes.`
    )

    if (!emailResult.success) {
        console.error('Failed to send email:', emailResult.error)
        return { success: false, error: 'Failed to send OTP email' }
    }

    return { success: true }
}

export async function verifyOTP(email: string, otp: string) {
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (user && user.otp === otp) {
        await prisma.user.update({
            where: { email },
            data: { otp: null }
        })

        const member = await prisma.member.findFirstOrThrow({
            where: { userId: user.id },
        })

        // Generate JWT token
        const token = sign({ userId: user.id, organizationId: member.organizationId }, process.env.JWT_SECRET || "", { expiresIn: '1d' })

        // Set cookie
        let store = await cookies()
        
        store.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 day
            path: '/',
        })

        return { success: true }
    }

    return { success: false }
}

