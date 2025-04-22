'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Course {
  id: string;
  name: string;
  courseCode: string;
}

interface ClassSection {
  id: string;
  sectionName: string;
  batch: { batchName: string };
  semester: { name: string };
}

interface CreateAttendanceSessionProps {
  teacherId: string;
}

export default function CreateAttendanceSession({ teacherId }: CreateAttendanceSessionProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [formData, setFormData] = useState<{
    courseId: string;
    classSectionId: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    sessionType: string;
  }>({
    courseId: '',
    classSectionId: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    sessionType: 'CLASS',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, sectionsRes] = await Promise.all([
          axios.get<Course[]>(`/api/teachers/${teacherId}/courses`),
          axios.get<ClassSection[]>(`/api/teachers/${teacherId}/class-sections`),
        ]);
        setCourses(coursesRes.data);
        setClassSections(sectionsRes.data);
        setLoading(false);
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.error || 'Failed to load data'
          : 'Failed to load data';
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        teacherId,
        courseId: formData.courseId,
        classSectionId: formData.classSectionId,
        sessionDate: formData.sessionDate,
        startTime: `${formData.sessionDate}T${formData.startTime}:00`,
        endTime: `${formData.sessionDate}T${formData.endTime}:00`,
        sessionType: formData.sessionType,
      };
      console.log('Creating session with payload:', payload);
      const response = await axios.post(`/api/teachers/${teacherId}/attendance/create`, payload);

      setFormData({
        courseId: '',
        classSectionId: '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        sessionType: 'CLASS',
      });
      window.open(`/t/attendance/${response.data.id}`, '_blank', 'width=800,height=600');
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Failed to create session'
        : 'Failed to create session';
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Attendance Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Course</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={submitting}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Section</label>
          <select
            name="classSectionId"
            value={formData.classSectionId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={submitting}
          >
            <option value="">Select a class section</option>
            {classSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.sectionName} - {section.batch.batchName} - Sem {section.semester.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Date</label>
          <input
            type="date"
            name="sessionDate"
            value={formData.sessionDate}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={submitting}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Type</label>
          <select
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={submitting}
          >
            <option value="CLASS">Class</option>
            <option value="LECTURE">Lecture</option>
            <option value="LAB">Lab</option>
            <option value="TUTORIAL">Tutorial</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
}