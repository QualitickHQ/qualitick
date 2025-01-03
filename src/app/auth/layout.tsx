'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { checkAuth } from "../console/actions"
import { redirect } from "next/navigation"

export default function AuthLayout({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    handleCheckAuth()
  }, [])

  const handleCheckAuth = async () => {
    const auth = await checkAuth()
    if (auth) {
      redirect('/console/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Login or sign up to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
