import { AuthCard } from "@/components/auth/auth-card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign In"
      description="Enter your credentials to access your account"
      type="login"
      footer={
        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary underline underline-offset-4 hover:text-primary/90">
            Sign up
          </Link>
        </p>
      }
    />
  );
}