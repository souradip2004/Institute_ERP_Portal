import AddFeesDetails from '@/components/admin/AddFees';
import { auth } from "@/auth";

export default async function CreateAttendanceSessionPage() {
    const session = await auth();
    
      const userId = session?.user?.id;
      const instituteId = session?.user?.institutionId;
      console.log(instituteId)
  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add Fees</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add new fees details for your institution.
        </p>
      </div>

      <AddFeesDetails id={instituteId ?? ''} />
    </div>
  );
}