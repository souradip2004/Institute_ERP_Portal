import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { TbArrowBackUp } from "react-icons/tb";
import { set } from 'date-fns';
import type { ChangeEvent } from 'react';

// --- SVG Icon Components ---
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 13v8" /><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="m8 17 4-4 4 4" /></svg>
);

const FileIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

const translator = (word1: string, word2: string) =>
    typeof window !== 'undefined' && localStorage.getItem("lang") && localStorage.getItem("lang")!.toLowerCase().includes("english")
        ? word1
        : localStorage.getItem("lang")
            ? word2
            : word1;

export default function CreateSmartResources() {
    // Scroll to top on mount to fix scroll position issue
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [searchPrompt, setSearchPrompt] = useState<string>('');
    const [specifications, setSpecifications] = useState<string>('');
    const [manualEntryText, setManualEntryText] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [selectedPurpose, setSelectedPurpose] = useState<string>('N/A');
    const [otherPurposeText, setOtherPurposeText] = useState<string>('');
    const [purposeError, setPurposeError] = useState<string>('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem('user');
            return data ? JSON.parse(data)?.teacherId : null;
        }
        return null;
    });

  /*  const [user, setUser] = useState<any>({
        userId: "gdfgf7rdgrdgf7rejtgdffsd"
    });*/
    const [noOfResources, setNoOfResources] = useState<number>(0);

    useEffect(() => {
        const loadNoOfResources = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/getAllSchedulesFromUser/${userId}`);
                setNoOfResources(response.data?.data?.length);
                console.log("No of resources fetched:", response.data.data.length);
            } catch (error) {
                console.error("Error in AIResourceFinder useEffect:", error);
            }
        };
        if (userId) loadNoOfResources();
    }, [userId]);

    // --- Conditions for disabling UI elements ---
    const isTabSectionDisabled = searchPrompt.trim().length > 0;
    const isSearchPromptDisabled = uploadedFile || manualEntryText.trim().length > 0;

    // --- Input Handlers with Clearing Logic ---
    const handleSearchPromptChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchPrompt(value);
        // If user starts typing in the search prompt, clear other inputs
        if (value.trim().length > 0) {
            setManualEntryText('');
            setUploadedFile(null);
            setPdfUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleManualEntryChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setManualEntryText(value);

        // If user starts typing in manual entry, clear other inputs
        if (value.trim().length > 0) {
            setSearchPrompt('');
            setUploadedFile(null);
            setPdfUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setUploadedFile(null);
            return;
        };

        // If user uploads a file, clear other inputs
        setSearchPrompt('');
        setManualEntryText('');
        setUploadedFile(file);

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_AICLASSROOM}/pdfUpload/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Upload success:', response.data);
            setPdfUrl(response.data.fileUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadedFile(null); // Clear file on failure
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };


    const proceesWithData = () => {
        if (!selectedPurpose) {
            setPurposeError(translator('Purpose is required.', 'उद्देश्य आवश्यक है।'));
            return;
        }
        if (selectedPurpose === 'Other' && (!otherPurposeText || otherPurposeText.trim() === '')) {
            setPurposeError(translator('Purpose is required.', 'उद्देश्य आवश्यक है।'));
            return;
        }
        setPurposeError('');
        let combinedSearchPrompt = searchPrompt + " " + specifications + " " + manualEntryText;
        if (selectedPurpose === 'Other') {
            combinedSearchPrompt += " " + otherPurposeText;
        }
        const dataToStore = {
            searchPrompt: combinedSearchPrompt,
            language: selectedLanguage,
            purpose: selectedPurpose,
            uploadedFileName: uploadedFile?.name || null,
            pdfUrl: pdfUrl,
        };

        console.log("data to store from step1", dataToStore);

        if (typeof window !== 'undefined') {
            localStorage.setItem("airf", JSON.stringify(dataToStore));
            localStorage.removeItem("premiumTopicId");
        }
        router.push("/t/smart-resources/set-schedule");
    };

    const handleBack = () => {
        let redirectTo = searchParams?.get('redirect');
        if (redirectTo === 'home') {
            router.push('/');
        } else {
            router.push('/smart-resources');
        }
    };

    return (
        <div className="bg-slate-100">
            <div className="w-full bg-purple-600 text-white p-6 shadow-lg"
                style={{
                    background: 'linear-gradient(95.21deg, #A78BFA 0%, #818CF8 100%)',
                }}>
                <div className="flex items-start">
                    <button className="p-1 hover:bg-white/20 rounded-full"
                        onClick={() => handleBack()}
                    >
                        <TbArrowBackUp className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {translator("AI Resource Finder", "AI संसाधन खोजक")}
                        </h1>
                        <p className="text-sm opacity-90">
                            {translator("Get your Resources all at one place", "अपने सभी संसाधन एक ही जगह पाएं")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6">
                <div className=' bg-gradient-to-b from-white to-[#5f4ad862] flex flex-row w-full justify-center items-center text-center mb-6 border-1 border-[#4387FF] border-dashed rounded-lg'
                    onClick={() => { window.location.href = "/smart-resources"; }}
                >
                    <button className="text-[#1700C3] hover:text-[#1100ff] p-1.5 underline"
                        onClick={() => { window.location.href = "/smart-resources"; }}
                    >
                        {translator("View Previously Created Resources", "पिछले संसाधनों को देखें")} &gt; {noOfResources > 0 ? `(${noOfResources})` : ""}
                    </button>
                </div>
                <div>
                    <label htmlFor="topic-search" className="text-lg font-semibold text-gray-800">
                        {translator("Search About your Topic", "अपने विषय के बारे में खोजें")}
                    </label>
                    <div className="relative mt-2">
                        <input
                            id="topic-search"
                            type="text"
                            placeholder="Write or paste your topic here..."
                            value={searchPrompt}
                            onChange={handleSearchPromptChange}
                            disabled={!!isSearchPromptDisabled}
                            className={`w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${isSearchPromptDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100'}`}
                        />
                    </div>
                </div>

                <div className={`transition-opacity duration-300 ${isTabSectionDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-t border-gray-300" />
                        <span className="px-4 text-gray-500 font-medium">
                            {translator("OR", "या")}
                        </span>
                        <hr className="flex-grow border-t border-gray-300" />
                    </div>

                    <div className="flex space-x-8 border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex items-center space-x-2 pb-3 transition-all duration-300 ${activeTab === 'upload' ? 'border-b-2 border-purple-600 text-purple-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <FileIcon className="w-5 h-5" />
                            <span>{translator("Upload Syllabus", "सिलेबस अपलोड करें")}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex items-center space-x-2 pb-3 transition-all duration-300 ${activeTab === 'manual' ? 'border-b-2 border-purple-600 text-purple-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <PencilIcon className="w-5 h-5" />
                            <span>{translator("Manually Enter Topic Requirements", "मैन्युअल रूप से विषय आवश्यकताएँ दर्ज करें")}</span>
                        </button>
                    </div>

                    {activeTab === 'upload' && (
                        <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-[#A6C8FF] rounded-lg text-center">
                            <UploadIcon className="w-20 h-20 text-gray-400 mb-3" />
                            <p className="text-gray-600 mb-2">
                                {translator("Drag & drop your PDF syllabus file here", "यहाँ अपना PDF सिलेबस फ़ाइल ड्रैग और ड्रॉप करें")}
                            </p>
                            <p className="text-gray-500 mb-4">or</p>
                            <button
                                className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                style={{ background: 'linear-gradient(90deg, #6BA0FF 0%, #755BFF 100%)' }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {translator("Browse Files", "फ़ाइलें ब्राउज़ करें")}
                            </button>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            {uploadedFile && (
                                <p className="mt-2 text-sm text-green-600 font-medium">{uploadedFile.name}</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'manual' && (
                        <div className="flex flex-col w-full p-8 border-2 border-dashed border-[#A6C8FF] rounded-lg">
                            <label htmlFor="manual-entry" className="sr-only">
                                {translator("Enter Topic Requirements Manually", "मैन्युअल रूप से विषय आवश्यकताएँ दर्ज करें")}
                            </label>
                            <textarea
                                id="manual-entry"
                                rows={6}
                                placeholder={translator(
                                    "Enter your topic requirements here...",
                                    "अपनी विषय आवश्यकताएँ यहाँ दर्ज करें..."
                                )}
                                value={manualEntryText}
                                onChange={handleManualEntryChange}
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
                            ></textarea>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-2 w-full">
                            <label htmlFor="purpose-select" className="text-lg font-semibold text-gray-800 md:w-1/2">
                                {translator("Schedule Purpose", "अनुसूची उद्देश्य")}
                            </label>
                            <select
                                id="purpose-select"
                                value={selectedPurpose}
                                onChange={(e) => { setSelectedPurpose(e.target.value); setPurposeError(''); }}
                                className="w-full md:w-[350px] mt-2 md:mt-0 p-3 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none pr-10 ml-auto"
                                style={{
                                    backgroundImage: `url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E\")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1.5em 1.5em',
                                }}
                            >
                                <option value="" disabled>{translator("Select Purpose", "उद्देश्य चुनें")}</option>
                                <option value="Academic">Academic</option>
                                <option value="Target">Target</option>
                                <option value="Other">Other</option>
                                <option value="N/A">N/A</option>
                            </select>
                            {purposeError && (
                                <div className="text-red-500 text-sm mt-1">{purposeError}</div>
                            )}
                        </div>
                        {selectedPurpose === 'Other' && (
                            <div className="flex items-center space-x-2 mt-4">
                                <label htmlFor="other-purpose-input" className="sr-only">
                                    {translator("Enter Other Purpose", "अन्य उद्देश्य दर्ज करें")}
                                </label>
                                <input
                                    id="other-purpose-input"
                                    type="text"
                                    placeholder={translator("Enter other purpose here...", "यहां अन्य उद्देश्य दर्ज करें...")}
                                    value={otherPurposeText}
                                    onChange={(e) => setOtherPurposeText(e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="language-select" className="text-lg font-semibold text-gray-800">
                                {translator("Choose Your Preferred Language", "अपनी पसंदीदा भाषा चुनें")}{" "}
                                <span className="text-gray-400 font-normal">
                                    {translator("(if any)", "(यदि कोई हो)")}
                                </span>
                            </label>
                            <select
                                id="language-select"
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="w-full md:w-[350px] mt-2 md:mt-0 p-3 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none pr-10 ml-auto"
                                style={{
                                    backgroundImage: `url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E\")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1.5em 1.5em',
                                }}
                            >
                                <option value="" disabled>{translator("Select Language", "भाषा चुनें")}</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-[2] w-full">
                        <label htmlFor="specifications" className="text-lg font-semibold text-gray-800">
                            {translator("Add Specifications", "विशेष विवरण जोड़ें")}{" "}
                            <span className="text-gray-400 font-normal">
                                {translator("(if any)", "(यदि कोई हो)")}
                            </span>
                        </label>
                        <textarea
                            id="specifications"
                            rows={4}
                            placeholder={translator("Give your content requirement for ex- Detailed content", "अपनी सामग्री की आवश्यकता दें जैसे - विस्तृत सामग्री")}
                            value={specifications}
                            onChange={(e) => setSpecifications(e.target.value)}
                            className="w-full mt-2 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            style={{ minWidth: 0 }}
                        ></textarea>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        className="inline-flex items-center justify-center space-x-3 px-8 py-3 font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-md hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
                        onClick={proceesWithData}
                    >
                        <span>{translator("Generate Study Plan", "अध्ययन योजना बनाएं")}</span>
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}