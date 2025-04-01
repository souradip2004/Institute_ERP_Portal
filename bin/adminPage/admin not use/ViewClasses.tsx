// components/admin/ViewClasses.tsx
import { Card } from "@/components/ui/card";

interface ClassItem {
  name: string;
  token: string;
  teachers: string[];
  students: string[];
}

export default function ViewClasses({ classes }: { classes: ClassItem[] }) {
  return (
    <Card className="p-4 shadow-xl">
      <h2 className="text-xl font-bold mb-4">Classes</h2>
      {classes.length > 0 ? (
        <ul className="space-y-2">
          {classes.map((classItem) => (
            <li key={classItem.token} className="border-b pb-2">
              <span className="font-semibold">{classItem.name}</span> - Token: {classItem.token}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No classes available.</p>
      )}
    </Card>
  );
}
