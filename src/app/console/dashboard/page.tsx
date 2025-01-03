"use client"

import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { getInteractionCounts, getInteractions, getIssues } from "./actions"
import { useProject } from "../ProjectContext"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Link from "next/link"
import { Pagination } from "@/components/ui/pagination"


export default function DashboardPage() {
    const [stats, setStats] = useState<any>({
        interactionsCount: 0,
        satisfactionRatio: 0,
        issuesCount: 0,
        useCasesCount: 0,
        topicsCount: 0
    })
    const [interactions, setInteractions] = useState<any[]>([])
    const [issues, setIssues] = useState<any[]>([])
    const { currentProject } = useProject()
    const [page, setPage] = useState<number>(1)
    const [pageCount, setPageCount] = useState<number>(0)

    useEffect(() => {
        if (currentProject) {
            loadCards(currentProject)
        }
    }, [currentProject])

    useEffect(() => {
        if (currentProject) {
            loadPage(currentProject)
        }
    }, [page, currentProject])

    const loadCards = async (projectId: string) => {
        const dashboardStats = await getInteractionCounts(projectId)
        const issuesList = await getIssues(projectId)
        setStats(dashboardStats)
        setIssues(issuesList)
    }

    const loadPage = async (projectId: string) => {
        const interactionsList = await getInteractions(projectId, page)
        setInteractions(interactionsList.interactions)
        setPageCount(interactionsList.pageCount)
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage - 1)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <Separator />
            <div>
                <h1 className="font-semibold my-2">Stats</h1>
                <div className="w-full flex gap-5">
                    <Card className="w-1/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.interactionsCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="w-1/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.issuesCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="w-1/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Use Cases</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.useCasesCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="w-1/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.topicsCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="w-1/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.satisfactionRatio}%</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Separator />
            <div>
                <div className="flex items-center gap-5 mb-5">
                    <h1>Issues</h1>
                    <Link className="underline text-sm text-blue-500" href="/console/issues">View all</Link>
                </div>
                <div className="min-h-[15vh]">
                    <Carousel className="w-full gap-5">
                        <CarouselContent>
                            {issues.map((issue: any) => (
                                <CarouselItem key={issue.id} className="basis-1/5">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">{issue.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-gray-500">{issue.description}</div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                    {issues.length === 0 && <div className="text-sm text-gray-500">No issues found</div>}
                </div>
            </div>
            <Separator />
            <div>
                <div className="flex items-center gap-5 mb-5">
                    <h1>Interactions</h1>
                    <Link className="underline text-sm text-blue-500" href="/console/interactions">View all</Link>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Input</TableHead>
                            <TableHead>Output</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interactions.map((interaction) => (
                            <TableRow key={interaction.id}>
                                <TableCell>{interaction.event.name}</TableCell>
                                <TableCell>{interaction.input}</TableCell>
                                <TableCell>{interaction.output}</TableCell>
                                <TableCell>{new Date(interaction.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        {interactions.length === 0 && <TableRow><TableCell colSpan={4}>No interactions found</TableCell></TableRow>}
                    </TableBody>
                </Table>

                <div className="flex justify-end mt-10">
                    <Pagination
                        currentPage={page}
                        totalPages={pageCount + 1}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

        </div>
    )
}
