// components/admin/ViewTeachers.tsx
import { Card } from "@/components/ui/card";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export default function ViewTeachers({ teachers }: { teachers: Teacher[] }) {
  return (
    <Card className="p-4 shadow-xl">
      <h2 className="text-xl font-bold mb-4">Teachers</h2>
      {teachers.length > 0 ? (
        <ul className="space-y-2">
          {teachers.map((teacher) => (
            <li key={teacher.id} className="border-b pb-2">
              <span className="font-semibold">{teacher.name}</span> - {teacher.email}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No teachers available.</p>
      )}
    </Card>
  );
}
