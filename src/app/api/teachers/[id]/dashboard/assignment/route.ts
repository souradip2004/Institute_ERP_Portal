import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/services/teacherService';

const teacherService = new TeacherService();

export async function GET(req: NextRequest) {
  const pathParts = req.nextUrl.pathname.split('/');
  const teacherId = pathParts[pathParts.length - 3];
  console.log('teacherid:', teacherId);

  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
  }

  try {
    const assignment = await teacherService.getTeacherAssignment(teacherId);

    if (!assignment || !assignment.createdAssignments?.length) {
      return NextResponse.json({ data: [], status: 'success' }, { status: 200 });
    }

    // Organize the data
    const organizedData = organizeAssignmentData(assignment);

    return NextResponse.json({ data: organizedData, status: 'success' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// Helper function to organize the assignment data
function organizeAssignmentData(assignment: any): any[] {
  const sectionMap = new Map();

  // Since assignment is a single object, process its createdAssignments directly
  const createdAssignments = assignment.createdAssignments || [];

  createdAssignments.forEach((createdAssignment: any) => {
    const section = createdAssignment.classSection;
    if (!section) return;

    if (!sectionMap.has(section.id)) {
      sectionMap.set(section.id, {
        section: {
          sectionMetadata: {
            id: section.id,
            sectionName: section.sectionName,
            batchId: section.batchId,
            courseId: section.courseId,
            semesterId: section.semesterId,
            maxStudents: section.maxStudents,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          },
          assignments: []
        }
      });
    }

    const sectionData = sectionMap.get(section.id);

    // Process the assignment
    const assignmentData = {
      metadata: {
        id: createdAssignment.id,
        title: createdAssignment.title,
        description: createdAssignment.description,
        dueDate: createdAssignment.dueDate,
        maxPoints: createdAssignment.maxPoints,
        isPublished: createdAssignment.isPublished,
        status: createdAssignment.status,
        submissionType: createdAssignment.submissionType,
        allowLate: createdAssignment.allowLate,
        extensionDate: createdAssignment.extensionDate,
        isAiGenerated: createdAssignment.isAiGenerated,
        version: createdAssignment.version,
        createdAt: createdAssignment.createdAt,
        updatedAt: createdAssignment.updatedAt
      },
      submittedStudents: (createdAssignment.submissions || []).map((submission: any) => ({
        studentMetadata: {
          id: submission.student.id,
          userId: submission.student.userId,
          studentRoll: submission.student.studentRoll,
          parentGuardianName: submission.student.parentGuardianName,
          parentGuardianPhone: submission.student.parentGuardianPhone,
          parentGuardianEmail: submission.student.parentGuardianEmail,
          departmentId: submission.student.departmentId,
          batchId: submission.student.batchId,
          currentSemester: submission.student.currentSemester,
          currentYear: submission.student.currentYear,
          enrollmentStatus: submission.student.enrollmentStatus,
          user: {
            id: submission.student.user.id,
            name: submission.student.user.name,
            email: submission.student.user.email,
            username: submission.student.user.username,
            gender: submission.student.user.gender,
            dateOfBirth: submission.student.user.dateOfBirth,
            address: submission.student.user.address,
            phone: submission.student.user.phone,
            createdAt: submission.student.user.createdAt,
            updatedAt: submission.student.user.updatedAt,
            role: submission.student.user.role
          }
        },
        submissionMetadata: {
          id: submission.id,
          submissionTime: submission.submissionTime,
          obtainedPoints: submission.obtainedPoints,
          status: submission.status,
          feedback: submission.feedback,
          gradedAt: submission.gradedAt,
          isLate: submission.isLate,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
          attachments: (submission.attachments || []).map((attachment: any) => ({
            id: attachment.id,
            fileUrl: attachment.fileUrl,
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
            createdAt: attachment.createdAt
          })),
          comments: (submission.comments || []).map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            user: {
              id: comment.user.id,
              name: comment.user.name,
              email: comment.user.email,
              username: comment.user.username
            }
          }))
        }
      }))
    };

    sectionData.section.assignments.push(assignmentData);
  });

  // Convert map to array and sort assignments by createdAt (newest to oldest)
  const result = Array.from(sectionMap.values()).map(sectionData => {
    sectionData.section.assignments.sort((a: any, b: any) => 
      new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
    );
    return sectionData.section;
  });

  return result;
}




// export async function GET(req: NextRequest) {
//   const pathParts = req.nextUrl.pathname.split('/');
//   const teacherId = pathParts[pathParts.length - 3];
//   console.log('teacherid:', teacherId);

//   if (!teacherId) {
//     return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
//   }

//   try {
//     const assignments = await teacherService.getTeacherAssignment(teacherId);

//     if (!assignments || assignments.length === 0) {
//       return NextResponse.json({ data: [], status: 'success' }, { status: 200 });
//     }
// console.log('assignments:', assignments);
      
//     // Organize the data
//     const organizedData = organizeAssignmentData(assignments);

//     return NextResponse.json({ data: organizedData, status: 'success' }, { status: 200 });

//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
//   }
// }

// // Helper function to organize the assignment data
// function organizeAssignmentData(assignments: any[]): any[] {
//   // Group assignments by class section
//   const sectionMap = new Map();

//   assignments?.forEach(assignment => {
//     const section = assignment.createdAssignments[0]?.classSection;
//     if (!section) return;

//     if (!sectionMap.has(section.id)) {
//       sectionMap.set(section.id, {
//         section: {
//           metadata: {
//             id: section.id,
//             sectionName: section.sectionName,
//             batchId: section.batchId,
//             courseId: section.courseId,
//             semesterId: section.semesterId,
//             maxStudents: section.maxStudents,
//             createdAt: section.createdAt,
//             updatedAt: section.updatedAt
//           },
//           assignments: []
//         }
//       });
//     }

//     const sectionData = sectionMap.get(section.id);

//     // Process each assignment
//     assignment.createdAssignments.forEach((createdAssignment: any) => {
//       const assignmentData = {
//         metadata: {
//           id: createdAssignment.id,
//           title: createdAssignment.title,
//           description: createdAssignment.description,
//           dueDate: createdAssignment.dueDate,
//           maxPoints: createdAssignment.maxPoints,
//           isPublished: createdAssignment.isPublished,
//           status: createdAssignment.status,
//           submissionType: createdAssignment.submissionType,
//           allowLate: createdAssignment.allowLate,
//           extensionDate: createdAssignment.extensionDate,
//           isAiGenerated: createdAssignment.isAiGenerated,
//           version: createdAssignment.version,
//           createdAt: createdAssignment.createdAt,
//           updatedAt: createdAssignment.updatedAt
//         },
//         submittedStudents: createdAssignment.submissions.map((submission: any) => ({
//           studentMetadata: {
//             id: submission.student.id,
//             userId: submission.student.userId,
//             studentRoll: submission.student.studentRoll,
//             parentGuardianName: submission.student.parentGuardianName,
//             parentGuardianPhone: submission.student.parentGuardianPhone,
//             parentGuardianEmail: submission.student.parentGuardianEmail,
//             departmentId: submission.student.departmentId,
//             batchId: submission.student.batchId,
//             currentSemester: submission.student.currentSemester,
//             currentYear: submission.student.currentYear,
//             enrollmentStatus: submission.student.enrollmentStatus,
//             user: {
//               id: submission.student.user.id,
//               name: submission.student.user.name,
//               email: submission.student.user.email,
//               username: submission.student.user.username,
//               gender: submission.student.user.gender,
//               dateOfBirth: submission.student.user.dateOfBirth,
//               address: submission.student.user.address,
//               phone: submission.student.user.phone,
//               createdAt: submission.student.user.createdAt,
//               updatedAt: submission.student.user.updatedAt,
//               role: submission.student.user.role
//             }
//           },
//           submissionMetadata: {
//             id: submission.id,
//             submissionTime: submission.submissionTime,
//             obtainedPoints: submission.obtainedPoints,
//             status: submission.status,
//             feedback: submission.feedback,
//             gradedAt: submission.gradedAt,
//             isLate: submission.isLate,
//             createdAt: submission.createdAt,
//             updatedAt: submission.updatedAt,
//             attachments: submission.attachments.map((attachment: any) => ({
//               id: attachment.id,
//               fileUrl: attachment.fileUrl,
//               fileName: attachment.fileName,
//               fileType: attachment.fileType,
//               fileSize: attachment.fileSize,
//               createdAt: attachment.createdAt
//             })),
//             comments: submission.comments.map((comment: any) => ({
//               id: comment.id,
//               content: comment.content,
//               createdAt: comment.createdAt,
//               updatedAt: comment.updatedAt,
//               user: {
//                 id: comment.user.id,
//                 name: comment.user.name,
//                 email: comment.user.email,
//                 username: comment.user.username
//               }
//             }))
//           }
//         }))
//       };

//       sectionData.section.assignments.push(assignmentData);
//     });
//   });

//   // Convert map to array and sort assignments by createdAt (newest to oldest)
//   const result = Array.from(sectionMap.values()).map(sectionData => {
//     sectionData.section.assignments.sort((a: any, b: any) => 
//       new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
//     );
//     return sectionData.section;
//   });

//   return result;
// }