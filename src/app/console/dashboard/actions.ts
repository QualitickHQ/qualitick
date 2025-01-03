"use server"

import { getAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getInteractionCounts(projectId: string) {
    const { organizationId } = await getAuthToken()

    // Get all counts in parallel for better performance
    const [
        interactionsCount,
        useCasesCount,
        issuesCount,
        topicsCount,
    ] = await Promise.all([
        prisma.interaction.count({
            where: { projectId, organizationId }
        }),
        prisma.useCase.count({
            where: { projectId, organizationId }
        }),
        prisma.issue.count({
            where: { projectId, organizationId }
        }),
        prisma.topic.count({
            where: { projectId, organizationId }
        })
    ])

    // Calculate satisfaction ratio
    const satisfactionRatio = interactionsCount > 0
        ? (((useCasesCount / interactionsCount) - (issuesCount / interactionsCount)) / interactionsCount) * 100
        : 0

    return {
        interactionsCount,
        satisfactionRatio,
        issuesCount,
        useCasesCount,
        topicsCount
    }
}

export async function getIssues(projectId: string, count: number = 10) {

    const { organizationId } = await getAuthToken()

    const issues = await prisma.issue.findMany({
        where: { projectId, organizationId },
        take: count,
        orderBy: { createdAt: 'desc' },
    })

    return issues
}

export async function getInteractions(projectId: string, page: number = 1, pageSize: number = 10) {
    const { organizationId } = await getAuthToken()

    const interactionsCount = await prisma.interaction.count({
        where: { projectId, organizationId }
    })

    const interactions = await prisma.interaction.findMany({
        where: {
            projectId,
            organizationId
        },
        include: {
            event: true
        },
        take: pageSize,
        skip: page * pageSize,
        orderBy: { createdAt: 'desc' }
    })

    return {
        interactions,
        pageCount: Math.ceil(interactionsCount / pageSize)
    }
}
