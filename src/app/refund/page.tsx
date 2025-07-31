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

export default function RefundPolicy() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);
    const [isCloseEnabled, setIsCloseEnabled] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setIsCloseEnabled(true);
        }
        return () => clearInterval(timer);
    }, [countdown]);

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
                        {translator("Refund Policy", "रिफंड नीति")}
                    </h1>
                </div>

                {/* Scrollable Content Area */}
                <div className="w-full overflow-y-auto pr-2 pb-6 space-y-8 text-gray-800 text-base leading-relaxed" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                    <p>
                        {translator(
                            "At AI Classroom, we strive to provide high-quality AI-driven educational experiences for all our users. Due to the nature of our services—where digital credits are consumed upon feature usage—we have established the following refund policy to ensure fairness and clarity:",
                            "AI क्लासरूम में, हम अपने सभी उपयोगकर्ताओं के लिए उच्च-गुणवत्ता वाले AI-संचालित शैक्षिक अनुभव प्रदान करने का प्रयास करते हैं। हमारी सेवाओं की प्रकृति के कारण—जहां सुविधा के उपयोग पर डिजिटल क्रेडिट्स का उपभोग होता है—हमने निष्पक्षता और स्पष्टता सुनिश्चित करने के लिए निम्नलिखित वापसी नीति स्थापित की है:"
                        )}
                    </p>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("1. No Refund on Used Credits", "1. उपयोग किए गए क्रेडिट पर कोई वापसी नहीं")}</h2>
                        <p>
                            {translator(
                                "Once credits have been used—whether for videos, study plans, interviews, quizzes, or any other feature—they cannot be refunded under any circumstance. This applies to all plans (Freemium, Plus, Premium).",
                                "एक बार जब क्रेडिट का उपयोग हो जाता है—चाहे वीडियो, अध्ययन योजनाओं, इंटरव्यूों, क्विज़ या किसी अन्य सुविधा के लिए—तो उन्हें किसी भी परिस्थिति में वापस नहीं किया जा सकता है। यह सभी योजनाओं (फ्रीमियम, प्लस, प्रीमियम) पर लागू होता है।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("2. Non-Refundable Plans", "2. गैर-वापसी योग्य योजनाएं")}</h2>
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
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("3. Refunds for Technical Errors (If Applicable)", "3. तकनीकी त्रुटियों के लिए वापसी (यदि लागू हो)")}</h2>
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
                            <li>{translator("Sufficient proof (screenshot, video, or log) is submitted to support the claim.", "दावे का समर्थन करने के लिए पर्याप्तD प्रमाण (स्क्रीनशॉट, वीडियो, या लॉग) जमा किया जाता है।")}</li>
                            <li>{translator("The issue is verified and acknowledged by the AI Classroom technical team.", "समस्या को AI क्लासरूम तकनीकी टीम द्वारा सत्यापित और स्वीकार किया जाता है।")}</li>
                        </ul>
                        <p className="mt-2">
                            {translator(
                                "Refunds (or re-crediting) will be processed only for valid and verifiable issues.",
                                "वापसी (या पुन: क्रेडिटिंग) केवल वैध और सत्यापन योग्य मुद्दों के लिए संसाधित की जाएगी।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("4. No Refund for Freemium Users", "4. फ्रीमियम उपयोगकर्ताओं के लिए कोई वापसी नहीं")}</h2>
                        <p>
                            {translator(
                                "Since the Freemium plan is free of cost, there is no refund or re-credit policy applicable for free daily credits or features.",
                                "चूंकि फ्रीमियम योजना निःशुल्क है, इसलिए मुफ्त दैनिक क्रेडिट या सुविधाओं के लिए कोई वापसी या पुन: क्रेडिट नीति लागू नहीं है।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("5. Contact for Support", "5. सहायता के लिए संपर्क करें")}</h2>
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
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("Policy Updates", "नीति अपडेट")}</h2>
                        <p>
                            {translator(
                                "AI Classroom reserves the right to modify or update this refund policy at any time without prior notice. Please review this page periodically for any changes.",
                                "AI क्लासरूम बिना किसी पूर्व सूचना के किसी भी समय इस वापसी नीति को संशोधित या अपडेट करने का अधिकार सुरक्षित रखता है। किसी भी बदलाव के लिए कृपया इस पृष्ठ की समय-समय पर समीक्षा करें।"
                            )}
                        </p>
                    </section>
                </div>

                {/* Footer actions (Close button) */}
                <div className="w-full flex flex-col items-center space-y-6 mt-6 pt-4 border-t border-gray-200">
                    {countdown > 0 && (
                        <p className="text-base text-gray-700 select-none flex-grow leading-tight">
                            {translator("You can close this page in ", "आप इस पेज को इतने सेकंड में बंद कर सकते हैं ")}{countdown}{translator(" seconds.", " सेकंड में।")}
                        </p>
                    )}
                    <button
                        disabled={!isCloseEnabled}
                        onClick={handleClose}
                        className={`px-8 py-3 text-lg font-semibold text-white rounded-lg shadow-md transition-colors duration-300 ease-in-out
                ${isCloseEnabled
                                ? 'bg-[#8B64E8] hover:bg-[#6a0dad] focus:ring-4 focus:focus:ring-[#8B64E8] focus:ring-opacity-50 cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {translator("Close", "बंद करें")}
                    </button>
                </div>
            </div>
        </div>
    );
}