"use client";
import { useState, useRef, useEffect } from "react";
import { uploadImageToS3 } from "@/utils/uploadImageToS3"; // Import the upload utility

const EmailForm = () => {
  const [selectedClass, setSelectedClass] = useState(""); 
  const [subject, setSubject] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const editorRef = useRef(null);
  const [htmlBody, setHtmlBody] = useState("");
  const [motherClasses, setMotherClasses] = useState([]); 
  const [fromEmail, setFromEmail] = useState("");

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

    if (user && user.institutionId) {
      setInstitutionId(user.institutionId);
      const url = `/api/institutions/${user.institutionId}/motherclass`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Mother Classes fetched:", data);
          setMotherClasses(data);
        })
        .catch((error) => {
          console.error("Error fetching mother classes:", error);
        });
    } else {
      console.warn("User or institutionId not found in localStorage.");
    }
  }, []);

  const handleFileChange = (e) => {
    setAttachedFiles([...attachedFiles, ...e.target.files]);
  };

  const handleFormat = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      setHtmlBody(editorRef.current.innerHTML);
    }
  };

  const handleBullet = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (!editorRef.current.innerHTML.trim()) {
        editorRef.current.innerHTML = "<ul><li><br></li></ul>";
      } else {
        document.execCommand("insertUnorderedList", false, null);
      }
      setHtmlBody(editorRef.current.innerHTML);
    }
  };

  const handleNumbered = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (!editorRef.current.innerHTML.trim()) {
        editorRef.current.innerHTML = "<ol><li><br></li></ol>";
      } else {
        document.execCommand("insertOrderedList", false, null);
      }
      setHtmlBody(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      handleFormat("createLink", url);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      setHtmlBody(editorRef.current.innerHTML);
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();

    let classSectionIds = [];
    if (selectedClass) {
      try {
        const selectedMotherClass = JSON.parse(selectedClass);
        if (selectedMotherClass.id === "all-classes") {
          motherClasses.forEach(motherClass => {
            if (motherClass.classSections) {
              classSectionIds = classSectionIds.concat(
                motherClass.classSections.map(cs => cs.id)
              );
            }
          });
        } else if (selectedMotherClass.classSections) {
          classSectionIds = selectedMotherClass.classSections.map((cs) => cs.id);
        }
      } catch (error) {
        console.error("Error parsing selected class:", error);
      }
    }

    const uploadedFilesInfo = await Promise.all(
      attachedFiles.map(async (file) => {
        try {
          const publicUrl = await uploadImageToS3(file);
          return { name: file.name, type: file.type, size: file.size, publicUrl };
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          return { name: file.name, type: file.type, size: file.size, publicUrl: null, error: error.message };
        }
      })
    );

    const payload = {
      classSectionIds,
      sender: fromEmail + " aic7640", 
      subject,
      body: htmlBody,
      attachments: uploadedFilesInfo.map(file => file.publicUrl).filter(url => url !== null),
      sentAt: new Date().toISOString(),
    };

    console.log("Email Payload:", payload);
    fetch(`/api/institutions/${institutionId}/notice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        console.log("Email sent successfully:", data);
        alert("Email sent successfully!");
        setSelectedClass("");
        setSubject("");
        setHtmlBody("");
        setAttachedFiles([]);
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-sans p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl"
      >
        {/* From */}
        <div className="mb-6">
          <label htmlFor="from" className="block font-semibold mb-2 text-gray-700">
            From:
          </label>
          <input
            type="email"
            id="from"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            required
            placeholder="Sender's email"
            className="w-full p-3 border border-gray-300 rounded-md text-gray-500 bg-gray-100"
          />
        </div>

        {/* To */}
        <div className="mb-6">
          <label htmlFor="to" className="block font-semibold mb-2 text-gray-700">
            To:
          </label>
          <select
            id="to"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Select a class</option>
            <option value={JSON.stringify({ id: "all-classes", sectionName: "All Classes" })}>
              All Classes
            </option>
            {motherClasses.map((motherClass) => (
              <option key={motherClass.id} value={JSON.stringify(motherClass)}>
                {motherClass.sectionName}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="mb-6">
          <label htmlFor="subject" className="block font-semibold mb-2 text-gray-700">
            Subject:
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Body */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">Body:</label>

          {/* Formatting buttons */}
          <div className="flex gap-2 mb-2 p-2 bg-gray-100 rounded-md flex-wrap">
            <button type="button" onClick={() => handleFormat("bold")} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 font-bold">B</button>
            <button type="button" onClick={() => handleFormat("italic")} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 italic">I</button>
            <button type="button" onClick={() => handleFormat("underline")} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 underline">U</button>
            <button type="button" onClick={handleBullet} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300">• Bullet</button>
            <button type="button" onClick={handleNumbered} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300">1. Numbered</button>
            <button type="button" onClick={handleLink} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300">🔗 Link</button>
          </div>

          {/* Editable body */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full p-3 border border-gray-300 rounded-md min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white overflow-y-auto"
          />
        </div>

        {/* Attachments */}
        <div className="mb-6">
          <label htmlFor="attachments" className="block font-semibold mb-2 text-gray-700">
            Attachments:
          </label>
          <input
            type="file"
            id="attachments"
            onChange={handleFileChange}
            multiple
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full
            file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
          />
          {attachedFiles.length > 0 && (
            <ul className="mt-4 space-y-2">
              {attachedFiles.map((file, index) => (
                <li key={index} className="bg-gray-200 p-2 rounded-md text-sm">{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-300"
        >
          Send Email
        </button>
      </form>
    </div>
  );
};

export default EmailForm;
