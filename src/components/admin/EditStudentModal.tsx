import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {StudentDetail} from "@/components/admin/StudentdetailComponent";


interface EditStudentModalProps {
  student: StudentDetail;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedStudent: StudentDetail) => void;
}

export default function EditStudentModal({ student, isOpen, onClose, onUpdate }: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    username: student.user.username || '',
    dateOfBirth: student.user.dateOfBirth ? new Date(student.user.dateOfBirth).toISOString().split('T')[0] : '',
    phone: student.user.phone || '',
    address: student.user.address || '',
    parentGuardianName: student.parentGuardianName || '',
    parentGuardianPhone: student.parentGuardianPhone || '',
    parentGuardianEmail: student.parentGuardianEmail || '',
    gender: student.user.gender || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      username: student.user.username || '',
      dateOfBirth: student.user.dateOfBirth ? new Date(student.user.dateOfBirth).toISOString().split('T')[0] : '',
      phone: student.user.phone || '',
      address: student.user.address || '',
      parentGuardianName: student.parentGuardianName || '',
      parentGuardianPhone: student.parentGuardianPhone || '',
      parentGuardianEmail: student.parentGuardianEmail || '',
      gender: student.user.gender || '',
    });
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/students/${student.id}`, {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      });
      onUpdate(response.data);
      onClose();
    } catch (err) {
      setError('Failed to update student details. Please try again.');
      console.error('Error updating student:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm  overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Student Details</h3>
        </div>
        {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="jdoe_updated" />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="987-654-3210" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="456 Oak Avenue, Anytown, USA 12345" />
            </div>
            <div>
              <label htmlFor="parentGuardianName" className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
              <input type="text" name="parentGuardianName" id="parentGuardianName" value={formData.parentGuardianName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="parentGuardianPhone" className="block text-sm font-medium text-gray-700">Parent/Guardian Phone</label>
              <input type="text" name="parentGuardianPhone" id="parentGuardianPhone" value={formData.parentGuardianPhone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="555-0102" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="parentGuardianEmail" className="block text-sm font-medium text-gray-700">Parent/Guardian Email</label>
              <input type="email" name="parentGuardianEmail" id="parentGuardianEmail" value={formData.parentGuardianEmail} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="jane.doe@example.com" />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}