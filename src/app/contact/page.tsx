"use client"
import { useState } from "react";

import {
    Mail,
    Phone,
    MapPin,
    Send,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Mic,
    BookOpen,
    Globe,

} from "lucide-react";
import { FaRegLightbulb } from "react-icons/fa";
import { RiArrowGoBackFill } from "react-icons/ri";
import { IoIosMailOpen } from "react-icons/io";


const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateField = (name, value) => {
        switch (name) {
            case "name":
                if (!/^[a-zA-Z\s]*$/.test(value)) {
                    return "Name can only contain letters and spaces.";
                }
                break;
            case "phone":
                if (value && !/^[0-9]{0,15}$/.test(value)) {
                    return "Phone number can only contain digits (max 15).";
                }
                break;
            case "email":
                if (
                    value &&
                    !/^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,10})$/.test(value)
                ) {
                    return "Please enter a valid email address.";
                }
                break;
            default:
                return "";
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const errorMsg = validateField(name, value);
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: errorMsg,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const errorMsg = validateField(key, formData[key]);
            if (errorMsg) newErrors[key] = errorMsg;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        try {
            const response = await fetch("https://api.aiclassroom.in/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Thank you! Your message has been sent.");
            } else {
                alert(`Failed to send message: ${result.error}`);
            }
        } catch (error) {
            alert("An error occurred. Please try again later.");
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    const translator = (word1, word2) =>
        word1;

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gradient-to-tr from-[#EBCAFF] via-white to-[#EBCAFF]">
            <div className="flex flex-1 items-center justify-center py-8">
                <div className="flex flex-col md:flex-row bg-white/0 rounded-3xl shadow-xl max-w-5xl w-full mx-4">
                    {/* Left: Contact Form */}
                    <div className="flex-2 bg-white rounded-3xl md:rounded-r-none p-10 flex flex-col justify-center">
                        <h1 className="text-4xl font-bold mb-2 text-black">

                            <button className="mr-2" onClick={() => window.location.href = "/"}>
                                <RiArrowGoBackFill className='w-7 h-7 text-gray-600 hover:text-gray-800' />
                            </button>

                            Get in <span className="text-purple-700">Touch</span>
                        </h1>
                        <p className="mb-6 text-sm text-gray-700 font-medium">
                            Contact Our Team For Your Easy Setup Process
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            <textarea
                                name="message"
                                placeholder="Tell Us About You ....."
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 min-h-36 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                            ></textarea>
                            <button
                                type="submit"
                                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" /> SEND
                                    </>
                                )}
                            </button>
                        </form>
                        <div
                            className="md:hidden mt-4 bottom-4 flex justify-center text-center items-center gap-2 bg-white rounded-lg px-4 py-2 shadow cursor-pointer"
                            onClick={() => window.location.href = "mailto:support@aiclassroom.in"}
                        >
                            <IoIosMailOpen className="h-5 w-5 text-purple-700" />
                            <span className="text-xs text-purple-700 font-semibold cursor-pointer text-center">
                                support@aiclassroom.in
                            </span>
                        </div>
                    </div>
                    {/* Right: Classroom Card */}
                    <div className="hidden md:flex flex-1 bg-white rounded-r-3xl p-8 flex-col items-center justify-center relative">
                        <div className="w-full absolute top-10 -left-2 items-center mb-6">
                            <img
                                src="./contact_tab.png"
                                alt="Classroom Image"
                                className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto rounded-xl object-contain mb-4"
                            />
                            {/* You can add the text and button here if you want to keep them */}
                        </div>
                        <div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow cursor-pointer"
                            onClick={() => window.location.href = "mailto:support@aiclassroom.in"}
                        >
                            <IoIosMailOpen className="h-5 w-5 text-purple-700" />
                            <span className="text-xs text-purple-700 font-semibold cursor-pointer">
                                support@aiclassroom.in
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <footer className="w-full flex flex-col items-center justify-center py-4 bg-transparent">
                <div className="flex items-center gap-4 mb-2">
                    {/* <img src="https://placehold.co/40x40?text=AI" alt="AI Classroom Logo" className="h-8" />
          <span className="font-bold text-lg text-gray-800">AI Classroom</span>
          <span className="text-2xl text-gray-400">|</span>
          <img src="https://placehold.co/40x40?text=RnP" alt="RnPsoft Logo" className="h-8" />
          <span className="font-bold text-lg text-gray-800">RnPsoft™</span> */}
                    <img src="./contact_logo.png" alt="AI Classroom Logo" className="h-8 md:h-12" />
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
