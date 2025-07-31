'use client';

import React, { useState, useEffect } from 'react';
import { RiArrowGoBackFill } from "react-icons/ri";
import { useRouter } from 'next/navigation';

// Translator function for English/Hindi UI
const translator = (word1: string, word2: string): string =>
    typeof window !== 'undefined' && localStorage.getItem("lang") && localStorage.getItem("lang")!.toLowerCase().includes("english")
        ? word1
        : typeof window !== 'undefined' && localStorage.getItem("lang") && localStorage.getItem("lang")!.toLowerCase().includes("hindi")
            ? word2
            : word1; // Default to English if no language or unsupported language is set

export default function TermsGuidelines() {
    const router = useRouter();
    const [isChecked, setIsChecked] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const [isProceedEnabled, setIsProceedEnabled] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setIsProceedEnabled(isChecked); // Enable only if countdown is 0 AND checkbox is already checked
        }
        return () => clearInterval(timer);
    }, [countdown, isChecked]); // Added isChecked to dependency array

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
        // Only enable if countdown is 0 AND checkbox is checked
        setIsProceedEnabled(event.target.checked && countdown === 0);
    };

    const handleGoBack = () => {
        router.back();
    };

    const handleClose = () => {
        router.push('/');
    };

    return (
        // Outer container: Full viewport height, flex for centering, light background
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 font-sans">
            {/* Main content box: Responsive width, shadow, rounded corners */}
            <div
                className="relative bg-white pt-8 pb-8 px-4 sm:px-8 md:px-12 shadow-lg rounded-3xl flex flex-col items-center max-w-screen-lg w-full h-auto min-h-[85vh]"
                style={{ borderColor: "#B2BCEE", borderWidth: '1px' }} // Added borderWidth for explicit border
            >
                {/* Header Section */}
                <div className='w-full flex flex-col sm:flex-row items-center justify-center relative mb-6'>
                    <button
                        className='absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-300 hover:bg-[#B2BCEE] text-[#3A1078]'
                        onClick={handleGoBack}
                        aria-label={translator("Go back", "पीछे जाओ")}
                    >
                        <RiArrowGoBackFill className='text-3xl sm:text-4xl' />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#3A1078] flex-grow mx-10">
                        {translator("Terms and Conditions", "नियम और शर्तें")}
                    </h1>
                </div>

                {/* Scrollable Content Area */}
                <div className="w-full overflow-y-auto pr-2 pb-6 space-y-8 text-gray-800 text-base leading-relaxed" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                    <p>
                        {translator(
                            "Welcome to AI Classroom! By using our platform, you agree to the following terms and conditions that govern the usage of features under our three subscription plans: Freemium, Plus, and Premium.",
                            "AI क्लासरूम में आपका स्वागत है! हमारे प्लेटफ़ॉर्म का उपयोग करके, आप निम्नलिखित नियमों और शर्तों से सहमत होते हैं जो हमारी तीन सदस्यता योजनाओं: फ्रीमियम, प्लस और प्रीमियम के तहत सुविधाओं के उपयोग को नियंत्रित करते हैं।"
                        )}
                    </p>

                    <hr className="my-6 border-t border-gray-200" />

                    {/* Plan Overview Table */}
                    <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">
                        {translator("Plan Overview", "योजना का अवलोकन")}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border-b text-left">{translator("Plan Type", "योजना प्रकार")}</th>
                                    <th className="py-2 px-4 border-b text-left">{translator("Price", "मूल्य")}</th>
                                    <th className="py-2 px-4 border-b text-left">{translator("Credits", "क्रेडिट")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-2 px-4 border-b">Freemium</td>
                                    <td className="py-2 px-4 border-b">₹0</td>
                                    <td className="py-2 px-4 border-b">{translator("10 daily (resets every day)", "प्रतिदिन 10 (हर दिन रीसेट होता है)")}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">Plus</td>
                                    <td className="py-2 px-4 border-b">₹299</td>
                                    <td className="py-2 px-4 border-b">{translator("100 credits", "100 क्रेडिट")}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">Premium</td>
                                    <td className="py-2 px-4 border-b">₹599</td>
                                    <td className="py-2 px-4 border-b">{translator("210 credits (includes 10 bonus credits)", "210 क्रेडिट (10 बोनस क्रेडिट शामिल)")}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <hr className="my-6 border-t border-gray-200" />

                    {/* 1. Freemium Plan – Terms of Use */}
                    <div>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">
                            {translator("1. Freemium Plan – Terms of Use", "1. फ्रीमियम प्लान – उपयोग की शर्तें")}
                        </h2>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>
                                <strong>{translator("Daily Credit Limit:", "दैनिक क्रेडिट सीमा:")}</strong> {translator("10 credits per day, valid only for that day.", "प्रतिदिन 10 क्रेडिट, केवल उसी दिन के लिए मान्य।")}
                            </li>
                            <li>
                                <strong>{translator("PDF/Text to Animation Video:", "पीडीएफ/टेक्स्ट से एनिमेशन वीडियो:")}</strong> {translator("Up to 5 credits can be used daily.", "प्रतिदिन 5 क्रेडिट तक उपयोग किए जा सकते हैं।")}
                            </li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("Smart Resource Finder (SRF)", "स्मार्ट संसाधन खोजक (एसआरएफ)")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("Schedule 1 plan only (Normal syllabus).", "केवल 1 योजना शेड्यूल करें (सामान्य पाठ्यक्रम)।")}</li>
                            <li>{translator("Access only current day's videos, up to 3–5 videos/day.", "केवल वर्तमान दिन के वीडियो तक पहुंचें, प्रति दिन 3-5 वीडियो तक।")}</li>
                            <li>{translator("View 1 resource (PDF) per topic permanently.", "प्रति विषय स्थायी रूप से 1 संसाधन (पीडीएफ) देखें।")}</li>
                            <li>{translator("Quizzes: Attempt 2 times, up to 10 questions.", "क्विज़: 2 बार प्रयास करें, 10 प्रश्नों तक।")}</li>
                            <li>{translator("Doubts: Ask up to 5 per day.", "संदेह: प्रति दिन 5 तक पूछें।")}</li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("AI Interview", "AI इंटरव्यू")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("5 real-time conversations (lifetime limit).", "5 वास्तविक समय की बातचीत (जीवनकाल सीमा)।")}</li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("Exam Mode", "परीक्षा मोड")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("Create and attempt:", "बनाएं और प्रयास करें:")}
                                <ul className="list-circle ml-5">
                                    <li>{translator("20 MCQs", "20 एमसीक्यू")}</li>
                                    <li>{translator("3 long-answer exams", "3 दीर्घ-उत्तर परीक्षाएँ")}</li>
                                </ul>
                            </li>
                            <li>{translator("Usable forever.", "हमेशा के लिए उपयोग करने योग्य।")}</li>
                        </ul>
                        <p className="mt-2 text-sm text-gray-600 italic">
                            {translator(
                                "Note: Freemium users have lower priority on the server. Processing and responses may take longer compared to Plus and Premium plans.",
                                "नोट: फ्रीमियम उपयोगकर्ताओं की सर्वर पर प्राथमिकता कम होती है। प्लस और प्रीमियम योजनाओं की तुलना में प्रसंस्करण और प्रतिक्रियाओं में अधिक समय लग सकता है।"
                            )}
                        </p>
                    </div>

                    <hr className="my-6 border-t border-gray-200" />

                    {/* 2. Plus Plan – Terms of Use */}
                    <div>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">
                            {translator("2. Plus Plan – Terms of Use", "2. प्लस प्लान – उपयोग की शर्तें")}
                        </h2>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>
                                <strong>{translator("Credits:", "क्रेडिट:")}</strong> {translator("100 (used across all features).", "100 (सभी सुविधाओं में उपयोग किया जाता है)।")}
                            </li>
                            <li>
                                <strong>{translator("PDF/Text to Animation Video:", "पीडीएफ/टेक्स्ट से एनिमेशन वीडियो:")}</strong> {translator("No daily restriction; use as per available credits.", "कोई दैनिक प्रतिबंध नहीं; उपलब्ध क्रेडिट के अनुसार उपयोग करें।")}
                            </li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("Smart Resource Finder (SRF)", "स्मार्ट संसाधन खोजक (एसआरएफ)")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("Schedule up to 3 plans (Normal syllabus).", "3 योजनाओं तक शेड्यूल करें (सामान्य पाठ्यक्रम)।")}</li>
                            <li>{translator("Access current/focused day's videos.", "वर्तमान/केंद्रित दिन के वीडियो तक पहुंचें।")}</li>
                            <li>{translator("Access topic resources (PDFs) using credits.", "क्रेडिट का उपयोग करके विषय संसाधनों (पीडीएफ) तक पहुंचें।")}</li>
                            <li>{translator("Quizzes: Attempt up to 50 questions.", "क्विज़: 50 प्रश्नों तक प्रयास करें।")}</li>
                            <li>{translator("Doubts: Ask up to 30 per day.", "संदेह: प्रति दिन 30 तक पूछें।")}</li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("AI Interview", "AI इंटरव्यू")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("Use real-time simulations (within credit limit).", "वास्तविक समय सिमुलेशन का उपयोग करें (क्रेडिट सीमा के भीतर)।")}</li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("Exam Mode", "परीक्षा मोड")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("Create and attempt:", "बनाएं और प्रयास करें:")}
                                <ul className="list-circle ml-5">
                                    <li>{translator("50 MCQs", "50 एमसीक्यू")}</li>
                                    <li>{translator("20 long-answer exams", "20 दीर्घ-उत्तर परीक्षाएँ")}</li>
                                </ul>
                            </li>
                            <li>
                                <strong>{translator("Bonus Access:", "बोनस एक्सेस:")}</strong> {translator("Unlock 1 premium syllabus (NEET, JEE, CA,etc and lesser than Rs 50) for free.", "1 प्रीमियम सिलेबस (नीट, जेईई, सीए) मुफ्त में अनलॉक करें।")}
                            </li>
                        </ul>
                        <p className="mt-2 text-sm text-gray-600 italic">
                            {translator(
                                "Note: Plus users receive higher priority than Freemium. Responses are faster and waiting time is shorter.",
                                "नोट: प्लस उपयोगकर्ताओं को फ्रीमियम की तुलना में उच्च प्राथमिकता प्राप्त होती है। प्रतिक्रियाएं तेज़ होती हैं और प्रतीक्षा समय कम होता है।"
                            )}
                        </p>
                    </div>

                    <hr className="my-6 border-t border-gray-200" />

                    {/* 3. Premium Plan – Terms of Use */}
                    <div>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">
                            {translator("3. Premium Plan – Terms of Use", "3. प्रीमियम प्लान – उपयोग की शर्तें")}
                        </h2>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>
                                <strong>{translator("Credits:", "क्रेडिट:")}</strong> {translator("210 (includes 10 bonus credits).", "210 (10 बोनस क्रेडिट शामिल)।")}
                            </li>
                            <li>
                                <strong>{translator("PDF/Text to Animation Video:", "पीडीएफ/टेक्स्ट से एनिमेशन वीडियो:")}</strong> {translator("Use freely as per credits.", "क्रेडिट के अनुसार स्वतंत्र रूप से उपयोग करें।")}
                            </li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("Smart Resource Finder (SRF)", "स्मार्ट संसाधन खोजक (एसआरएफ)")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("Schedule up to 15 plans (Normal + Targeting syllabus).", "15 योजनाओं तक शेड्यूल करें (सामान्य + लक्षित पाठ्यक्रम)।")}</li>
                            <li>{translator("Access current/focused day's videos.", "वर्तमान/केंद्रित दिन के वीडियो तक पहुंचें।")}</li>
                            <li>{translator("View all topic-related resources (PDFs) within credit limits.", "क्रेडिट सीमाओं के भीतर सभी विषय-संबंधी संसाधन (पीडीएफ) देखें।")}</li>
                            <li>{translator("Quizzes: Attempt unlimited questions (within credits).", "क्विज़: असीमित प्रश्न (क्रेडिट के भीतर) प्रयास करें।")}</li>
                            <li>{translator("Doubts: Ask up to 60 per day.", "संदेह: प्रति दिन 60 तक पूछें।")}</li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("AI Interview", "AI इंटरव्यू")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("Use unlimited real-time Q&A (within credits).", "असीमित वास्तविक समय प्रश्नोत्तरी का उपयोग करें (क्रेडिट के भीतर)।")}</li>
                        </ul>

                        <h3 className="font-medium text-lg mt-4 mb-2 text-[#3A1078]">{translator("Exam Mode", "परीक्षा मोड")}</h3>
                        <ul className="list-disc ml-5 space-y-2">
                            <li>{translator("Create and attempt:", "बनाएं और प्रयास करें:")}
                                <ul className="list-circle ml-5">
                                    <li>{translator("100 MCQs", "100 एमसीक्यू")}</li>
                                    <li>{translator("40 long-answer exams", "40 दीर्घ-उत्तर परीक्षाएँ")}</li>
                                </ul>
                            </li>
                            <li>
                                <strong>{translator("Bonus Access:", "बोनस एक्सेस:")}</strong> {translator("Unlock any 3 premium syllabi (NEET, JEE, CA) for free.", "किसी भी 3 प्रीमियम सिलेबस (नीट, जेईई, सीए) को मुफ्त में अनलॉक करें।")}
                            </li>
                        </ul>
                        <p className="mt-2 text-sm text-gray-600 italic">
                            {translator(
                                "Note: Premium users are given top priority. Output is delivered quickly with minimal waiting time.",
                                "नोट: प्रीमियम उपयोगकर्ताओं को शीर्ष प्राथमिकता दी जाती है। आउटपुट न्यूनतम प्रतीक्षा समय के साथ तेज़ी से वितरित किया जाता है।"
                            )}
                        </p>
                    </div>

                    <hr className="my-6 border-t border-gray-200" />

                    {/* Credit Usage Table */}
                    <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">
                        {translator("Feature Credit Usage", "फ़ीचर क्रेडिट उपयोग")}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border-b text-left">{translator("Feature", "फ़ीचर")}</th>
                                    <th className="py-2 px-4 border-b text-left">{translator("Credit Usage", "क्रेडिट उपयोग")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-2 px-4 border-b">{translator("PDF/Text to Animation Video", "पीडीएफ/टेक्स्ट से एनिमेशन वीडियो")}</td>
                                    <td className="py-2 px-4 border-b">{translator("Each animation image = 0.15 credits", "प्रत्येक एनिमेशन छवि = 0.15 क्रेडिट")} <br />
                                        {translator("Each Page summarization = 0.05 credits", "प्रत्येक पृष्ठ का संक्षिप्तीकरण = 0.05 क्रेडिट")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">{translator("Study Planner Creation (Resource Finder)", "स्टडी प्लानर क्रिएशन (रिसोर्स फाइंडर)")}</td>
                                    <td className="py-2 px-4 border-b">{translator("Per scheduled plan = 2–3 credits", "प्रति निर्धारित योजना = 2–3 क्रेडिट")}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">{translator("Video Types in Smart Resource", "स्मार्ट संसाधन में वीडियो प्रकार")}</td>
                                    <td className="py-2 px-4 border-b">
                                        {translator("Short = 0.05 credits", "लघु = 0.05 क्रेडिट")}<br />
                                        {translator("Medium = 0.083 credits", "मध्यम = 0.083 क्रेडिट")}<br />
                                        {translator("Long = 0.133 credits", "दीर्घ = 0.133 क्रेडिट")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">{translator("MCQ/Written Exam Mode", "एमसीक्यू परीक्षा मोड")}</td>
                                    <td className="py-2 px-4 border-b">
                                        {translator("Per question = 0.2 credits", "प्रति प्रश्न = 0.2 क्रेडिट")}<br />
                                        {translator("10 questions = 2 credits", "10 प्रश्न = 2 क्रेडिट")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">{translator("Doubt Conversation", "संदेह वार्तालाप")}</td>
                                    <td className="py-2 px-4 border-b">0.033 {translator("Credit Coins", "क्रेडिट सिक्के")}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">{translator("AI Note Generation", "AI नोट जनरेशन")}</td>
                                    <td className="py-2 px-4 border-b">0.25 {translator("Credit Coins", "क्रेडिट सिक्के")}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">{translator("Smart Resource PDF Notes", "स्मार्ट संसाधन पीडीएफ")}</td>
                                    <td className="py-2 px-4 border-b">0.25 {translator("Credit Coins", "क्रेडिट सिक्के")}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 border-b">{translator("1 Uploaded Page for AI Answer Evaluation", "AI उत्तर मूल्यांकन के लिए 1 अपलोड किया गया पृष्ठ")}</td>
                                    <td className="py-2 px-4 border-b">0.166 {translator("Credit Coins", "क्रेडिट सिक्के")}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4">
                        {translator("You can purchase additional credit coins as needed.", "आप आवश्यकतानुसार अतिरिक्त क्रेडिट सिक्के खरीद सकते हैं।")}
                    </p>
                    <p className="mt-2">
                        <strong>{translator("🪙 The cost of One Credit Coin is roughly around = ₹2.99 INR (~$0.035 USD).", "🪙 एक क्रेडिट सिक्के की लागत लगभग = ₹2.99 INR (~$0.035 USD) है।")}</strong>
                    </p>

                    <hr className="my-6 border-t border-gray-200" />

                    {/* Refund Policy section */}
                    <div>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">
                            {translator("AI Classroom – Refund Policy", "AI क्लासरूम – रिफंड नीति")}
                        </h2>
                        <p>
                            {translator(
                                "At AI Classroom, we strive to provide high-quality AI-driven educational experiences for all our users. Due to the nature of our services—where digital credits are consumed upon feature usage—we have established the following refund policy to ensure fairness and clarity:",
                                "AI क्लासरूम में, हम अपने सभी उपयोगकर्ताओं के लिए उच्च-गुणवत्ता वाले AI-संचालित शैक्षिक अनुभव प्रदान करने का प्रयास करते हैं। हमारी सेवाओं की प्रकृति के कारण—जहां सुविधा के उपयोग पर डिजिटल क्रेडिट्स का उपभोग होता है—हमने निष्पक्षता और स्पष्टता सुनिश्चित करने के लिए निम्नलिखित वापसी नीति स्थापित की है:"
                            )}
                        </p>

                        <h3 className="font-semibold text-lg mt-4 mb-2 text-[#3A1078]">{translator("1. No Refund on Used Credits", "1. उपयोग किए गए क्रेडिट पर कोई वापसी नहीं")}</h3>
                        <p>
                            {translator(
                                "Once credits have been used—whether for videos, study plans, interviews, quizzes, or any other feature—they cannot be refunded under any circumstance. This applies to all plans (Freemium, Plus, Premium).",
                                "एक बार जब क्रेडिट का उपयोग हो जाता है—चाहे वीडियो, अध्ययन योजनाओं, इंटरव्यूों, क्विज़ या किसी अन्य सुविधा के लिए—तो उन्हें किसी भी परिस्थिति में वापस नहीं किया जा सकता है। यह सभी योजनाओं (फ्रीमियम, प्लस, प्रीमियम) पर लागू होता है।"
                            )}
                        </p>

                        <h3 className="font-semibold text-lg mt-4 mb-2 text-[#3A1078]">{translator("2. Non-Refundable Plans", "2. गैर-वापसी योग्य योजनाएं")}</h3>
                        <p>
                            {translator(
                                "All subscription purchases (Plus and Premium) are considered final. Once payment is successfully made and credits are delivered to your account, no refunds will be issued, including but not limited to:",
                                "सभी सदस्यता खरीद (प्लस और प्रीमियम) अंतिम मानी जाती हैं। एक बार जब भुगतान सफलतापूर्वक हो जाता है और क्रेडिट आपके खाते में वितरित हो जाते हैं, तो कोई वापसी जारी नहीं की जाएगी, जिसमें शामिल हैं, लेकिन इन्हीं तक सीमित नहीं है:"
                            )}
                        </p>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>{translator("Change of mind", "विचार में बदलाव")}</li>
                            <li>{translator("Accidental purchase", "आकस्मिक खरीद")}</li>
                            <li>{translator("Partial usage of credits", "क्रेडिट का आंशिक उपयोग")}</li>
                            <li>{translator("Technical issues not reported within 24 hours", "24 घंटे के भीतर रिपोर्ट नहीं की गई तकनीकी समस्याएं")}</li>
                        </ul>

                        <h3 className="font-semibold text-lg mt-4 mb-2 text-[#3A1078]">{translator("3. Refunds for Technical Errors (If Applicable)", "3. तकनीकी त्रुटियों के लिए वापसी (यदि लागू हो)")}</h3>
                        <p>
                            {translator(
                                "If a user faces a technical issue where:",
                                "यदि कोई उपयोगकर्ता किसी तकनीकी समस्या का सामना करता है जहां:"
                            )}
                        </p>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>{translator("Credits are deducted but the feature fails to load or complete properly", "क्रेडिट काट लिए जाते हैं लेकिन सुविधा ठीक से लोड या पूरी नहीं होती है")}</li>
                            <li>{translator("The animation, video, exam, or output is not delivered due to a system fault", "एनिमेशन, वीडियो, परीक्षा, या आउटपुट सिस्टम की खराबी के कारण वितरित नहीं होता है")}</li>
                        </ul>
                        <p className="mt-2">
                            {translator(
                                "Then, the user may request a credit restoration or refund, provided that:",
                                "तो, उपयोगकर्ता क्रेडिट बहाली या वापसी का अनुरोध कर सकता है, बशर्ते कि:"
                            )}
                        </p>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>{translator("The issue is reported within 24 hours of occurrence.", "समस्या घटने के 24 घंटे के भीतर रिपोर्ट की जाती है।")}</li>
                            <li>{translator("Sufficient proof (screenshot, video, or log) is submitted to support the claim.", "दावे का समर्थन करने के लिए पर्याप्त प्रमाण (स्क्रीनशॉट, वीडियो, या लॉग) जमा किया जाता है।")}</li>
                            <li>{translator("The issue is verified and acknowledged by the AI Classroom technical team.", "समस्या को AI क्लासरूम तकनीकी टीम द्वारा सत्यापित और स्वीकार किया जाता है।")}</li>
                        </ul>
                        <p className="mt-2">
                            {translator(
                                "Refunds (or re-crediting) will be processed only for valid and verifiable issues.",
                                "वापसी (या पुन: क्रेडिटिंग) केवल वैध और सत्यापन योग्य मुद्दों के लिए संसाधित की जाएगी।"
                            )}
                        </p>

                        <h3 className="font-semibold text-lg mt-4 mb-2 text-[#3A1078]">{translator("4. No Refund for Freemium Users", "4. फ्रीमियम उपयोगकर्ताओं के लिए कोई वापसी नहीं")}</h3>
                        <p>
                            {translator(
                                "Since the Freemium plan is free of cost, there is no refund or re-credit policy applicable for free daily credits or features.",
                                "चूंकि फ्रीमियम योजना निःशुल्क है, इसलिए मुफ्त दैनिक क्रेडिट या सुविधाओं के लिए कोई वापसी या पुन: क्रेडिट नीति लागू नहीं है।"
                            )}
                        </p>

                        <h3 className="font-semibold text-lg mt-4 mb-2 text-[#3A1078]">{translator("5. Contact for Support", "5. सहायता के लिए संपर्क करें")}</h3>
                        <p>
                            {translator(
                                "If you believe your case qualifies for a refund or credit restoration, please contact us within 24 hours at:",
                                "यदि आपको लगता है कि आपका मामला वापसी या क्रेडिट बहाली के लिए योग्य है, तो कृपया 24 घंटे के भीतर हमसे संपर्क करें:"
                            )}
                        </p>
                        <p className="mt-2">
                            📧 support@aiclassroom.in
                        </p>
                        <p className="mt-2">
                            {translator(
                                "Our team will respond within 2–3 business days after verifying your request.",
                                "हमारी टीम आपके अनुरोध को सत्यापित करने के बाद 2-3 व्यावसायिक दिनों के भीतर जवाब देगी।"
                            )}
                        </p>

                        <h3 className="font-semibold text-lg mt-4 mb-2 text-[#3A1078]">{translator("Policy Updates", "नीति अपडेट")}</h3>
                        <p>
                            {translator(
                                "AI Classroom reserves the right to modify or update this refund policy at any time without prior notice. Please review this page periodically for any changes.",
                                "AI क्लासरूम बिना किसी पूर्व सूचना के किसी भी समय इस वापसी नीति को संशोधित या अपडेट करने का अधिकार सुरक्षित रखता है। किसी भी बदलाव के लिए कृपया इस पृष्ठ की समय-समय पर समीक्षा करें।"
                            )}
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col items-center space-y-6 mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="px-8 py-3 text-lg font-semibold text-white rounded-lg shadow-md transition-colors duration-300 ease-in-out bg-[#8B64E8] hover:bg-[#6a0dad] focus:ring-4 focus:ring-[#8B64E8] focus:ring-opacity-50 cursor-pointer"
                    >
                        {translator("Close", "बंद करें")}
                    </button>
                </div>
            </div>
        </div>
    );
}