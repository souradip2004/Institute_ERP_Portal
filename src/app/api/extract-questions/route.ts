import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import axios from 'axios';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const API_URL = "https://question-generation-f79eeb2-v1.app.beam.cloud";
const BEARER_TOKEN = "ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA==";

interface Question {
  question: string;
  answer: string | string[] | null;
}

interface QuestionData {
  [key: string]: [string, string[], [string, string | string[]][]]
}

interface ApiResponse {
  final_questions_data: string;
}

export async function POST(req: NextRequest) {
  try {
    // Get auth token from cookie
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { pdfUrl, numQuestions = 2 } = await req.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: "PDF URL is required" }, { status: 400 });
    }

    // Call the Python API to generate questions
    const response = await axios.post<ApiResponse>(API_URL, {
      pdf_url_list: [pdfUrl],
      no_of_questions: numQuestions,
      type_and_question_level: "Medium Level MCQ"
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });

    // Parse the response data
    let parsedData: QuestionData;
    try {
      parsedData = JSON.parse(response.data.final_questions_data);
    } catch (parseError) {
      console.error("Failed to parse API response:", parseError);
      console.error("Raw response data:", response.data);
      return NextResponse.json({ error: "Failed to parse question data", rawData: response.data }, { status: 500 });
    }

    // Extract questions and answers
    const extractedQuestions: Question[] = [];
    Object.values(parsedData).forEach(([, , questions]) => {
      questions.forEach(([question, answer]) => {
        extractedQuestions.push({
          question,
          answer: typeof answer === "string" && answer.includes("a)") 
            ? answer 
            : Array.isArray(answer) 
              ? answer 
              : answer || null,
        });
      });
    });

    return NextResponse.json({ 
      success: true,
      questions: extractedQuestions
    });

  } catch (error: any) {
    console.error("Error extracting questions:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return NextResponse.json(
      { error: "Failed to extract questions", details: error.message, responseData: error.response?.data },
      { status: 500 }
    );
  }
}
