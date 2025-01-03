'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signupUser } from './actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { PiSpinner } from 'react-icons/pi'
import Link from 'next/link'

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm()
  const router = useRouter()
  const { toast } = useToast()

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const result = await signupUser(data)
      if (result.success) {
        router.push('/auth/login')
      } else {
        toast({
          title: "Error",
          description: "Failed to sign up. Please try again.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Enter your name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Enter your email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Enter organization name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='w-full' type="submit" disabled={isSubmitting}>
          {isSubmitting && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
        <div className="text-sm hover:underline">
          <Link href="/auth/login">Login into your account</Link>
        </div>
      </form>
    </Form>
  )
}