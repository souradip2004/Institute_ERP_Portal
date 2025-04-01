import { useState } from "react";
import { useAddClass } from "@/hooks/useAddClass";

export default function AddClassComponent() {
  const [classData, setClassData] = useState({
    sectionName: "",
    maxStudents: 60,
  });

  const { addClass, loading, error } = useAddClass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send data including sectionName and maxStudents to the backend
    await addClass(classData);
  };

  return (
    <div className="flex ">
      <form onSubmit={handleSubmit}>
        <h2 className="p-5">Add Class</h2>
        <input
          type="text"
          placeholder="Section Name"
          value={classData.sectionName}
          onChange={(e) => setClassData({ ...classData, sectionName: e.target.value })}
       className="border border-black w-45 m-5 p-2" />
        <input
          type="number"
          placeholder="Max Students"
          value={classData.maxStudents}
          onChange={(e) => setClassData({ ...classData, maxStudents: Number(e.target.value) })}
           className="border border-black w-15 mr-5 p-2" />
        <button type="submit" disabled={loading}    className="border border-black w-25 rounded-2xl bg-black text-white" >
          {loading ? "Adding Class..." : "Add Class"}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
