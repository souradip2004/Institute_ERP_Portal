"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteInstitutionButtonProps {
  institutionId: string;
  userId: string;
}

export default function DeleteInstitutionButton({ institutionId, userId }: DeleteInstitutionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this institution?")) return;

    setLoading(true);
    try {
      // Send DELETE request to remove the institution
      const deleteRes = await fetch(`http://localhost:3000/api/institutions/${institutionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: institutionId }),
      });

      if (!deleteRes.ok) throw new Error("Failed to delete institution.");

      // Send PUT request to remove institution from user profile
      await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: null }),
      });

      alert("Institution deleted successfully!");
      router.refresh(); // Refresh page after deletion
    } catch (error) {
      console.error("Error deleting institution:", error);
      alert("Failed to delete institution.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleDelete}
      disabled={loading}
      variant="destructive"
      size="sm"
      className={cn(
        "gap-2 font-medium transition-all",
        loading && "opacity-70"
      )}
    >
      <Trash2 className="w-4 h-4" />
      {loading ? "Deleting..." : "Delete Institution"}
    </Button>
  );
}
