import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("Hashed password:", hashedPassword);
  return hashedPassword;
}

async function main() {
  try {
    // Clear existing data (optional, comment out if not needed)
    // Commented out to avoid foreign key constraint errors
    /*
    await prisma.assignmentComment.deleteMany();
    await prisma.assignmentGroupMember.deleteMany();
    await prisma.assignmentGroup.deleteMany();
    await prisma.assignmentAttachment.deleteMany();
    await prisma.assignmentSubmission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.classStream.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.studentPerformanceMetric.deleteMany();
    await prisma.teacherPerformanceMetric.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.creditAllocation.deleteMany();
    await prisma.creditTransaction.deleteMany();
    await prisma.credit.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.VideoViewLog.deleteMany();
    await prisma.AIQuestionBank.deleteMany();
    await prisma.AIVideoContent.deleteMany();
    await prisma.answerScript.deleteMany();
    await prisma.examSubmission.deleteMany();
    await prisma.question.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.examType.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.attendanceSession.deleteMany();
    await prisma.attendanceSettings.deleteMany();
    await prisma.studentClassEnrollment.deleteMany();
    await prisma.classSection.deleteMany();
    await prisma.semester.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.course.deleteMany();
    await prisma.departmentHead.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.student.deleteMany();
    await prisma.department.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.subscriptionPlan.deleteMany();
    await prisma.institution.deleteMany();
    await prisma.authenticator.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    */

    // Generate random timestamps for unique emails
    const timestamp = Date.now();

    // Hash passwords for users
    const hashedPassword = await hashPassword("password123");

    // 1. SubscriptionPlan
    const subscriptionPlan = await prisma.subscriptionPlan.create({
      data: {
        name: "Basic Plan",
        description: "Basic plan for educational institutions",
        priceMonthly: 99.99,
        priceYearly: 999.99,
        pricePerStudent: 5.0,
        maxTeachers: 50,
        maxStudents: 500,
        videoCreditsIncluded: 100,
        questionPaperCreditsIncluded: 50,
        copyCheckingCreditsIncluded: 50,
        attendanceFeature: true,
        performanceAnalytics: true,
        aiVideoGeneration: true,
        aiQuestionGeneration: true,
        aiPaperChecking: true,
      },
    });

    // 2. Institution
    const institution = await prisma.institution.create({
      data: {
        name: "Springfield University",
        type: "University",
        address: "123 College Rd",
        city: "Springfield",
        state: "IL",
        country: "USA",
        postalCode: "62701",
        phone: "555-123-4567",
        email: `info-${timestamp}@springfield.edu`,
        website: "https://springfield.edu",
        logoUrl: "https://springfield.edu/logo.png",
        primaryColor: "#004080",
        subscriptionStatus: "ACTIVE",
        subscriptionEndDate: new Date("2026-04-16"),
        subscriptionPlan: { connect: { id: subscriptionPlan.id } },
      },
    });

    // 3. Department
    const department = await prisma.department.create({
      data: {
        name: "Computer Science",
        code: `CS-${timestamp}`,
        description: "Department of Computer Science",
        institution: { connect: { id: institution.id } },
      },
    });

    // 4. User (Admin, Teacher, Student)
    const adminUser = await prisma.user.create({
      data: {
        name: "Alice Admin",
        email: `alice-${timestamp}@springfield.edu`,
        username: `alice_admin_${timestamp}`,
        password: hashedPassword,
        role: "ADMIN",
        institution: { connect: { id: institution.id } },
        gender: "Female",
        dateOfBirth: new Date("1980-01-01"),
        address: "456 Admin St, Springfield, IL",
        phone: "555-987-6543",
      },
    });

    const teacherUser = await prisma.user.create({
      data: {
        name: "Bob Teacher",
        email: `bob-${timestamp}@springfield.edu`,
        username: `bob_teacher_${timestamp}`,
        password: hashedPassword,
        role: "TEACHER",
        institution: { connect: { id: institution.id } },
        gender: "Male",
        dateOfBirth: new Date("1975-06-15"),
        address: "789 Faculty Ave, Springfield, IL",
        phone: "555-456-7890",
      },
    });

    const studentUser = await prisma.user.create({
      data: {
        name: "Charlie Student",
        email: `charlie-${timestamp}@springfield.edu`,
        username: `charlie_student_${timestamp}`,
        password: hashedPassword,
        role: "STUDENT",
        institution: { connect: { id: institution.id } },
        gender: "Male",
        dateOfBirth: new Date("2000-03-20"),
        address: "123 Dorm Rd, Springfield, IL",
        phone: "555-321-6547",
      },
    });

    // 5. Teacher
    const teacher = await prisma.teacher.create({
      data: {
        user: { connect: { id: teacherUser.id } },
        teacherCode: `T001-${timestamp}`,
        qualification: "PhD in Computer Science",
        joiningDate: new Date("2010-08-01"),
        employmentStatus: "FULL_TIME",
        department: { connect: { id: department.id } },
        performanceScore: 85.5,
        lastEvaluationDate: new Date("2024-12-01"),
      },
    });

    // 6. Student
    const student = await prisma.student.create({
      data: {
        user: { connect: { id: studentUser.id } },
        studentRoll: `S001-${timestamp}`,
        parentGuardianName: "David Parent",
        parentGuardianPhone: "555-654-3210",
        parentGuardianEmail: "david@parent.com",
        department: { connect: { id: department.id } },
        batch: {
          create: {
            batchName: `2023-${timestamp} Batch`,
            year: 2023,
            department: { connect: { id: department.id } },
            maxStudents: 100,
          },
        },
        currentSemester: 4,
        currentYear: 2,
        enrollmentStatus: "ACTIVE",
      },
    });

    // 7. DepartmentHead
    const departmentHead = await prisma.departmentHead.create({
      data: {
        teacher: { connect: { id: teacher.id } },
        department: { connect: { id: department.id } },
        appointmentDate: new Date("2023-01-01"),
      },
    });

    // 8. Course
    const course = await prisma.course.create({
      data: {
        courseCode: `CS101-${timestamp}`,
        name: "Introduction to Programming",
        description: "Basic programming concepts using Python",
        creditHours: 3,
        courseType: "CORE",
        department: { connect: { id: department.id } },
        createdBy: { connect: { id: teacher.id } },
      },
    });

    // 9. Semester
    const semester = await prisma.semester.create({
      data: {
        name: "Spring 2025",
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-05-15"),
        institution: { connect: { id: institution.id } },
        isCurrent: true,
      },
    });

    // 10. Batch (already created in Student, fetching for reference)
    const batch = await prisma.batch.findFirst({
      where: { batchName: `2023-${timestamp} Batch` },
    });

    // 11. ClassSection
    const classSection = await prisma.classSection.create({
      data: {
        sectionName: "CS101-A",
        batch: { connect: { id: batch.id } },
        course: { connect: { id: course.id } },
        semester: { connect: { id: semester.id } },
        teacher: { connect: { id: teacher.id } },
        maxStudents: 50,
      },
    });

    // 12. StudentClassEnrollment
    const enrollment = await prisma.studentClassEnrollment.create({
      data: {
        student: { connect: { id: student.id } },
        classSection: { connect: { id: classSection.id } },
        enrollmentStatus: "ENROLLED",
      },
    });

    // 13. AttendanceSettings
    const attendanceSettings = await prisma.attendanceSettings.create({
      data: {
        institution: { connect: { id: institution.id } },
        minimumAttendancePercentage: 75.0,
        autoLockAttendance: true,
        autoLockAfterHours: 24,
        allowExcusedAbsences: true,
      },
    });

    // 14. AttendanceSession
    const attendanceSession = await prisma.attendanceSession.create({
      data: {
        classSection: { connect: { id: classSection.id } },
        teacher: { connect: { id: teacher.id } },
        sessionDate: new Date("2025-04-10"),
        startTime: new Date("2025-04-10T09:00:00Z"),
        endTime: new Date("2025-04-10T10:30:00Z"),
        sessionType: "LECTURE",
        status: "SCHEDULED",
      },
    });

    // 15. Attendance
    const attendance = await prisma.attendance.create({
      data: {
        attendanceSession: { connect: { id: attendanceSession.id } },
        student: { connect: { id: student.id } },
        status: "PRESENT",
        remarks: "On time",
        recordedBy: { connect: { id: teacher.id } },
        recordedAt: new Date("2025-04-10T09:15:00Z"),
        isLocked: false,
      },
    });

    // 16. ExamType
    const examType = await prisma.examType.create({
      data: {
        name: "Midterm",
        description: "Mid-semester examination",
        institution: { connect: { id: institution.id } },
        weightage: 30.0,
      },
    });

    // 17. Exam
    const exam = await prisma.exam.create({
      data: {
        title: "CS101 Midterm",
        description: "Midterm exam for Introduction to Programming",
        examType: { connect: { id: examType.id } },
        classSection: { connect: { id: classSection.id } },
        examDate: new Date("2025-03-15"),
        startTime: new Date("2025-03-15T10:00:00Z"),
        endTime: new Date("2025-03-15T12:00:00Z"),
        durationMinutes: 120,
        totalMarks: 100.0,
        passingMarks: 50.0,
        isPublished: true,
        createdBy: { connect: { id: teacher.id } },
        status: "PUBLISHED",
        isAiGenerated: false,
      },
    });

    // 18. Question
    const question = await prisma.question.create({
      data: {
        exam: { connect: { id: exam.id } },
        questionText: "Write a Python function to calculate factorial.",
        questionType: "CODING",
        marks: 20.0,
        difficultyLevel: "MEDIUM",
        correctAnswer: {
          code: "def factorial(n): return 1 if n == 0 else n * factorial(n-1)",
        },
        createdBy: { connect: { id: teacher.id } },
        isAiGenerated: false,
      },
    });

    // 19. ExamSubmission
    const examSubmission = await prisma.examSubmission.create({
      data: {
        exam: { connect: { id: exam.id } },
        student: { connect: { id: student.id } },
        submissionTime: new Date("2025-03-15T11:30:00Z"),
        obtainedMarks: 85.0,
        status: "GRADED",
        feedback: "Good implementation, minor optimization needed.",
        gradedBy: { connect: { id: teacher.id } },
        gradedAt: new Date("2025-03-16T10:00:00Z"),
      },
    });

    // 20. AnswerScript
    const answerScript = await prisma.answerScript.create({
      data: {
        examSubmission: { connect: { id: examSubmission.id } },
        question: { connect: { id: question.id } },
        studentAnswer:
          "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)",
        obtainedMarks: 18.0,
        remarks: "Correct logic, improve formatting.",
        status: "GRADED",
        gradedBy: { connect: { id: teacher.id } },
        gradedAt: new Date("2025-03-16T10:00:00Z"),
        isAiGraded: false,
      },
    });

    // 21. AIVideoContent
    const AIVideoContent = await prisma.AIVideoContent.create({
      data: {
        title: "Python Basics",
        description: "Introduction to Python programming",
        course: { connect: { id: course.id } },
        teacher: { connect: { id: teacher.id } },
        classSection: { connect: { id: classSection.id } },
        videoUrl: "https://springfield.edu/videos/python_basics.mp4",
        thumbnailUrl: "https://springfield.edu/videos/python_basics_thumb.jpg",
        durationSeconds: 1800,
        chunkData: { segments: ["intro", "variables", "loops"] },
        voiceUri: "en-US-Wavenet-D",
        teacherModelUri: "model_123",
        summary: "Covers variables, loops, and functions in Python.",
        notes: "Refer to Python documentation for advanced topics.",
        status: "READY",
        creditsUsed: 10,
        createdBy: { connect: { id: teacher.id } },
        version: 1,
      },
    });

    // 22. VideoViewLog
    const VideoViewLog = await prisma.VideoViewLog.create({
      data: {
        video: { connect: { id: AIVideoContent.id } },
        student: { connect: { id: student.id } },
        viewStarted: new Date("2025-04-01T14:00:00Z"),
        viewEnded: new Date("2025-04-01T14:30:00Z"),
        durationWatchedSeconds: 1800,
        completionPercentage: 100.0,
        feedback: "Very informative!",
        rating: 5,
      },
    });

    // 23. AIQuestionBank
    const AIQuestionBank = await prisma.AIQuestionBank.create({
      data: {
        title: "Python MCQs",
        course: { connect: { id: course.id } },
        teacher: { connect: { id: teacher.id } },
        questionType: "MCQ",
        questionCount: 50,
        difficultyLevel: "EASY",
        metadata: { topics: ["variables", "loops"] },
        status: "READY",
        createdBy: { connect: { id: teacher.id } },
        version: 1,
      },
    });

    // 24. Subscription
    const subscription = await prisma.subscription.create({
      data: {
        institution: { connect: { id: institution.id } },
        plan: { connect: { id: subscriptionPlan.id } },
        startDate: new Date("2025-01-01"),
        endDate: new Date("2026-01-01"),
        status: "ACTIVE",
        amountPaid: 999.99,
        paymentFrequency: "YEARLY",
        teachersCount: 10,
        studentsCount: 200,
      },
    });

    // 25. Credit
    const credit = await prisma.credit.create({
      data: {
        institution: { connect: { id: institution.id } },
        videoCreditsBalance: 100,
        questionPaperCreditsBalance: 50,
        copyCheckingCreditsBalance: 50,
        lastUpdated: new Date(),
      },
    });

    // 26. CreditTransaction
    const creditTransaction = await prisma.creditTransaction.create({
      data: {
        institution: { connect: { id: institution.id } },
        transactionType: "PURCHASE",
        creditType: "VIDEO",
        quantity: 50,
        description: "Purchased video credits",
        relatedEntityId: AIVideoContent.id,
        performedBy: { connect: { id: adminUser.id } },
      },
    });

    // 27. CreditAllocation
    const creditAllocation = await prisma.creditAllocation.create({
      data: {
        institution: { connect: { id: institution.id } },
        creditType: "VIDEO",
        quantity: 50,
        allocatedAt: new Date(),
        source: "SUBSCRIPTION",
      },
    });

    // 28. Invoice
    const invoice = await prisma.invoice.create({
      data: {
        institution: { connect: { id: institution.id } },
        subscription: { connect: { id: subscription.id } },
        invoiceNumber: "INV-001",
        issueDate: new Date("2025-01-01"),
        dueDate: new Date("2025-01-15"),
        amount: 999.99,
        status: "PAID",
        paymentMethod: "CREDIT_CARD",
        paymentReference: "PAY-123",
        paidAt: new Date("2025-01-10"),
      },
    });

    // 29. TeacherPerformanceMetric
    const teacherMetric = await prisma.teacherPerformanceMetric.create({
      data: {
        teacher: { connect: { id: teacher.id } },
        department: { connect: { id: department.id } },
        semester: { connect: { id: semester.id } },
        attendanceRegularityScore: 90.0,
        studentPerformanceScore: 85.0,
        contentQualityScore: 88.0,
        overallScore: 87.7,
        detailedMetrics: { comments: "Excellent teaching" },
        evaluationDate: new Date("2025-03-01"),
        evaluatedBy: { connect: { id: teacher.id } },
      },
    });

    // 30. StudentPerformanceMetric
    const studentMetric = await prisma.studentPerformanceMetric.create({
      data: {
        student: { connect: { id: student.id } },
        classSection: { connect: { id: classSection.id } },
        semester: { connect: { id: semester.id } },
        attendancePercentage: 95.0,
        overallGradePoints: 90.0,
        assignmentCompletionRate: 100.0,
        detailedMetrics: { strengths: ["Coding", "Participation"] },
        performanceCategory: "EXCELLENT",
      },
    });

    // 31. Notification
    const notification = await prisma.notification.create({
      data: {
        user: { connect: { id: studentUser.id } },
        title: "Welcome to CS101",
        message: "You have been enrolled in Introduction to Programming.",
        notificationType: "ENROLLMENT",
        isRead: false,
        actionUrl: `/courses/${course.id}`,
        channel: "EMAIL",
        templateId: "welcome_email",
      },
    });

    // 32. Announcement
    const announcement = await prisma.announcement.create({
      data: {
        title: "Course Start Announcement",
        content:
          "CS101 starts on January 15, 2025. Prepare your Python environment.",
        createdByTeacher: { connect: { id: teacher.id } },
        institution: { connect: { id: institution.id } },
        department: { connect: { id: department.id } },
        classSection: { connect: { id: classSection.id } },
        isImportant: true,
        isPinned: true,
        visibility: "STUDENTS",
        expiryDate: new Date("2025-02-01"),
      },
    });

    // 33. Assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: "Python Assignment 1",
        description: "Write a program to calculate Fibonacci sequence.",
        classSection: { connect: { id: classSection.id } },
        createdBy: { connect: { id: teacher.id } },
        dueDate: new Date("2025-04-20"),
        maxPoints: 50.0,
        isPublished: true,
        status: "IN_PROGRESS",
        submissionType: "INDIVIDUAL",
        allowLate: true,
        extensionDate: new Date("2025-04-22"),
        isAiGenerated: false,
        version: 1,
      },
    });

    // 34. AssignmentSubmission
    const assignmentSubmission = await prisma.assignmentSubmission.create({
      data: {
        assignment: { connect: { id: assignment.id } },
        student: { connect: { id: student.id } },
        submissionTime: new Date("2025-04-19T23:00:00Z"),
        obtainedPoints: 45.0,
        status: "GRADED",
        feedback: "Well done, improve variable naming.",
        gradedBy: { connect: { id: teacher.id } },
        gradedAt: new Date("2025-04-21T10:00:00Z"),
        isLate: false,
      },
    });

    // 35. AssignmentAttachment
    const assignmentAttachment = await prisma.assignmentAttachment.create({
      data: {
        submission: { connect: { id: assignmentSubmission.id } },
        fileUrl: "https://springfield.edu/uploads/fibonacci.py",
        fileName: "fibonacci.py",
        fileType: "text/x-python",
        fileSize: 1024,
        uploadedBy: { connect: { id: studentUser.id } },
      },
    });

    // 36. AssignmentGroup
    const assignmentGroup = await prisma.assignmentGroup.create({
      data: {
        classSection: { connect: { id: classSection.id } },
        name: "Group A",
      },
    });

    // 37. AssignmentGroupMember
    const groupMember = await prisma.assignmentGroupMember.create({
      data: {
        group: { connect: { id: assignmentGroup.id } },
        student: { connect: { id: student.id } },
      },
    });

    // 38. AssignmentComment
    const assignmentComment = await prisma.assignmentComment.create({
      data: {
        assignment: { connect: { id: assignment.id } },
        submission: { connect: { id: assignmentSubmission.id } },
        user: { connect: { id: teacherUser.id } },
        content: "Great work on the logic!",
      },
    });

    // 39. ClassStream
    const classStream = await prisma.classStream.create({
      data: {
        classSection: { connect: { id: classSection.id } },
        contentType: "ASSIGNMENT",
        contentId: assignment.id,
      },
    });

    // 40. CalendarEvent
    const calendarEvent = await prisma.calendarEvent.create({
      data: {
        title: "CS101 Assignment Due",
        description: "Python Assignment 1 due date",
        classSection: { connect: { id: classSection.id } },
        institution: { connect: { id: institution.id } },
        startTime: new Date("2025-04-20T23:59:00Z"),
        endTime: new Date("2025-04-20T23:59:00Z"),
        eventType: "ASSIGNMENT_DEADLINE",
        relatedEntityId: assignment.id,
        createdBy: { connect: { id: teacherUser.id } },
      },
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log("Seeding completed"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
