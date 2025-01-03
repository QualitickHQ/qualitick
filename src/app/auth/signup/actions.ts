'use server'

import { prisma } from '@/lib/prisma'

export async function signupUser(data: { name: string, email: string, organizationName: string }) {
    try {
        await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: data.organizationName,
                },
            })

            const user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                },
            })

            await tx.member.create({
                data: {
                    organizationId: organization.id,
                    userId: user.id,
                    role: "ADMIN",
                },
            })

            await tx.project.create({
                data: {
                    name: "Default Project",
                    organizationId: organization.id
                },
            })
        })
        return { success: true }
    } catch (error) {
        console.error('Signup error:', error)
        return { success: false }
    }
}
