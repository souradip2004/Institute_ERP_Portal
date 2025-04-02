"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex items-center justify-center h-screen text-black bg-white">
      <div className="grid gap-6 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <div className="grid gap-4">
          <Link href="/custom-login">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Student Login"}
            </Button>
          </Link>
          <Link href="/login">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Admin Login"}
            </Button>
          </Link>
          <Link href="/custom-login">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Teacher Login"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}