// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface SectionCourseTeacherRelation {
  id: string;
  classSectionId: string;
  courseId: string;
  teacherId: string;
  classSection: { sectionName: string };
  course: { courseName: string };
  teacher: { name: string };
}

export default function Home() {
  const [relations, setRelations] = useState<SectionCourseTeacherRelation[]>([]);
  const [formData, setFormData] = useState({
    id: '',
    classSectionId: '',
    courseId: '',
    teacherId: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all relations
  const fetchRelations = async () => {
    const res = await fetch('/api/section-course-teacher-relations');
    const data = await res.json();
    setRelations(data);
  };

  useEffect(() => {
    fetchRelations();
  }, []);

  // Handle form submission (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `/api/section-course-teacher-relations/${formData.id}`
      : '/api/section-course-teacher-relations';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classSectionId: formData.classSectionId,
        courseId: formData.courseId,
        teacherId: formData.teacherId,
      }),
    });

    if (res.ok) {
      fetchRelations();
      resetForm();
    } else {
      alert('Failed to save relation');
    }
  };

  // Handle edit button click
  const handleEdit = (relation: SectionCourseTeacherRelation) => {
    setFormData({
      id: relation.id,
      classSectionId: relation.classSectionId,
      courseId: relation.courseId,
      teacherId: relation.teacherId,
    });
    setIsEditing(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/section-course-teacher-relations/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchRelations();
    } else {
      alert('Failed to delete relation');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ id: '', classSectionId: '', courseId: '', teacherId: '' });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Section Course Teacher Relations
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Class Section ID"
            value={formData.classSectionId}
            onChange={(e) =>
              setFormData({ ...formData, classSectionId: e.target.value })
            }
            className="border p-2"
            required
          />
          <input
            type="text"
            placeholder="Course ID"
            value={formData.courseId}
            onChange={(e) =>
              setFormData({ ...formData, courseId: e.target.value })
            }
            className="border p-2"
            required
          />
          <input
            type="text"
            placeholder="Teacher ID"
            value={formData.teacherId}
            onChange={(e) =>
              setFormData({ ...formData, teacherId: e.target.value })
            }
            className="border p-2"
            required
          />
          <div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 mr-2"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* List */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Section</th>
            <th className="border p-2">Course</th>
            <th className="border p-2">Teacher</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {relations.map((relation) => (
            <tr key={relation.id}>
              <td className="border p-2">{relation.classSection.sectionName}</td>
              <td className="border p-2">{relation.course.courseName}</td>
              <td className="border p-2">{relation.teacher.name}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(relation)}
                  className="bg-yellow-500 text-white px-2 py-1 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(relation.id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}