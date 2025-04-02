import { useState } from "react";

export default function AddDepartmentComponent({ onClose }) {
  const [name, setName] = useState("It");
  const [code, setCode] = useState("it_1");
  const [description, setDescription] = useState("hey");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const [institutionId] = useState("cm8yyte2r0000bobv9amvosiy");

  const handleAddDepartment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, description,institutionId }),
      });

      if (!response.ok) throw new Error("Failed to add department");

      onClose(); // Close the form after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Department</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input type="text" placeholder="Department Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded mb-2" />
      <input type="text" placeholder="Department Code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full p-2 border rounded mb-2" />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded mb-2" />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
        <button onClick={handleAddDepartment} className="bg-blue-500 text-white px-4 py-2 rounded">{loading ? "Adding..." : "Add"}</button>
      </div>
    </div>
  );
}
