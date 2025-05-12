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
import { Eye, EyeOff } from "lucide-react";

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
  const [confirmPassword, setConfirmPassword] = useState(""); // Added for register
  const [name, setName] = useState(""); // Only for register
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // For success messages
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // For login
  const [user, setUser] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<URLSearchParams | null>(null);
  const [showPassword, setShowPassword] = useState(false); // For password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirm password visibility

  // Check for error and success messages in localStorage and set user data
  useEffect(() => {
    const storedError = localStorage.getItem('auth_error');
    if (storedError) {
      setError(storedError);
      // Clear the error after displaying it
      localStorage.removeItem('auth_error');
    }

    const storedSuccess = localStorage.getItem('auth_success');
    if (storedSuccess) {
      setSuccess(storedSuccess);
      // Clear the success message after displaying it
      localStorage.removeItem('auth_success');
    }

    // Set user data
    setUser(localStorage.getItem("user"));
    // Set query parameters
    setQueryParams(new URLSearchParams(window.location.search));
  }, []);

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
            window.localStorage.setItem("user", JSON.stringify(userData.user));
            window.localStorage.setItem("session", JSON.stringify(userData));

            // Redirect based on user role
            if (userData.user.role === "TEACHER") {
              window.location.href = "/t/dashboard"; // Teacher dashboard
            } else if (userData.user.role === "STUDENT") {
              window.location.href = "/s/dashboard"; // Student dashboard
            } else {
              window.location.href = "/a/dashboard"; // Admin dashboard (default)
            }
          } else {
            window.location.href = "/a/dashboard"; // Fallback to admin dashboard
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          window.location.href = "/a/dashboard"; // Fallback to admin dashboard
        }
      }
    } else {
      // Additional validation for registration
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

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

        // Set a success message in localStorage to display after redirect
        localStorage.setItem('auth_success', 'Account created successfully. Please sign in.');
        const sendemail=await fetch("/api/emails/welcome",{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!sendemail.ok) {
          const data = await sendemail.json();
          console.log("Error sending welcome email:", data.error);
        }

        // Redirect to login page instead of auto-signing in
        window.location.href = "/login";
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && <p className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200">{success}</p>}
          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>}
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {type === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            {type === "login" && (
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

          {type === "login" && queryParams && (
            <p className="text-sm text-muted-foreground">
              {queryParams.get("verified") === "true"
                ? "Email verified! Please sign in."
                : queryParams.get("error") === "invalid_token"
                  ? "Invalid verification token."
                  : queryParams.get("error") === "expired_token"
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