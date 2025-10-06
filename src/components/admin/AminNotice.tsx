"use client";
import {useEffect, useState} from "react";
import EmailForm from "@/components/ui/emailForm";
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
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")!);
    if (user && user.institutionId) {
      const id = user.institutionId;
      setInstitutionId(id);
      setIsLoading(true);
      const url = `/api/institutions/${id}/notice`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log("Notices fetched:", data);

          setSentNotices(data.filter(notice => notice.sender === 'ADMIN'));
          setNotices(data.filter(notice => notice.sender === 'TEACHER'));
          console.log("Sent Notices:", sentNotices);
          console.log("Notices:", notices);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching notices:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

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
      case "inbox":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Inbox</h2>
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
                            <h3 className="font-semibold text-gray-700">Attachments:</h3>
                            <ul className="list-disc list-inside">
                              {notice.attachments.map((attachment, index) => (

                                <li key={index} className="text-blue-600 hover:underline">
                                  {attachment.includes(".jpg") || attachment.includes(".png") ? (
                                    <li key={index} className="text-blue-600 hover:underline">
                                      <img src={attachment} alt={`Attachment ${index + 1}`}
                                           className="max-w-full h-auto"/>
                                    </li>
                                  ) : <a href={attachment} target="_blank" rel="noopener noreferrer">
                                    {attachment}
                                  </a>
                                  }

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
      case "sent":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Sent</h2>
            {sentNotices.length > 0 ? (
              sentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-gray-100 p-4 mb-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => toggleNotice(notice.id)} // Add onClick handler
                >
                  <p className="font-semibold text-gray-700">
                    To: {notice.classSections.map(cs => cs.sectionName).join(', ')}
                  </p>
                  <p className="font-semibold text-gray-700">From: {notice.sender} - {notice.name}</p>
                  <p className="text-lg font-medium text-gray-900">{notice.subject}</p>

                  {/* Conditional rendering for the body */}
                  {expandedNoticeId === notice.id && (
                    <div className="mt-2 text-gray-800">
                      <div dangerouslySetInnerHTML={{__html: notice.body}}/>
                      {notice.attachments && notice.attachments.length > 0 && (
                        <div className="mt-2">
                          <h3 className="font-semibold text-gray-700">Attachments:</h3>
                          <ul className="list-disc list-inside">
                            {notice.attachments.map((attachment, index) => (

                              <li key={index} className="text-blue-600 hover:underline">
                                {attachment.includes(".jpg") || attachment.includes(".png") ? (
                                  <li key={index} className="text-blue-600 hover:underline">
                                    <img src={attachment} alt={`Attachment ${index + 1}`}
                                         className="max-w-full h-auto"/>
                                  </li>
                                ) : <a href={attachment} target="_blank" rel="noopener noreferrer">
                                  {attachment}
                                </a>
                                }

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
              <p className="text-gray-500">No sent notices.</p>
            )}
          </div>
        );
      case "compose":
        return <EmailForm institutionId={institutionId}/>;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 font-sans p-4">
      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-lg">
        {/* Sidebar */}
        <div className="w-1/4 p-6 bg-gray-50 border-r border-gray-200 rounded-l-xl flex flex-col items-center">
          <button
            onClick={() => setCurrentView("compose")}
            className="w-full py-3 px-6 mb-6 text-white font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <MdAddCircleOutline className="text-xl"/>
            Compose
          </button>
          <ul className="w-full space-y-2">

            <li>
              <button
                onClick={() => setCurrentView("sent")}
                className={`w-full text-left py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                  currentView === "sent"
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <MdSend className="text-xl"/>
                Sent
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView("inbox")}
                className={`w-full text-left py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                  currentView === "inbox"
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <MdOutlineEmail className="text-xl"/>
                System Inbox
              </button>
            </li>
          </ul>
        </div>
        <div className="w-3/4 p-8">{renderView()}</div>
      </div>
    </div>
  );
};

export default EmailClient;