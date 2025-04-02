import { AuthCard } from "@/components/auth/auth-card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an Account"
      description="Enter your details to create a new account"
      type="register"
      footer={
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
            Sign in
          </Link>
        </p>
      }
    />
  );
}