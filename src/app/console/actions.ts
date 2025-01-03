'use server'

import { prisma } from '@/lib/prisma'
import { getAuthToken } from '@/lib/auth'

export async function fetchProjects() {
    const { organizationId } = await getAuthToken()
    return await prisma.project.findMany({
        where: { organizationId },
        select: { id: true, name: true }
    })
}

export async function addProject({ name }: { name: string; }) {
    const { organizationId } = await getAuthToken()
    return await prisma.project.create({
        data: {
            name,
            organizationId,
        }
    })
}

export async function checkAuth() {
    const { organizationId, userId } = await getAuthToken()
    if (organizationId && userId) {
        return true
    }
    return false
}