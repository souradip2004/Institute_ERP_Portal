import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BEAM_API_URL = "https://question-generation-dfb21c3-v1.app.beam.cloud";
const BEAM_TOKEN = "qhZEcl0H-WNIMhaYUY3u_LTJxm34Z91YpX9ZB6P9KF48fjqYpE10MvnYzqLaXg_9f5mb4YjQr1YjAZZFOw_17Q==";

export async function POST(request: NextRequest) {
  try {
    const { pdf_url_list, no_of_questions, type_and_question_level } = await request.json();

    if (!pdf_url_list || !Array.isArray(pdf_url_list) || pdf_url_list.length === 0) {
      return NextResponse.json({ error: "Invalid PDF URL list" }, { status: 400 });
    }

    // Call the Beam API to generate questions
    const response = await axios.post(
      BEAM_API_URL,
      {
        pdf_url_list,
        no_of_questions,
        type_and_question_level: type_and_question_level || "Medium Level MCQ"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEAM_TOKEN}`
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate questions",
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}
