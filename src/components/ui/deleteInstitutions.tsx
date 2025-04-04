"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteInstitutionButton({ institutionId, userId }) {
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
    <button 
      onClick={handleDelete} 
      disabled={loading} 
      style={{
        marginTop: "10px",
        padding: "10px 20px",
        backgroundColor: loading ? "#aaa" : "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Deleting..." : "Delete Institution"}
    </button>
  );
}
