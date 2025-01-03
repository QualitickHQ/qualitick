'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateUserName, updateOrganizationName, addOrganization, switchOrganization, getCurrentOrganization } from './actions'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type Organization = {
    id: string
    name: string
}

export default function SettingsPage() {
    const [userName, setUserName] = useState('')
    const [organizationName, setOrganizationName] = useState('')
    const [newOrganizationName, setNewOrganizationName] = useState('')
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [currentOrganizationId, setCurrentOrganizationId] = useState<string>('')
    const { toast } = useToast()

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCurrentOrganization()
            setUserName(data.user.name || '')
            setOrganizationName(data.currentOrganization.name)
            setOrganizations(data.organizations)
            setCurrentOrganizationId(data.currentOrganization.id)
        }
        fetchData()
    }, [])

    const handleUpdateUserName = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateUserName(userName)
        toast({
            title: "Success",
            description: "User name updated successfully",
        })
    }

    const handleUpdateOrganizationName = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateOrganizationName(organizationName)
        toast({
            title: "Success",
            description: "Organization name updated successfully",
        })
    }

    const handleAddOrganization = async (e: React.FormEvent) => {
        e.preventDefault()
        const newOrg = await addOrganization(newOrganizationName)
        setOrganizations([...organizations, newOrg])
        setNewOrganizationName('')
        toast({
            title: "Success",
            description: "New organization added successfully",
        })
    }

    const handleSwitchOrganization = async (organizationId: string) => {
        await switchOrganization(organizationId)
        window.location.reload()
    }

    return (
        <div className="space-y-5">
            <h1 className="text-xl font-semibold">Settings</h1>
            <Separator />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateUserName} className='flex flex-col gap-2'>
                            <Label>User Name</Label>
                            <Input
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="User Name"
                            />
                            <Button className='w-fit' type="submit">Update Name</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Organization Settings</CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-5'>
                        <form onSubmit={handleUpdateOrganizationName} className="flex flex-col gap-2">
                            <Label>Organization Name</Label>
                            <Input
                                value={organizationName}
                                onChange={(e) => setOrganizationName(e.target.value)}
                                placeholder="Organization Name"
                            />
                            <Button className='w-fit' type="submit">Update Name</Button>
                        </form>
                        <form onSubmit={handleAddOrganization} className="flex flex-col gap-2">
                            <Label>New Organization Name</Label>
                            <Input
                                value={newOrganizationName}
                                onChange={(e) => setNewOrganizationName(e.target.value)}
                                placeholder="New Organization Name"
                            />
                            <Button className='w-fit' type="submit" disabled={!newOrganizationName}>Add Organization</Button>
                        </form>
                        <div className='flex flex-col gap-2'>
                            <Label>Switch Organization</Label>
                            <Select onValueChange={handleSwitchOrganization} value={currentOrganizationId}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Switch Organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map((org) => (
                                        <SelectItem key={org.id} value={org.id}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
