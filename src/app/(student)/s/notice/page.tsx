"use client";
import {useEffect, useState} from "react";
import EmailForm from "@/components/ui/teacherEmailForm";
import {
  MdOutlineEmail,
  MdSend,
  MdAddCircleOutline,
} from "react-icons/md";
import {format} from "date-fns";

const EmailClient = () => {
  const [currentView, setCurrentView] = useState("sent");
  const [institutionId, setInstitutionId] = useState("");
  const [notices, setNotices] = useState([]);
  const [sentNotices, setSentNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null); // New state for expanding/collapsing

  useEffect(() => {
    const userString = localStorage.getItem("user");
    let user = null;
    if (userString) {
      try {
        user = JSON.parse(userString);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }

    const fetchData = async () => {
      if (user && user.institutionId && user.studentId) {
        setInstitutionId(user.institutionId);
        setIsLoading(true);

        try {
          // 1. Fetch the teacher's classes to get a list of section IDs
          const teacherClassesUrl = `/api/students/${user.studentId}`;
          const teacherClassesResponse = await fetch(teacherClassesUrl);
          if (!teacherClassesResponse.ok) {
            throw new Error(`Teacher classes fetch failed: ${teacherClassesResponse.statusText}`);
          }
          const teacherClasses = await teacherClassesResponse.json();
          console.log("Teacher Classes fetched:", teacherClasses);

          // 2. Fetch all notices for the institution
          const noticesUrl = `/api/institutions/${user.institutionId}/notice`;
          const noticesResponse = await fetch(noticesUrl);
          if (!noticesResponse.ok) {
            throw new Error(`Notices fetch failed: ${noticesResponse.statusText}`);
          }
          const allNotices = await noticesResponse.json();
          console.log("Notices fetched:", allNotices);

          // 3. Filter the notices based on the teacher's class sections
          const teacherSectionIds = new Set(teacherClasses?.classEnrollments?.map(teacherClass => teacherClass.classSectionId));
          console.log("Student Section IDs:", teacherSectionIds);
          const filteredNotices = allNotices.filter(notice => {
            // Check if the notice has a classSections array and it's not empty
            if (!notice.classSections || notice.classSections.length === 0) {
              return false;
            }

            // Check if any of the notice's classSection IDs match
            // any of the teacher's class section IDs
            return notice.classSections.some(noticeSectionId => teacherSectionIds.has(noticeSectionId.id));
          });
          const uniqueNoticeIds = new Set();
          const uniqueFilteredNotices = filteredNotices.filter(notice => {
            const isDuplicate = uniqueNoticeIds.has(notice.id); // Assuming '_id' is the unique identifier
            uniqueNoticeIds.add(notice.id);
            return !isDuplicate;
          });

          setSentNotices(uniqueFilteredNotices.filter(notice => notice.sender === 'TEACHER'));
          setNotices(uniqueFilteredNotices.filter(notice => notice.sender === 'ADMIN'));
          console.log("Notices filtered by teacher's sections:", uniqueFilteredNotices);

          setIsLoading(false);

        } catch (error) {
          console.error("Error fetching or filtering data:", error);
          setIsLoading(false);
        }
      } else {
        console.warn("User or institutionId not found in localStorage.");
        setIsLoading(false);
      }
    };

    fetchData();

  }, []); // Empty dependency array to run only once on mount

  const toggleNotice = (id) => {
    setExpandedNoticeId(expandedNoticeId === id ? null : id);
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">Loading notices...</p>
        </div>
      );
    }

    switch (currentView) {
      case "admin":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">From Your Principal</h2>
            {
              notices.length > 0 ? (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-gray-100 p-4 mb-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => toggleNotice(notice.id)} // Add onClick handler
                  >
                    <p className="font-semibold text-gray-700">
                      From: {notice.sender} - {notice.name}
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {notice.subject}
                    </p>

                    {/* Conditional rendering for the body */}
                    {expandedNoticeId === notice.id && (
                      <div className="mt-2 text-gray-800">
                        <div dangerouslySetInnerHTML={{__html: notice.body}}/>
                        {notice.attachments && notice.attachments.length > 0 && (
                          <div className="mt-2">
                            <h3 className="text-sm font-semibold text-gray-700">Attachments:</h3>
                            <ul className="list-disc pl-5">
                              {notice.attachments.map((attachment, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  <a href={attachment.url} target="_blank" rel="noopener noreferrer"
                                     className="text-blue-600 hover:underline">
                                    {attachment.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mt-1 text-right">
                      {notice.sentAt ? format(new Date(notice.sentAt), "MMM d, yyyy, h:mm a") : "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No notices in your inbox.</p>
              )
            }
          </div>
        );
      case "teacher":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">From Your teacher</h2>
            {sentNotices.length > 0 ? (
              sentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-gray-100 p-4 mb-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => toggleNotice(notice.id)} // Add onClick handler
                >
                  <p className="font-semibold text-gray-700">
                    From: {notice.sender}
                  </p>
                  <p className="font-semibold text-gray-700">
                    To: {notice.classSections.map(cs => cs.sectionName).join(', ')}
                  </p>
                  <p className="font-semibold text-gray-700">From: {notice.sender} - {notice.name}</p>
                  <p className="text-lg font-medium text-gray-900">{notice.subject}</p>

                  {/* Conditional rendering for the body */}
                  {expandedNoticeId === notice.id && (
                    <div className="mt-2 text-gray-800">
                      <div dangerouslySetInnerHTML={{__html: notice.body}}/>
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mt-1 text-right">
                    {notice.sentAt ? format(new Date(notice.sentAt), "MMM d, yyyy, h:mm a") : "N/A"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No sent notices.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 font-sans p-4">
      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-lg">
        {/* Sidebar */}
        <div className="w-1/4 p-6 bg-gray-50 border-r border-gray-200 rounded-l-xl flex flex-col items-center">

          <ul className="w-full space-y-2">
            <li>
              <button
                onClick={() => setCurrentView("admin")}
                className={`w-full text-left py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                  currentView === "admin"
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <MdOutlineEmail className="text-xl"/>
                Principal Notice
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView("teacher")}
                className={`w-full text-left py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                  currentView === "teacher"
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <MdOutlineEmail className="text-xl"/>
                Teacher Notice
              </button>
            </li>

          </ul>
        </div>
        {/* Main Content Area */}
        <div className="w-3/4 p-8">{renderView()}</div>
      </div>
    </div>
  );
};

export default EmailClient;