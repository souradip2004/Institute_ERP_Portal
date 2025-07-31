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

export default function PrivacyGuidelines() {
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
                        {translator("Privacy Policy", "गोपनीयता नीति")}
                    </h1>
                </div>

                {/* Scrollable Content Area */}
                <div className="w-full overflow-y-auto pr-2 pb-6 space-y-8 text-gray-800 text-base leading-relaxed" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                    <section>
                        <p>
                            {translator(
                                "Welcome to AI Classroom! Your privacy is very important to us. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our website, mobile app, and related services.",
                                "AI क्लासरूम में आपका स्वागत है! आपकी गोपनीयता हमारे लिए बहुत महत्वपूर्ण है। यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट, मोबाइल ऐप और संबंधित सेवाओं का उपयोग करते हैं तो हम आपकी व्यक्तिगत जानकारी को कैसे एकत्रित, उपयोग, साझा और सुरक्षित रखते हैं।"
                            )}
                        </p>
                        <p className="mt-2">
                            {translator(
                                "By accessing or using AI Classroom, you agree to the practices described in this policy.",
                                "AI क्लासरूम का उपयोग या पहुँच करके, आप इस नीति में वर्णित प्रथाओं से सहमत होते हैं।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("1. Information We Collect", "1. हम जो जानकारी एकत्रित करते हैं")}</h2>
                        <p>
                            {translator(
                                "We collect the following types of information:",
                                "हम निम्नलिखित प्रकार की जानकारी एकत्रित करते हैं:"
                            )}
                        </p>
                        <h3 className="font-semibold text-lg mt-4 mb-1 text-[#3A1078]">{translator("a. Personal Information", "ए. व्यक्तिगत जानकारी")}</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{translator("Name", "नाम")}</li>
                            <li>{translator("Email address", "ईमेल पता")}</li>
                            <li>{translator("Mobile number", "मोबाइल नंबर")}</li>
                            <li>{translator("Institution name (if applicable)", "संस्था का नाम (यदि लागू हो)")}</li>
                            <li>{translator("Class/Grade and subjects of interest", "कक्षा/ग्रेड और रुचि के विषय")}</li>
                        </ul>

                        <h3 className="font-semibold text-lg mt-4 mb-1 text-[#3A1078]">{translator("b. Usage Data", "बी. उपयोग डेटा")}</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{translator("Your activity on the platform (features used, credits consumed, videos watched, etc.)", "प्लेटफ़ॉर्म पर आपकी गतिविधि (उपयोग की गई सुविधाएँ, खपत की गई क्रेडिट, देखे गए वीडियो आदि)")}</li>
                            <li>{translator("Your device information (type, IP address, browser)", "आपकी डिवाइस जानकारी (प्रकार, आईपी पता, ब्राउज़र)")}</li>
                            <li>{translator("Time and duration of use", "उपयोग का समय और अवधि")}</li>
                        </ul>

                        <h3 className="font-semibold text-lg mt-4 mb-1 text-[#3A1078]">{translator("c. Uploaded Content", "सी. अपलोड की गई सामग्री")}</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{translator("PDF files, text, or images you upload for animation or exam generation", "एनिमेशन या परीक्षा जनरेशन के लिए आप जो पीडीएफ फाइलें, टेक्स्ट या छवियाँ अपलोड करते हैं")}</li>
                            <li>{translator("Doubts, messages, and queries asked during AI interactions", "AI इंटरैक्शन के दौरान पूछे गए संदेह, संदेश और प्रश्न")}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("2. How We Use Your Information", "2. हम आपकी जानकारी का उपयोग कैसे करते हैं")}</h2>
                        <p>
                            {translator(
                                "Your data is used to:",
                                "आपके डेटा का उपयोग इन उद्देश्यों के लिए किया जाता है:"
                            )}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{translator("Provide and personalize learning features and recommendations", "सीखने की सुविधाएँ और सिफारिशें प्रदान करना और व्यक्तिगत बनाना")}</li>
                            <li>{translator("Track your credit usage and manage your subscription plan", "आपकी क्रेडिट उपयोग को ट्रैक करना और आपकी सदस्यता योजना का प्रबंधन करना")}</li>
                            <li>{translator("Improve our AI models and educational tools", "हमारे AI मॉडल और शैक्षिक उपकरणों में सुधार करना")}</li>
                            <li>{translator("Send important updates, offers, or educational alerts", "महत्वपूर्ण अपडेट, ऑफ़र या शैक्षिक अलर्ट भेजना")}</li>
                            <li>{translator("Respond to your support queries and technical issues", "आपकी सहायता प्रश्नों और तकनीकी मुद्दों का जवाब देना")}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("3. Sharing of Information", "3. जानकारी साझा करना")}</h2>
                        <p>
                            {translator(
                                "We do not sell or rent your personal information.",
                                "हम आपकी व्यक्तिगत जानकारी को बेचते या किराए पर नहीं देते हैं।"
                            )}
                        </p>
                        <p className="mt-2">
                            {translator(
                                "We may share limited data with:",
                                "हम सीमित डेटा साझा कर सकते हैं:"
                            )}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{translator("Trusted service providers (for payment, cloud hosting, analytics)", "विश्वसनीय सेवा प्रदाता (भुगतान, क्लाउड होस्टिंग, विश्लेषण के लिए)")}</li>
                            <li>{translator("Institutions or schools (only if registered under a commercial partnership)", "संस्थान या स्कूल (केवल यदि वाणिज्यिक साझेदारी के तहत पंजीकृत हों)")}</li>
                            <li>{translator("Government or legal authorities, if required by law", "सरकारी या कानूनी अधिकारी, यदि कानून द्वारा आवश्यक हो")}</li>
                        </ul>
                        <p className="mt-2">
                            {translator(
                                "All shared data is strictly protected under confidentiality agreements.",
                                "सभी साझा डेटा गोपनीयता समझौतों के तहत सख्ती से संरक्षित है।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("4. Data Security", "4. डेटा सुरक्षा")}</h2>
                        <p>
                            {translator(
                                "We implement strong security measures to protect your data:",
                                "हम आपके डेटा को सुरक्षित रखने के लिए मजबूत सुरक्षा उपाय लागू करते हैं:"
                            )}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{translator("Encrypted storage and data transmission (SSL)", "एन्क्रिप्टेड स्टोरेज और डेटा ट्रांसमिशन (एसएसएल)")}</li>
                            <li>{translator("Access control and regular system monitoring", "पहुँच नियंत्रण और नियमित सिस्टम निगरानी")}</li>
                            <li>{translator("Periodic security audits", "आवधिक सुरक्षा ऑडिट")}</li>
                        </ul>
                        <p className="mt-2">
                            {translator(
                                "Despite these efforts, no method of internet transmission is 100% secure. Users are encouraged to protect their own login credentials.",
                                "इन प्रयासों के बावजूद, इंटरनेट ट्रांसमिशन का कोई भी तरीका 100% सुरक्षित नहीं है। उपयोगकर्ताओं को अपने लॉगिन क्रेडेंशियल्स की सुरक्षा के लिए प्रोत्साहित किया जाता है।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("5. Children’s Privacy", "5. बच्चों की गोपनीयता")}</h2>
                        <p>
                            {translator(
                                "AI Classroom is designed for educational purposes. If you are under 18, you must use this platform under supervision of a parent, guardian, or school authority.",
                                "AI क्लासरूम शैक्षिक उद्देश्यों के लिए डिज़ाइन किया गया है। यदि आप 18 वर्ष से कम हैं, तो आपको इस प्लेटफ़ॉर्म का उपयोग माता-पिता, अभिभावक या स्कूल प्राधिकरण की देखरेख में करना चाहिए।"
                            )}
                        </p>
                        <p className="mt-2">
                            {translator(
                                "We do not knowingly collect personal data from children without consent.",
                                "हम जानबूझकर सहमति के बिना बच्चों से व्यक्तिगत डेटा एकत्रित नहीं करते हैं।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("6. Your Rights", "6. आपके अधिकार")}</h2>
                        <p>
                            {translator(
                                "You have the right to:",
                                "आपको ये अधिकार हैं:"
                            )}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{translator("View and update your profile data", "अपनी प्रोफ़ाइल डेटा देखें और अपडेट करें")}</li>
                            <li>{translator("Request deletion of your account and related data", "अपने खाते और संबंधित डेटा को हटाने का अनुरोध करें")}</li>
                            <li>{translator("Opt out of non-essential communication", "गैर-आवश्यक संचार से बाहर निकलें")}</li>
                        </ul>
                        <p className="mt-2">
                            {translator(
                                "To exercise your rights, contact: support@aiclassroom.in",
                                "अपने अधिकारों का प्रयोग करने के लिए, संपर्क करें: support@aiclassroom.in"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("7. Cookies and Tracking", "7. कुकीज़ और ट्रैकिंग")}</h2>
                        <p>
                            {translator(
                                "We use cookies to:",
                                "हम कुकीज़ का उपयोग करते हैं:"
                            )}
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{translator("Save your login session", "आपकी लॉगिन सत्र को सहेजना")}</li>
                            <li>{translator("Analyze platform usage and improve performance", "प्लेटफ़ॉर्म उपयोग का विश्लेषण करना और प्रदर्शन में सुधार करना")}</li>
                        </ul>
                        <p className="mt-2">
                            {translator(
                                "You can control cookie preferences via your browser settings.",
                                "आप अपनी ब्राउज़र सेटिंग्स के माध्यम से कुकी वरीयताओं को नियंत्रित कर सकते हैं।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("8. Changes to This Policy", "8. इस नीति में परिवर्तन")}</h2>
                        <p>
                            {translator(
                                "We may update this policy occasionally. When we do, the 'Effective Date' will change. Significant changes will be communicated via email or platform notification.",
                                "हम इस नीति को समय-समय पर अपडेट कर सकते हैं। जब हम ऐसा करते हैं, तो 'प्रभावी तिथि' बदल जाएगी। महत्वपूर्ण परिवर्तनों को ईमेल या प्लेटफ़ॉर्म अधिसूचना के माध्यम से सूचित किया जाएगा।"
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-xl mb-2 text-[#3A1078]">{translator("9. Contact Us", "9. हमसे संपर्क करें")}</h2>
                        <p>
                            {translator(
                                "If you have questions or concerns about this Privacy Policy, please reach out to:",
                                "यदि आपके पास इस गोपनीयता नीति के बारे में प्रश्न या चिंताएँ हैं, तो कृपया संपर्क करें:"
                            )}
                        </p>
                        <p className="mt-2">
                            📧 support@aiclassroom.in
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