'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Teacher {
  id: string;
  user: { name: string };
  teacherCode: string;
}

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

interface Semester {
  id: string;
  name: string;
}

export default function TeacherCourseSectionForm() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    teacherId: '',
    courseId: '',
    classSectionId: '',
    semesterId: '',
    days: [] as number[],
    startTime: '09:00',
    endTime: '10:30',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
console.log('adminId: ',adminId);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setAdminId(parsedUser.id);
    }
  }, []);

  useEffect(() => {
    if (!adminId) return;

    const fetchData = async () => {
      try {
        const [teachersRes, coursesRes, classSectionsRes, semestersRes] = await Promise.all([
          axios.get(`/api/admin/${adminId}teacher-course-section?type=teachers`),
          axios.get(`/api/admin/${adminId}teacher-course-section?type=courses`),
          axios.get(`/api/admin/${adminId}teacher-course-section?type=class-sections`),
          axios.get(`/api/admin/${adminId}semesters`),
        ]);

        setTeachers(teachersRes.data);
        setCourses(coursesRes.data);
        setClassSections(classSectionsRes.data);
        setSemesters(semestersRes.data);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, [adminId]);

  const handleDayToggle = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) {
      setError('Admin ID not found');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`/api/admin/${adminId}teacher-course-section`, {
        ...formData,
        adminId,
      });
      setSuccess(`Created relation and ${response.data.sessionCount} sessions successfully`);
      setFormData({
        teacherId: '',
        courseId: '',
        classSectionId: '',
        semesterId: '',
        days: [],
        startTime: '09:00',
        endTime: '10:30',
      });
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.error || 'Failed to save' : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!adminId) {
    return <div className="p-4 text-red-500">Admin ID not found. Please log in.</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Assign Teacher to Course and Section</h2>
      {error && <div className="p-2 mb-4 text-red-500">{error}</div>}
      {success && <div className="p-2 mb-4 text-green-500">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Teacher</label>
          <select
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.user.name} ({teacher.teacherCode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Course</label>
          <select
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Class Section</label>
          <select
            value={formData.classSectionId}
            onChange={(e) => setFormData({ ...formData, classSectionId: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Class Section</option>
            {classSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.sectionName} - {section.batch.batchName} - Sem {section.semester.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Semester</label>
          <select
            value={formData.semesterId}
            onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Semester</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Days of the Week</label>
          <div className="flex gap-2 flex-wrap">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData.days.includes(index)}
                  onChange={() => handleDayToggle(index)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-1">Start Time</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">End Time</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Assignment and Create Sessions'}
        </button>
      </form>
    </div>
  );
}