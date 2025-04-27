import { NextRequest, NextResponse } from 'next/server';
import { S3Utils } from '@/utils/s3Utils';
import { PrismaClient } from '@prisma/client';
import { segregateFromPdf, checkAnswerWithModelKey, checkAnswerWithDiagramSupport } from '@/services/answer-sheet-checking-python-call-service';
const prisma = new PrismaClient();
import python_response_after_first_copy_check from '@/lib/python-response-after-first-copy-check.json'
import python_last_result_response from '@/lib/python-last-result-response.json';



export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 API: Starting the upload and grading process for student answer sheet');

  try {
    console.log('Step 1: Validating and extracting request data');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const examId = 'exam-123';
    // Fix: Ensure params is properly awaited
    // const studentId = params.id;

    if (!file) {
      console.log('❌ Step 1 Failed: No file provided in the request');
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log('Step 2: Uploading student answer sheet to S3');
    const s3Key = await uploadStudentAnswerSheetOnS3(file);
    const filePublicUrl = S3Utils.getPublicUrl(s3Key);
    console.log(`✅ Step 2 Complete: File uploaded to S3 with public URL: ${filePublicUrl}`);

    console.log('Step 3: Extracting answer content from PDF');
    const segregateResponse = await segregateFromPdf([filePublicUrl]);
    const segregateResponseJson = segregateResponse.ANS_KEY_JSON_Data;
    console.log('✅ Step 3 Complete: Answer content successfully extracted from PDF');
    const studentAnswerJson = JSON.stringify(segregateResponseJson, null, 2);

    console.log('Step 4: Retrieving teacher answer sheet from database');
    const teacherAnswerSheet = await getTeacherAnswerSheet(examId);
    if (!teacherAnswerSheet) {
      console.log('❌ Step 4 Failed: Teacher answer sheet not found');
      return NextResponse.json(
        { success: false, message: 'Teacher answer sheet not found for this exam' },
        { status: 404 }
      );
    }
    console.log(`✅ Step 4 Complete: Teacher answer sheet retrieved `);

    console.log('Step 5: Performing initial answer checking with model key');
    const modelJsonAnskey = teacherAnswerSheet.pythonParsedResponse;
    const studentJsonAns = studentAnswerJson;
    const configJson1 = teacherAnswerSheet.config1;

    // Step 5: Initial checking with model key
    // const checkingResponse = await checkAnswerWithModelKey(modelJsonAnskey, studentJsonAns, configJson1);
    // console.log('step 5.1 ans check with model key python server response: ', checkingResponse);

    // // Extract the latest result
    // let updatedScoresJson = JSON.stringify(checkingResponse.final_results_data?.[checkingResponse.final_results_data.length - 1]) || JSON.stringify(python_response_after_first_copy_check.final_results_data?.[0]);
    // console.log('✅ Step 5 Complete: Initial answer checking completed');

    // console.log('Step 6: Performing enhanced checking with diagram support');
    // const studentId = "test-uid-123";
    // const configJson2 = teacherAnswerSheet.config2;
    // const diagramDataJson = teacherAnswerSheet.config3;
    // const diagramCheckingResponse = await checkAnswerWithDiagramSupport(
    //   studentId,
    //   filePublicUrl,
    //   modelJsonAnskey,
    //   diagramDataJson,
    //   updatedScoresJson,
    //   configJson2
    // );
    // console.log('✅ Step 6 Complete: Enhanced checking with diagram support completed');

    // console.log('Step 7: Calculating total marks from grading response');

    const totalMarks = calculateTotalMarks(python_last_result_response);
    console.log(`✅ Step 7 Complete: Total marks calculated: ${totalMarks}`);

    console.log('Step 8: Saving student submission to database');
    const newSubmission = await saveStudentSubmission(examId, filePublicUrl, totalMarks);
    console.log(`✅ Step 8 Complete: Student submission saved with ID ${newSubmission.id}`);

    console.log('Step 9: Returning success response to client');
    return NextResponse.json({
      success: true,
      id: newSubmission.id,
      studentAnswerSheetPublicURL: filePublicUrl,
      totalMarks: totalMarks,
    });

  } catch (error: unknown) {
    console.error('❌ Error in student answer sheet processing:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process student answer sheet', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to upload file to S3
async function uploadStudentAnswerSheetOnS3(file: File) {
  console.log('📤 UPLOAD: Starting S3 upload process for file:', file.name);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to S3
  const s3Key = await S3Utils.uploadFile(
    buffer,
    file.name,
    file.type
  );

  console.log('✅ UPLOAD: File successfully uploaded to S3 with key:', s3Key);
  return s3Key;
}

// Helper function to get teacher answer sheet
async function getTeacherAnswerSheet(examId: string) {
  console.log('🔍 DB: Fetching teacher answer sheet for exam ID:', examId);
  try {
    const teacherAnswerSheet = await prisma.teacherAnswerSheet.findFirst({
      where: {
        examId: examId
      }
    });

    if (teacherAnswerSheet) {
      console.log('✅ DB: Teacher answer sheet found successfully');
    } else {
      console.log('⚠️ DB: No teacher answer sheet found for exam ID:', examId);
    }
    // Stringify the necessary fields
    console.log('\n\n\n\n---------------------------------------teacher model key-------------------------------------');
    // console.log( teacherAnswerSheet?.pythonParsedResponse?.[0]?.ANS_KEY_JSON_Data )
    const transformedSheet = {
      ...teacherAnswerSheet,
      config1: JSON.stringify(teacherAnswerSheet?.config1),
      config2: JSON.stringify(teacherAnswerSheet?.config2),
      config3: JSON.stringify(teacherAnswerSheet?.config3),
      pythonParsedResponse: teacherAnswerSheet?.pythonParsedResponse?.[0]?.ANS_KEY_JSON_Data ?? "{}"
    };

    return transformedSheet;
  } catch (error) {
    console.error('❌ DB ERROR: Failed to retrieve teacher answer sheet:', error);
    throw error;
  }
}

// Helper function to calculate total marks from grading response
function calculateTotalMarks(gradingResponse: any): number {
  console.log('🧮 CALCULATING: Extracting total marks from grading response');
  try {
    let totalMarks = 0;
    const finalResultJson = JSON.parse(gradingResponse.final_RESULT_JSON);

    // Sum up all the updated scores from each question
    for (const questionId in finalResultJson) {
      if (finalResultJson[questionId]['Updated_Score (?/10)']) {
        const score = parseFloat(finalResultJson[questionId]['Updated_Score (?/10)']);
        totalMarks += score;
        console.log(`➕ MARKS: Adding ${score} points for question ${questionId}`);
      } else if (finalResultJson[questionId]['Updated_Score (?/6)']) {
        // Handle alternative score format if present
        const score = parseFloat(finalResultJson[questionId]['Updated_Score (?/6)']);
        totalMarks += score;
        console.log(`➕ MARKS: Adding ${score} points for question ${questionId}`);
      }
    }

    console.log(`✅ CALCULATION: Total marks: ${totalMarks}`);
    return totalMarks;
  } catch (error) {
    console.error('❌ ERROR calculating total marks:', error);
    return 0; // Return 0 if calculation fails
  }
}

// Helper function to save student submission to database - updated to match DB schema
async function saveStudentSubmission(
  examId: string,
  answerSheetUrl: string,
  totalMarks: number,
) {
  console.log('💾 DB: Creating new student submission record');
  try {
    // Updated to match the actual DB schema
    const newSubmission = await prisma.studentSubmissionRecord.create({
      data: {
        examId,
        studentAnswerSheetURL: answerSheetUrl,
        totalMarks,
        // Add studentId and gradingDetails to schema or remove these fields
        // if they don't exist in the database schema
      },
    });

    console.log(`✅ DB: Student submission created with ID: ${newSubmission.id}`);
    return newSubmission;
  } catch (error) {
    console.error('❌ DB ERROR: Failed to create student submission:', error);
    throw error;
  }
}