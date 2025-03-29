"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  isLoading?: boolean;
  className?: string;
}

export function LogoutButton({ isLoading: initialLoading = false, className = "" }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(initialLoading);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      disabled={isLoading}
      className={className}
      onClick={handleLogout}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}