"use client";

import NotesLibrary from "@/components/notes/NotesLibrary";
import VideoPlayerModal from "@/components/notes/NotesViewer/modal";
import Loader from "@/components/ui/Loader";
import { redirect } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useState } from "react"; // Added useCallback

export default function StudentNotesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModal] = useState<React.ReactNode | null>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null); // State to hold the selected classSection object

  // This currentEnrollment will be available only after studentData is fetched.
  // It's derived state, so no need for an extra useState unless it's complex.
  const currentEnrollment = studentData?.classEnrollments || [];

  // Use useCallback to memoize this function, as it depends on currentEnrollment
  const handleClassSelectionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedClassSectionId = e.target.value;

      if (selectedClassSectionId) {
        // Find the enrollment object that contains the selected classSection
        const selectedEnrollment = currentEnrollment.find(
          (enrollment: any) =>
            enrollment.classSectionId === selectedClassSectionId,
        );
        // Set the classSection object itself to the selectedClass state
        setSelectedClass(
          selectedEnrollment ? selectedEnrollment.classSection : null,
        );
      } else {
        setSelectedClass(null); // Reset if "Select a Class" is chosen
      }
    },
    [currentEnrollment],
  ); // Dependency: currentEnrollment

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          redirect("/login"); // Use redirect here if it's a server-side redirect or client-side after initial render
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== "STUDENT") {
          setError("Access denied. Student account required.");
          setIsLoading(false);
          return;
        }

        // Fetch student data including class enrollments and their classSection details
        const response = await fetch(
          `/api/students/${user.studentId}?includeClassSection=true`,
        );
        if (!response.ok) {
          const errorData = await response.json(); // Get error details from response body
          throw new Error(errorData.message || "Failed to fetch student data");
        }

        const fetchedStudentData = await response.json();
        setStudentData(fetchedStudentData);
      } catch (err: any) {
        setError(err.message || "Failed to load student data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const openNoteInModal = useCallback(
    (noteProps: {
      pdfUrl?: string;
      noteId?: string;
      initialVideoData?: any;
    }) => {
      const NotesViewer = React.lazy(
        () => import("@/components/notes/NotesViewer"),
      );

      setModal(
        <Suspense
          fallback={<Loader size="medium" message="Loading note content..." />}
        >
          <div className="p-4 sm:p-6 bg-white min-h-full max-h-[90vh] overflow-y-auto">
            <NotesViewer {...noteProps} />
          </div>
        </Suspense>,
      );
      setIsModalOpen(true);
    },
    [],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModal(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader size="large" message="Loading notes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow w-full max-w-md text-sm sm:text-base">
          <strong className="block mb-2">Error!</strong>
          {error}
        </div>
      </div>
    );
  }

  if (!studentData) {
    // This case should theoretically be covered by 'error' if fetch fails, but good to keep
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow w-full max-w-md text-sm sm:text-base">
          <strong className="block mb-2">Information</strong>
          Student data not found. Please try again later.
        </div>
      </div>
    );
  }

  // Check if student has active enrollments
  if (
    !studentData.classEnrollments ||
    studentData.classEnrollments.length === 0 ||
    studentData.enrollmentStatus !== "ACTIVE"
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow w-full max-w-md text-sm sm:text-base">
          <strong className="block mb-2">No Active Enrollment</strong>
          You are not currently enrolled in any active classes or your
          enrollment is not active. Please contact your administrator.
        </div>
      </div>
    );
  }

  // --- Main Render Section ---
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-2 px-4 sm:mb-6 max-w-screen-xl mx-auto mt-9">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Notes Library
        </h2>
      </div>

      {/* Class Selection Dropdown */}
      <div className="max-w-md mx-auto w-full mb-8">
        {" "}
        {/* Added margin-bottom */}
        <label
          htmlFor="class-select"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Select Class
        </label>
        <div className="relative">
          {" "}
          {/* Keep relative for the SVG icon positioning */}
          <select
            id="class-select"
            // The value should be the ID of the selected class section, or empty string if none
            value={selectedClass ? selectedClass.id : ""}
            onChange={handleClassSelectionChange}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
            required
          >
            <option value="">-- Select a Class --</option>
            {currentEnrollment.map(
              (enrollment: any) =>
                // Ensure enrollment.classSection and its properties exist before accessing
                enrollment.classSection && (
                  <option key={enrollment.id} value={enrollment.classSectionId}>
                    {enrollment.classSection.sectionName}
                  </option>
                ),
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* NotesLibrary Component or Placeholder */}
      <div className="max-w-screen-xl mx-auto">
        {selectedClass ? (
          <NotesLibrary
            studentId={studentData.id}
            studentName={studentData.user?.name || ""} // Use optional chaining for safety
            classSectionId={selectedClass.id} // Corrected: selectedClass now IS the classSection object
            batchName={studentData.batch?.batchName || ""} // Use optional chaining for safety
            sectionName={selectedClass.sectionName || ""} // Corrected: selectedClass now IS the classSection object
            openNoteInModal={openNoteInModal}
          />
        ) : (
          <div className="text-center text-gray-600 mt-8 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-lg font-medium">
              Please select a class from the dropdown above to view its notes.
            </p>
          </div>
        )}
      </div>

      {/* VideoPlayerModal */}
      <VideoPlayerModal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </VideoPlayerModal>
    </div>
  );
}
