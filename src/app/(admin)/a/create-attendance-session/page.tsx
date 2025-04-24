'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '@/components/ui/Loader';
import { auth } from "@/auth";

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

export default  function TeacherCourseSectionForm() {
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
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log(storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setAdminId(parsedUser.id);
    }
  }, []);

  useEffect(() => {
    if (!adminId) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [teachersRes, coursesRes, classSectionsRes, semestersRes] = await Promise.all([
          axios.get(`/api/admin/${adminId}/teacher-course-section?type=teachers`),
          axios.get(`/api/admin/${adminId}/teacher-course-section?type=courses`),
          axios.get(`/api/admin/${adminId}/teacher-course-section?type=class-sections`),
          axios.get(`/api/admin/${adminId}/semesters`),
        ]);

        setTeachers(teachersRes.data);
        setCourses(coursesRes.data);
        setClassSections(classSectionsRes.data);
        setSemesters(semestersRes.data);
      } catch {
        setError('Failed to load data');
      } finally {
        setDataLoading(false);
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
      const response = await axios.post(`/api/admin/${adminId}/teacher-course-section`, {
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
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center shadow-sm">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="mx-auto h-12 w-12 text-red-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h3 className="mt-3 text-lg font-medium text-red-800">Authentication Required</h3>
          <p className="mt-2 text-sm text-red-600">Admin ID not found. Please log in to continue.</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return <Loader fullScreen message="Loading data..." />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="border-b border-gray-100 bg-purple-50 px-6 py-4">
          <h2 className="text-2xl font-bold text-purple-900">Assign Teacher to Course and Section</h2>
          <p className="mt-1 text-sm text-purple-700">Create attendance sessions by assigning teachers to courses and class sections</p>
        </div>
        
        {(error || success) && (
          <div className="px-6 pt-6">
            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid gap-y-6 px-6 py-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Teacher</label>
              <div className="relative">
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.name} ({teacher.teacherCode})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Course</label>
              <div className="relative">
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.courseCode})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Class Section</label>
              <div className="relative">
                <select
                  value={formData.classSectionId}
                  onChange={(e) => setFormData({ ...formData, classSectionId: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                >
                  <option value="">Select Class Section</option>
                  {classSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.sectionName} - {section.batch.batchName} - Sem {section.semester.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Semester</label>
              <div className="relative">
                <select
                  value={formData.semesterId}
                  onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Days of the Week</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <label key={day} className="flex cursor-pointer items-center gap-2">
                    <div className="relative flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white">
                      <input
                        type="checkbox"
                        className="absolute opacity-0"
                        checked={formData.days.includes(index)}
                        onChange={() => handleDayToggle(index)}
                      />
                      {formData.days.includes(index) && (
                        <svg className="h-3.5 w-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Start Time</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">End Time</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row-reverse">
            <button
              type="submit"
              className="relative inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-80 sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size="small" color="white" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Save Assignment and Create Sessions
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}