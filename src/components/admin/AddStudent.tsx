import { useState } from "react";
import { useAddStudent }  from "@/hooks/useAddStudent";

export default function AddStudentComponent() {
  const [studentData, setStudentData] = useState({
    rollNumber: "",
    userId:""
  });

  const { addStudent, loading, error } = useAddStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send student data to the backend
    await addStudent(studentData);
  };

  return (
    <div className="flex">
      <form onSubmit={handleSubmit}>
        <h2 className="p-5">Add Student</h2>
        <input
          type="text"
          placeholder="Roll Number"
          value={studentData.rollNumber}
          onChange={(e) => setStudentData({ ...studentData, rollNumber: e.target.value })}
          className="border border-black w-45 m-5 p-2"
        />

           <input
          type="text"
          placeholder="User id"
          value={studentData.userId}
          onChange={(e) => setStudentData({ ...studentData, userId: e.target.value })}
          className="border border-black w-45 m-5 p-2"
        />
        <button type="submit" disabled={loading} className="border border-black w-25 rounded-2xl bg-black text-white">
          {loading ? "Adding Student..." : "Add Student"}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
