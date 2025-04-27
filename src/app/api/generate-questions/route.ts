import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('=== GENERATE QUESTIONS API CALLED ===');
    
    const body = await req.json();
    const { pdfUrl, numberOfQuestions = 2 } = body;
    
    console.log('Request parameters:', {
      pdfUrl,
      numberOfQuestions
    });
    
    if (!pdfUrl) {
      console.log('Error: PDF URL is required');
      return NextResponse.json(
        { error: 'PDF URL is required' },
        { status: 400 }
      );
    }

    // Ensure the PDF URL is from our S3 bucket or add the S3 bucket prefix if needed
    const S3_BUCKET_URL = 'https://ideaverse-1.s3.eu-north-1.amazonaws.com/';
    let fullPdfUrl = pdfUrl;
    
    // If the URL doesn't start with https:// or http://, assume it's a relative path
    // in the S3 bucket and prepend the S3 bucket URL
    if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
      fullPdfUrl = `${S3_BUCKET_URL}${pdfUrl}`;
      console.log(`Added S3 bucket prefix to PDF URL: ${fullPdfUrl}`);
    }
    
    // Call the Beam API with the new URL and Bearer token
    const beamApiUrl = 'https://question-generation-f79eeb2-v1.app.beam.cloud';
    const beamApiKey = 'ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA==';
    
    console.log('⭐ CALLING EXTERNAL API ⭐');
    console.log(`API URL: ${beamApiUrl}`);
    console.log('Request payload:', {
      pdf_url_list: [fullPdfUrl], // Now an array, as shown in the curl example
      no_of_questions: numberOfQuestions, // Changed to match the curl example
      type_and_question_level: "Medium Level MCQ" // Changed to match the curl example
    });
    
    const beamApiResponse = await fetch(beamApiUrl, {
      method: 'POST',
      headers: {
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${beamApiKey}`
      },
      body: JSON.stringify({
        pdf_url_list: [fullPdfUrl], // Now an array, as shown in the curl example
        no_of_questions: numberOfQuestions, // Changed to match the curl example
        type_and_question_level: "Medium Level MCQ" // Changed to match the curl example
      }),
    });

    console.log(`Response status: ${beamApiResponse.status}`);
    
    if (!beamApiResponse.ok) {
      const errorText = await beamApiResponse.text();
      console.error('❌ BEAM API ERROR ❌');
      console.error(errorText);
      
      // Generate some basic fallback questions if the API fails
      if (beamApiResponse.status === 500) {
        console.log('Generating fallback questions due to API error');
        const fallbackQuestions = generateFallbackQuestions(numberOfQuestions);
        
        return NextResponse.json({
          questions: fallbackQuestions,
          api: {
            url: beamApiUrl,
            s3_bucket: S3_BUCKET_URL,
            pdf_url: fullPdfUrl,
            type: 'Fallback Questions (API Error)',
            error: errorText
          }
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to generate questions from the PDF' },
        { status: 500 }
      );
    }

    const beamData = await beamApiResponse.json();
    console.log('✅ BEAM API SUCCESS ✅');
    console.log(`Generated ${beamData.questions?.length || 0} questions`);
    
    return NextResponse.json({
      questions: beamData.questions || [],
      api: {
        url: beamApiUrl,
        s3_bucket: S3_BUCKET_URL,
        pdf_url: fullPdfUrl,
        type: 'Beam AI Question Generation'
      }
    });
  } catch (error: any) {
    console.error('❌ ERROR PROCESSING REQUEST ❌');
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to process the request' },
      { status: 500 }
    );
  }
}

// Fallback function to generate basic questions when the API fails
function generateFallbackQuestions(count: number = 5) {
  const basicQuestions = [
    {
      question: "What is the main topic covered in this PDF?",
      answer: ["The main topic needs to be filled in by the instructor"],
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct_indices: [0]
    },
    {
      question: "Which concept is most important according to the document?",
      answer: ["The important concept needs to be filled in by the instructor"],
      options: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
      correct_indices: [1]
    },
    {
      question: "What is the relationship between the key elements discussed?",
      answer: ["The relationship needs to be filled in by the instructor"],
      options: ["They are independent", "They are closely related", "They contradict each other", "They build upon each other"],
      correct_indices: [3]
    },
    {
      question: "Which example best illustrates the principle described?",
      answer: ["The principle needs to be filled in by the instructor"],
      options: ["Example A", "Example B", "Example C", "Example D"],
      correct_indices: [2]
    },
    {
      question: "What is the conclusion drawn in the document?",
      answer: ["The conclusion needs to be filled in by the instructor"],
      options: ["Conclusion A", "Conclusion B", "Conclusion C", "Conclusion D"],
      correct_indices: [0]
    },
    {
      question: "Which theory is supported by the evidence provided?",
      answer: ["The theory needs to be filled in by the instructor"],
      options: ["Theory X", "Theory Y", "Theory Z", "None of the above"],
      correct_indices: [1]
    },
    {
      question: "What method was used to analyze the data?",
      answer: ["The method needs to be filled in by the instructor"],
      options: ["Method 1", "Method 2", "Method 3", "Method 4"],
      correct_indices: [2]
    }
  ];
  
  // Return requested number of questions (or all if count > available)
  return basicQuestions.slice(0, Math.min(count, basicQuestions.length));
}