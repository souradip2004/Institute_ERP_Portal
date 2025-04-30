"use client";

import { useState, ReactNode, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormDivider } from "./form-divider";
import { SocialLoginButtons } from "./social-login-buttons";

interface AuthCardProps {
  title: string;
  description: string;
  type: "login" | "register";
  footer?: ReactNode;
  showSocialLogin?: boolean;
}

export function AuthCard({
  title,
  description,
  type,
  footer,
  showSocialLogin = true
}: AuthCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for register
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // For login

  // Check for error messages in localStorage from sessions that were invalidated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedError = localStorage.getItem('auth_error');
      if (storedError) {
        setError(storedError);
        // Clear the error after displaying it
        localStorage.removeItem('auth_error');
      }
    }
  }, []);
  let user: string | null = null;
  if (typeof window !== "undefined") {
    user = window.localStorage.getItem("user");
  }
  console.log(user);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (type === "login") {
      // Determine if input is email or username
      const isEmail = email.includes('@');

      // Use the appropriate credentials provider based on input type
      const providerId = isEmail ? "credentials-email" : "credentials-username";

      // Prepare credentials based on the provider
      const credentials = isEmail
        ? { email, password }
        : { username: email, password };

      console.log(`Logging in with ${providerId}`, credentials);

      // Handle login with NextAuth
      const result = await signIn(providerId, {
        ...credentials,
        redirect: false, // Handle redirect manually
      });

      console.log("Login result:", result);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Get user details to determine correct redirect
        try {
          const userResponse = await fetch("/api/auth/session", {
            credentials: "include"
          });
          const userData = await userResponse.json();
          console.log("User data after login:", userData);

          if (userData?.user) {
            // Store user info in localStorage
            if (typeof window !== "undefined") {
              window.localStorage.setItem("user", JSON.stringify(userData.user));
              window.localStorage.setItem("session", JSON.stringify(userData));
            }

            // Redirect based on user role
            if (userData.user.role === "TEACHER") {
              if (typeof window !== "undefined") {
                window.location.href = "/t/dashboard"; // Teacher dashboard
              }
            } else if (userData.user.role === "STUDENT") {
              if (typeof window !== "undefined") {
                window.location.href = "/s/dashboard"; // Student dashboard
              }
            } else {
              if (typeof window !== "undefined") {
                window.location.href = "/a/dashboard"; // Admin dashboard (default)
              }
            }
          } else {
            if (typeof window !== "undefined") {
              window.location.href = "/a/dashboard"; // Fallback to admin dashboard
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          window.location.href = "/a/dashboard"; // Fallback to admin dashboard
        }
      }
    } else {
      // Handle registration via API
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Registration failed");
        }

        // Optionally auto-sign in after registration
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError(signInResult.error);
        } else {
          if (typeof window !== "undefined") {
            window.location.href = "/a/dashboard";
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email or username"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {type === "login" && (
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary/90"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {type === "login" && typeof window !== "undefined" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : type === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {showSocialLogin && (
            <>
              <FormDivider />
              <SocialLoginButtons isLoading={loading} />
            </>
          )}



          {type === "login" && typeof window !== "undefined" && (
            <p className="text-sm text-muted-foreground">
              {new URLSearchParams(window.location.search).get("verified") === "true"
                ? "Email verified! Please sign in."
                : new URLSearchParams(window.location.search).get("error") === "invalid_token"
                  ? "Invalid verification token."
                  : new URLSearchParams(window.location.search).get("error") === "expired_token"
                    ? "Verification token expired. Please try again."
                    : ""}
            </p>
          )}

        </CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>
  );
}