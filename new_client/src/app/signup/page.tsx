"use client"

import Image from "next/image"
import { SignupForm } from "@/components/ui/signup-form"
import { RotatingBackground } from "@/components/ui/rotating-background"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh bg-pampas lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
        <a href="#" className="flex items-center gap-2 font-medium text-foreground">
          <Image src="/logo14.png" alt="RegIntel logo" width={32} height={32} className="rounded-md" />
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
