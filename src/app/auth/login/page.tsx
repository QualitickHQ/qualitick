'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginUser, verifyOTP } from './actions'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { PiSpinner } from 'react-icons/pi'
import Link from 'next/link'

// Define validation schemas
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().optional()
})

const otpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().min(1, 'OTP is required')
})

export default function LoginPage() {
  const [showOTP, setShowOTP] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({
    resolver: zodResolver(showOTP ? otpSchema : emailSchema),
    defaultValues: {
      email: '',
      otp: ''
    }
  })
  const { toast } = useToast()
  const router = useRouter()

  const onSubmit = async (data: z.infer<typeof emailSchema>) => {
    setIsSubmitting(true)
    try {
      if (!showOTP) {
        await loginUser(data.email)
        setShowOTP(true)
        toast({
          title: "OTP Sent",
          description: "Please check your email for the OTP.",
        })
      } else {
        await verifyOTP(data.email, data.otp!)
        toast({
          title: "Success",
          description: "You have successfully logged in.",
        })
        router.push('/console/dashboard')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: showOTP ? "Invalid OTP. Please try again." : "Failed to send OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        {showOTP && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Enter OTP" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
          {showOTP ? 'Verify OTP' : 'Send Magic Link'}
        </Button>
        <div className="text-sm hover:underline">
          <Link href="/auth/signup">Create an account</Link>
        </div>
      </form>
    </Form>
  )
}
