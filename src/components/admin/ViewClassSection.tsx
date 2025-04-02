export default function ViewClassSection({ classes }: any) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Classes</h2>
      {classes.length === 0 ? (
        <p>No classes available</p>
      ) : (
        <div className="space-y-4">
          {classes.map((classItem: any) => (
            <div key={classItem.id} className="border rounded p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{classItem.sectionName}</h3>
              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <p><span className="font-medium">Max Students:</span> {classItem.maxStudents}</p>
                  <p><span className="font-medium">Batch:</span> {classItem.batch?.batchName} ({classItem.batch?.year})</p>
                  <p><span className="font-medium">Course:</span> {classItem.course?.courseCode} - {classItem.course?.name}</p>
                </div>
                <div>
                  <p><span className="font-medium">Semester:</span> {classItem.semester?.name}</p>
                  <p><span className="font-medium">Dates:</span> {formatDate(classItem.semester?.startDate)} - {formatDate(classItem.semester?.endDate)}</p>
                  <p><span className="font-medium">Teacher:</span> {classItem.teacher?.user?.name} ({classItem.teacher?.teacherCode})</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Created: {formatDate(classItem.createdAt)}</p>
                <p>Last Updated: {formatDate(classItem.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}