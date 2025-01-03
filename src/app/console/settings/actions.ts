'use server'

import { prisma } from '@/lib/prisma'
import { getAuthToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

export async function getCurrentOrganization() {
    const { userId, organizationId } = await getAuthToken()

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            members: {
                include: {
                    organization: true,
                },
            },
        },
    })

    if (!user) {
        throw new Error('User not found')
    }

    const currentOrganization = user.members.find(
        (member) => member.organizationId === organizationId
    )?.organization

    if (!currentOrganization) {
        throw new Error('Current organization not found')
    }

    const organizations = user.members.map((member) => member.organization)

    return { user, currentOrganization, organizations }
}


export async function updateUserName(name: string) {
    const { userId } = await getAuthToken()
    await prisma.user.update({
        where: { id: userId },
        data: { name },
    })
}

export async function updateOrganizationName(name: string) {
    const { organizationId } = await getAuthToken()
    await prisma.organization.update({
        where: { id: organizationId },
        data: { name },
    })
}

export async function addOrganization(name: string) {
    const { userId } = await getAuthToken()
    const newOrganization = await prisma.organization.create({
        data: { name },
    })
    await prisma.member.create({
        data: {
            userId,
            organizationId: newOrganization.id,
            role: 'ADMIN',
        },
    })
    return newOrganization
}

export async function switchOrganization(organizationId: string) {
    const { userId } = await getAuthToken()

    // Check if the user is a member of the organization
    const member = await prisma.member.findFirst({
        where: {
            userId,
            organizationId,
        },
    })

    if (!member) {
        throw new Error('User is not a member of this organization')
    }

    // Generate new JWT token with the new organizationId
    const token = sign({ userId, organizationId }, process.env.JWT_SECRET || '', { expiresIn: '1d' })

    // Set new cookie
    let store = await cookies()

    store.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400, // 1 day
        path: '/',
    })
}
