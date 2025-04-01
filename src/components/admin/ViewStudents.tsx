// components/admin/ViewStudents.tsx
import { Card } from "@/components/ui/card";

interface Student {
  id: string;
  name: string;
  email?: string;
  rollNumber?: string;
}

export default function ViewStudents({ students }: { students: Student[] }) {
  return (
    <Card className="p-4 shadow-xl">
      <h2 className="text-xl font-bold mb-4">Students</h2>
      {students.length > 0 ? (
        <ul className="space-y-2">
          {students.map((student) => (
            <li key={student.id} className="border-b pb-2">
              <span className="font-semibold">{student.name}</span> - 
              {student.email ? ` ${student.email}` : " No Email"} - 
              {student.rollNumber ? ` Roll No: ${student.rollNumber}` : " No Roll Number"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No students available.</p>
      )}
    </Card>
  );
}
