"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAddStudent, useBulkAddStudents } from "@/hooks/useHandleAddStudent";
import { Suspense } from "react";
export default function AddStudentContent() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <AddStudentContentInner />
    </Suspense>
  );
}

function AddStudentContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const departmentId = searchParams.get("departmentId");
  const batchId = searchParams.get("batchId");

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  const handleBack = () => {
    router.push(`/admin/students?departmentId=${departmentId}&batchId=${batchId}`);
  };

  if (!departmentId || !batchId) {
    return (
      <Suspense>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-red-500">Missing required parameters</p>
        <button
          onClick={() => router.push('/departments')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go to Departments
        </button>
      </div>
      </Suspense>
    );
  }

  return (
    <>
    <Suspense>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Students</h1>
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back to Student List
        </button>
      </div>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'single' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('single')}
          >
            Add Single Student
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'bulk' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Upload Students
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <SingleStudentForm departmentId={departmentId} batchId={batchId} onSuccess={handleBack} />
      ) : (
        <BulkStudentUpload departmentId={departmentId} batchId={batchId} onSuccess={handleBack} />
      )}
      </Suspense>
    </>
  );
}

// --- Single Student Form ---
interface StudentFormProps {
  departmentId: string;
  batchId: string;
  onSuccess: () => void;
}

function SingleStudentForm({ departmentId, batchId, onSuccess }: StudentFormProps) {
  const [formData, setFormData] = useState({
    studentRoll: "454",
    name: "Rakesh add one student test",
    email: "rakeh@gmail.com",
    phoneNumber: "9879887778"
  });
  const [error, setError] = useState<string | null>(null);
  const { addStudent, isLoading } = useAddStudent();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.studentRoll) {
      setError("Student Roll is required");
      return;
    }
    try {
      await addStudent({ ...formData, departmentId, batchId });
      onSuccess();
    } catch (err) {
      setError("Error adding student");
    }
  };

  return (
    <Suspense>
    <div className="bg-white shadow-lg rounded-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Student</h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
          <input
            type="text"
            name="studentRoll"
            value={formData.studentRoll}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter student roll number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter student name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter student email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter student phone number"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "Adding..." : "Add Student"}
        </button>
      </div>
    </div>
    </Suspense>
  );
}

// --- Bulk Student Upload ---
function BulkStudentUpload({ departmentId, batchId, onSuccess }: StudentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const { bulkAddStudents, isLoading } = useBulkAddStudents();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError("Please upload a CSV file");
        setFile(null);
        setPreview([]);
        return;
      }
      setFile(selectedFile);
      setError(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        setPreview(rows.slice(0, 5));
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }
    try {
      await bulkAddStudents({ file, departmentId, batchId });
      onSuccess();
    } catch (err) {
      setError("Error uploading students");
    }
  };

  return (
    <Suspense>
    <div className="bg-white shadow-lg rounded-md p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Bulk Upload Students</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-2">
          Upload a CSV file with student details. The CSV should have the following columns:
        </p>
        <div className="bg-gray-100 p-3 rounded text-sm">
          <code>studentRoll, name, email, phoneNumber</code>
        </div>
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
        />
      </div>
      {preview.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Preview:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {preview[0].map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing first {preview.length - 1} rows of data
          </p>
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={isLoading || !file}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-green-300"
      >
        {isLoading ? "Uploading..." : "Upload Students"}
      </button>
    </div>
    </Suspense>
  );
}
