"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAddTeacher } from "@/hooks/useAddTeacher";
import { v4 as uuidv4 } from "uuid";

interface Teacher {
  name: string;
  email: string;
  id: string;
}

export default function AddTeacher({ setTeachers }: { setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>> }) {
  const { addTeacher, loading } = useAddTeacher();

  // State for input fields
  const [name, setName] = useState("rakesh test");
  const [email, setEmail] = useState("dssxs@ds.ceds");
  const [userId, setUserId] = useState("cm8y2kxfz0007xz7846pd13cu");

  const handleAddTeacher = async () => {
    if (!name || !email || !userId) {
      alert("Please fill in all fields.");
      return;
    }

    const success = await addTeacher({ name, email, userId });

    if (success) {
      setTeachers((prev) => [...prev, { name, email, id: uuidv4() }]);
      setName(""); // Clear input fields after adding
      setEmail("");
      setUserId("");
    }
  };

  return (
    <div className="p-4 shadow-xl">
      <h2 className="text-xl font-bold mb-4">Add Teacher</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter teacher's name"
          className="border px-2 py-1 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter teacher's email"
          className="border px-2 py-1 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter teacher ID"
          className="border px-2 py-1 w-full"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <Button onClick={handleAddTeacher} disabled={loading}>
          {loading ? "Adding..." : "Add Teacher"}
        </Button>
      </div>
    </div>
  );
}
