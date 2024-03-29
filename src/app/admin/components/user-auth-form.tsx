"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
  
    // Get form data
    const formData = new FormData(event.target as HTMLFormElement);
    console.log(formData.entries());
    const username = formData.get('username')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    if (username === '' || password === '') {
      setIsLoading(false);
      return;
    }

    console.log(username, password);
    // Set cookies (for demonstration purposes)
    document.cookie = `username=${encodeURIComponent(username)}; path=/;`;
    document.cookie = `password=${encodeURIComponent(password)}; path=/;`;
  
    setIsLoading(false);
    window.location.assign('/admin')
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="username">
              Username
            </Label>
            <Input
              name="username"
              placeholder="name@example.com"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="username">
              Password
            </Label>
            <Input
              name="password"
              placeholder="*********"
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
    </div>
  )
}
