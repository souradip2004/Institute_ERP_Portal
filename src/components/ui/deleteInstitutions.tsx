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
      const deleteRes = await fetch(`http://localhost:3000/api/institutions/${institutionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: institutionId }),
      });

      if (!deleteRes.ok) throw new Error("Failed to delete institution.");

      await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: null }),
      });

      alert("Institution deleted successfully!");
      router.refresh();
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
      // Keep size="sm" as a base, but then override/enhance with className
      size="sm"
      className={cn(
        "gap-2 font-medium transition-all",
        // --- ADD THESE CLASSES TO MAKE IT EVEN SMALLER ---
        "h-7 text-xs px-2", // Smaller height, smaller text, less padding
        // You might need to adjust the icon size as well if it looks too big
        // For example, if Trash2 icon is too big, you'd target it specifically
        // by passing a class or modifying its size directly in its component:
        // "h-7 text-xs px-2 [&>svg]:w-3 [&>svg]:h-3", // Example: target child SVG to make it smaller
        // -----------------------------------------------
        loading && "opacity-70"
      )}
    >
      <Trash2 className="w-4 h-4" /> {/* Keep this line, or adjust if needed */}
      {loading ? "Deleting..." : "Delete Institution"}
    </Button>
  );
}