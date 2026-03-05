"use client"

import { Flame } from "lucide-react"
import { SignupForm } from "@/components/ui/signup-form"
import { RotatingBackground } from "@/components/ui/rotating-background"

export default function SignupPage() {
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
          <div className="w-full max-w-sm rounded-xl border border-border-subtle bg-background p-6 shadow-sm ">
            <SignupForm />
          </div>
        </div>
      </div>
      
    </div>
  )
}
