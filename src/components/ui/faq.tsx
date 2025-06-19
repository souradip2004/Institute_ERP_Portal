"use client";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  UserCircle,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
const HeaderLogo = "/logo.png";

import img from "./navlogo.png";

// Custom Accordion Components
const CustomAccordion = ({ children }) => (
  <div className="space-y-6">{children}</div>
);

const CustomAccordionItem = ({ value, children, className = "" }) => (
  <div className={`border rounded-lg p-4 bg-gray-50 hover:bg-purple-50 transition-colors duration-200 ${className}`}> {/* Increased p from 3 to 4 */}
    {children}
  </div>
);

const CustomAccordionTrigger = ({ children, isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 text-left w-full py-3 px-2 hover:text-purple-700 transition-colors duration-200" // Increased gap, py, and added px
  >
    <div className="bg-purple-100 rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-purple-200 transition-colors duration-200"> {/* Increased p, w, h */}
      <span className="text-purple-900 font-bold text-base">?</span> {/* Increased text-sm to text-base */}
    </div>
    <span className="font-medium text-purple-900 flex-grow hover:text-purple-700 transition-colors duration-200 text-xl"> {/* Increased text-lg to text-xl */}
      {children}
    </span>
    {isOpen ? (
      <ChevronUp className="h-7 w-7 text-purple-900 hover:text-purple-700 transition-colors duration-200" />
    ) : (
      <ChevronDown className="h-7 w-7 text-purple-900 hover:text-purple-700 transition-colors duration-200" /> 
    )}
  </button>
);

const CustomAccordionContent = ({ children, isOpen }) => (
  <div
    className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px]" : "max-h-0"
      }`}
  >
    <div className="pl-12 pr-8 pt-4 pb-6 text-gray-600 text-lg leading-relaxed"> {/* Increased pl, pr, pt, pb, text-base to text-lg */}
      {children}
    </div>
  </div>
);

// Translator function


export default function FAQ() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openItems, setOpenItems] = useState({});

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleItem = (value) => {
    setOpenItems((prev) => ({
      ...prev,
      [value]: !prev[value],
    }));
  };

  return (
    <>
      <div className="pt-[100px] pb-16">
        <h1 className="text-4xl font-bold text-purple-900 text-center mb-12">
          Popular Questions
        </h1>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <CustomAccordion>
            <CustomAccordionItem value="item-1">
              <CustomAccordionTrigger
                isOpen={openItems["item-1"]}
                onClick={() => toggleItem("item-1")}
              >
                What is AI Classroom?
              </CustomAccordionTrigger>
              <CustomAccordionContent isOpen={openItems["item-1"]}>
                AI Classroom is an AI-powered website developed by RnPsoft that can convert text or PDF documents into animations. It also features exam mode and interview mode.
              </CustomAccordionContent>
            </CustomAccordionItem>

            <CustomAccordionItem value="item-2">
              <CustomAccordionTrigger
                isOpen={openItems["item-2"]}
                onClick={() => toggleItem("item-2")}
              >
                Does AI Classroom have an Exam Mode?
              </CustomAccordionTrigger>
              <CustomAccordionContent isOpen={openItems["item-2"]}>
                Yes, it includes MCQs and answer-sheet-based exams.
              </CustomAccordionContent>
            </CustomAccordionItem>

            <CustomAccordionItem value="item-3">
              <CustomAccordionTrigger
                isOpen={openItems["item-3"]}
                onClick={() => toggleItem("item-3")}
              >
                Can AI Classroom Solve doubts instantly?
              </CustomAccordionTrigger>
              <CustomAccordionContent isOpen={openItems["item-3"]}>
                Yes, through direct voice interaction.
              </CustomAccordionContent>
            </CustomAccordionItem>

            <CustomAccordionItem value="item-4">
              <CustomAccordionTrigger
                isOpen={openItems["item-4"]}
                onClick={() => toggleItem("item-4")}
              >
                What are the pricing plans for AI Classroom?
              </CustomAccordionTrigger>
              <CustomAccordionContent isOpen={openItems["item-4"]}>
                AI Classroom requires credits to work, which can be purchased using UPI, credit, and debit cards. For detailed pricing information, please contact our sales team.
              </CustomAccordionContent>
            </CustomAccordionItem>

            <CustomAccordionItem value="item-5">
              <CustomAccordionTrigger
                isOpen={openItems["item-5"]}
                onClick={() => toggleItem("item-5")}
              >
                How does AI Classroom help in studying?
              </CustomAccordionTrigger>
              <CustomAccordionContent isOpen={openItems["item-5"]}>
                It provides better notes, real-time doubt solving, and an AI teacher.
              </CustomAccordionContent>
            </CustomAccordionItem>

            <CustomAccordionItem value="item-6">
              <CustomAccordionTrigger
                isOpen={openItems["item-6"]}
                onClick={() => toggleItem("item-6")}
              >
                What Languages does AI Classroom Support?
              </CustomAccordionTrigger>
              <CustomAccordionContent isOpen={openItems["item-6"]}>
                AI Classroom supports English, Hindi and Hinglish.
              </CustomAccordionContent>
            </CustomAccordionItem>
          </CustomAccordion>

          <div className="mt-8 p-8 border rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors duration-200"> {/* Increased p from 6 to 8 */}
            <p className="text-lg font-semibold text-gray-700 mb-3">Still have questions?</p> {/* Increased text size, mb */}
            <div className="text-base text-gray-500 mb-5 leading-relaxed"> {/* Increased text-sm to text-base, mb */}
              Can't find the answer you're looking for? Please chat with our friendly team.
            </div>
            <button
              className="w-full bg-purple-900 hover:bg-purple-800 text-white text-lg px-8 py-4 rounded-xl transition-colors duration-200" // Added w-full, increased text size, px, py, rounded
              onClick={() => window.location.href = "https://aiclassroom.in/contact"}
            >
              Help desk
            </button>
          </div>
        </div>
      </div>
    </>
  );
}