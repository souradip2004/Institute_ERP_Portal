"use client";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";

export default function AddClass({ setClasses }: { setClasses: any }) {
  const handleAddClass = () => {
    const name = (document.getElementById("className") as HTMLInputElement).value;

    if (!name) {
      alert("Please enter class name.");
      return;
    }

    setClasses((prev: any) => [...prev, { name, token: uuidv4(), teachers: [], students: [] }]);
  };

  return (
    <div className="p-4 shadow-xl">
      <h2 className="text-xl font-bold mb-4">Add Class</h2>
      <input id="className" type="text" placeholder="Enter class name" className="border px-2 py-1 w-full" />
      <Button onClick={handleAddClass}>Add Class</Button>
    </div>
  );
}
