"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Flame } from "lucide-react"
import { Loader2 } from "lucide-react"

import { LoginForm } from "@/components/ui/login-form"
import { RotatingBackground } from "@/components/ui/rotating-background"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/chat")
    }
  }, [isLoading, user, router])

  if (!isLoading && user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting to chat…</p>
      </div>
    )
  }

  return (
    <div className="grid min-h-svh bg-pampas lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium text-foreground">
            <div className="bg-crail text-white flex size-6 items-center justify-center rounded-md">
              <Flame className="size-4" />
            </div>
            RegIntel
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm rounded-xl border border-border-subtle bg-background p-6 shadow-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      
    </div>
  )
}
