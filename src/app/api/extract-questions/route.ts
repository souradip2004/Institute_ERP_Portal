import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import axios from 'axios';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const API_URL = 'https://question-generation-76b332e-v1.app.beam.cloud';
const BEARER_TOKEN = "cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw==";

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
