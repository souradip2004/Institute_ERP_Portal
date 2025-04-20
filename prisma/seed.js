import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Helper function to generate random dates within a range
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to log seeding progress
function logProgress(step, count, error = null) {
  if (error) {
    console.error(`❌ Failed to seed ${step}: ${error.message}`);
  } else {
    console.log(`✅ Seeded ${count} ${step}`);
  }
}

async function main() {
  try {
    // Clear existing data
    /**
    await prisma.assignmentComment.deleteMany();
    await prisma.assignmentGroupMember.deleteMany();
    await prisma.assignmentGroup.deleteMany();
    await prisma.assignmentAttachment.deleteMany();
    await prisma.assignmentSubmission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.classStream.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.noteAttachment.deleteMany();
    await prisma.note.deleteMany();
    await prisma.studentPerformanceMetric.deleteMany();
    await prisma.teacherPerformanceMetric.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.creditAllocation.deleteMany();
    await prisma.creditTransaction.deleteMany();
    await prisma.credit.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.videoViewLog.deleteMany();
    await prisma.aIQuestionBank.deleteMany();
    await prisma.aIVideoContent.deleteMany();
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
    console.log("🌱 Starting database seeding...");

    // Generate random timestamp for unique emails and codes
    const timestamp = Date.now();

    // Hash password for users
    const hashedPassword = await hashPassword("password123");

    // 1. SubscriptionPlan
    let subscriptionPlan;
    try {
      subscriptionPlan = await prisma.subscriptionPlan.create({
        data: {
          name: "Premium Plan",
          description: "Comprehensive plan for educational institutions",
          priceMonthly: 199.99,
          priceYearly: 1999.99,
          pricePerStudent: 10.0,
          maxTeachers: 100,
          maxStudents: 1000,
          videoCreditsIncluded: 200,
          questionPaperCreditsIncluded: 100,
          copyCheckingCreditsIncluded: 100,
          attendanceFeature: true,
          performanceAnalytics: true,
          aiVideoGeneration: true,
          aiQuestionGeneration: true,
          aiPaperChecking: true,
        },
      });
      logProgress("SubscriptionPlan", 1);
    } catch (error) {
      logProgress("SubscriptionPlan", 0, error);
      throw error;
    }

    // 2. Institution
    let institution;
    try {
      institution = await prisma.institution.create({
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
          subscriptionEndDate: new Date("2026-04-17"),
          subscriptionPlan: { connect: { id: subscriptionPlan.id } },
        },
      });
      logProgress("Institution", 1);
    } catch (error) {
      logProgress("Institution", 0, error);
      throw error;
    }

    // 3. Departments
    let departments;
    try {
      departments = await Promise.all([
        prisma.department.create({
          data: {
            name: "Computer Science",
            code: `CS-${timestamp}`,
            description: "Department of Computer Science",
            institution: { connect: { id: institution.id } },
          },
        }),
        prisma.department.create({
          data: {
            name: "Mathematics",
            code: `MATH-${timestamp}`,
            description: "Department of Mathematics",
            institution: { connect: { id: institution.id } },
          },
        }),
      ]);
      logProgress("Departments", departments.length);
    } catch (error) {
      logProgress("Departments", 0, error);
      throw error;
    }

    const csDepartment = departments[0];
    const mathDepartment = departments[1];

    // 4. Users (Admins, Teachers, Students)
    let admins;
    try {
      admins = await Promise.all([
        prisma.user.create({
          data: {
            name: "Alice Admin",
            email: `alice-admin-${timestamp}@springfield.edu`,
            username: `alice_admin_${timestamp}`,
            password: hashedPassword,
            role: "ADMIN",
            institution: { connect: { id: institution.id } },
            gender: "Female",
            dateOfBirth: new Date("1980-01-01"),
            address: "456 Admin St, Springfield, IL",
            phone: "555-987-6543",
          },
        }),
        prisma.user.create({
          data: {
            name: "Eve Admin",
            email: `eve-admin-${timestamp}@springfield.edu`,
            username: `eve_admin_${timestamp}`,
            password: hashedPassword,
            role: "ADMIN",
            institution: { connect: { id: institution.id } },
            gender: "Female",
            dateOfBirth: new Date("1982-03-15"),
            address: "789 Admin St, Springfield, IL",
            phone: "555-456-1234",
          },
        }),
      ]);
      logProgress("Admins", admins.length);
    } catch (error) {
      logProgress("Admins", 0, error);
      throw error;
    }

    let teachers;
    try {
      teachers = await Promise.all([
        prisma.user.create({
          data: {
            name: "Bob Teacher",
            email: `bob-teacher-${timestamp}@springfield.edu`,
            username: `bob_teacher_${timestamp}`,
            password: hashedPassword,
            role: "TEACHER",
            institution: { connect: { id: institution.id } },
            gender: "Male",
            dateOfBirth: new Date("1975-06-15"),
            address: "789 Faculty Ave, Springfield, IL",
            phone: "555-456-7890",
          },
        }),
        prisma.user.create({
          data: {
            name: "Carol Teacher",
            email: `carol-teacher-${timestamp}@springfield.edu`,
            username: `carol_teacher_${timestamp}`,
            password: hashedPassword,
            role: "TEACHER",
            institution: { connect: { id: institution.id } },
            gender: "Female",
            dateOfBirth: new Date("1978-09-20"),
            address: "123 Faculty Rd, Springfield, IL",
            phone: "555-789-4561",
          },
        }),
        prisma.user.create({
          data: {
            name: "Dave Teacher",
            email: `dave-teacher-${timestamp}@springfield.edu`,
            username: `dave_teacher_${timestamp}`,
            password: hashedPassword,
            role: "TEACHER",
            institution: { connect: { id: institution.id } },
            gender: "Male",
            dateOfBirth: new Date("1980-11-10"),
            address: "456 Faculty Ln, Springfield, IL",
            phone: "555-123-7890",
          },
        }),
        prisma.user.create({
          data: {
            name: "Emma Teacher",
            email: `emma-teacher-${timestamp}@springfield.edu`,
            username: `emma_teacher_${timestamp}`,
            password: hashedPassword,
            role: "TEACHER",
            institution: { connect: { id: institution.id } },
            gender: "Female",
            dateOfBirth: new Date("1976-02-25"),
            address: "789 Faculty Dr, Springfield, IL",
            phone: "555-321-4567",
          },
        }),
        prisma.user.create({
          data: {
            name: "Frank Teacher",
            email: `frank-teacher-${timestamp}@springfield.edu`,
            username: `frank_teacher_${timestamp}`,
            password: hashedPassword,
            role: "TEACHER",
            institution: { connect: { id: institution.id } },
            gender: "Male",
            dateOfBirth: new Date("1979-04-30"),
            address: "101 Faculty Ct, Springfield, IL",
            phone: "555-654-3210",
          },
        }),
      ]);
      logProgress("Teachers (Users)", teachers.length);
    } catch (error) {
      logProgress("Teachers (Users)", 0, error);
      throw error;
    }

    let students;
    try {
      const studentData = Array.from({ length: 20 }, (_, i) => ({
        name: `Student ${String.fromCharCode(65 + i)}`,
        email: `student-${i}-${timestamp}@springfield.edu`,
        username: `student_${i}_${timestamp}`,
        gender: i % 2 === 0 ? "Male" : "Female",
        dateOfBirth: new Date(`200${i % 4}-0${(i % 9) + 1}-01`),
        address: `${100 + i} Dorm Rd, Springfield, IL`,
        phone: `555-000-${1000 + i}`,
      }));

      students = await Promise.all(
        studentData.map((data) =>
          prisma.user.create({
            data: {
              ...data,
              password: hashedPassword,
              role: "STUDENT",
              institution: { connect: { id: institution.id } },
            },
          })
        )
      );
      logProgress("Students (Users)", students.length);
    } catch (error) {
      logProgress("Students (Users)", 0, error);
      throw error;
    }

    // 5. Teachers
    let teacherRecords;
    try {
      teacherRecords = await Promise.all([
        prisma.teacher.create({
          data: {
            user: { connect: { id: teachers[0].id } },
            teacherCode: `T001-${timestamp}`,
            qualification: "PhD in Computer Science",
            joiningDate: new Date("2010-08-01"),
            employmentStatus: "FULL_TIME",
            department: { connect: { id: csDepartment.id } },
            performanceScore: 85.5,
            lastEvaluationDate: new Date("2024-12-01"),
          },
        }),
        prisma.teacher.create({
          data: {
            user: { connect: { id: teachers[1].id } },
            teacherCode: `T002-${timestamp}`,
            qualification: "MS in Computer Science",
            joiningDate: new Date("2012-09-01"),
            employmentStatus: "FULL_TIME",
            department: { connect: { id: csDepartment.id } },
            performanceScore: 88.0,
            lastEvaluationDate: new Date("2024-12-01"),
          },
        }),
        prisma.teacher.create({
          data: {
            user: { connect: { id: teachers[2].id } },
            teacherCode: `T003-${timestamp}`,
            qualification: "PhD in Mathematics",
            joiningDate: new Date("2011-07-01"),
            employmentStatus: "FULL_TIME",
            department: { connect: { id: mathDepartment.id } },
            performanceScore: 90.0,
            lastEvaluationDate: new Date("2024-12-01"),
          },
        }),
        prisma.teacher.create({
          data: {
            user: { connect: { id: teachers[3].id } },
            teacherCode: `T004-${timestamp}`,
            qualification: "MS in Mathematics",
            joiningDate: new Date("2013-08-01"),
            employmentStatus: "PART_TIME",
            department: { connect: { id: mathDepartment.id } },
            performanceScore: 82.0,
            lastEvaluationDate: new Date("2024-12-01"),
          },
        }),
        prisma.teacher.create({
          data: {
            user: { connect: { id: teachers[4].id } },
            teacherCode: `T005-${timestamp}`,
            qualification: "PhD in Computer Science",
            joiningDate: new Date("2014-06-01"),
            employmentStatus: "FULL_TIME",
            department: { connect: { id: csDepartment.id } },
            performanceScore: 87.0,
            lastEvaluationDate: new Date("2024-12-01"),
          },
        }),
      ]);
      logProgress("Teacher Records", teacherRecords.length);
    } catch (error) {
      logProgress("Teacher Records", 0, error);
      throw error;
    }

    // 6. Students
    let batches;
    try {
      batches = await Promise.all([
        prisma.batch.create({
          data: {
            batchName: `2023-${timestamp} Batch`,
            year: 2023,
            department: { connect: { id: csDepartment.id } },
            maxStudents: 100,
          },
        }),
        prisma.batch.create({
          data: {
            batchName: `2024-${timestamp} Batch`,
            year: 2024,
            department: { connect: { id: mathDepartment.id } },
            maxStudents: 100,
          },
        }),
      ]);
      logProgress("Batches", batches.length);
    } catch (error) {
      logProgress("Batches", 0, error);
      throw error;
    }

    let studentRecords;
    try {
      studentRecords = await Promise.all(
        students.map((student, i) =>
          prisma.student.create({
            data: {
              user: { connect: { id: student.id } },
              studentRoll: `S${String(i + 1).padStart(3, "0")}-${timestamp}`,
              parentGuardianName: `Parent ${String.fromCharCode(65 + i)}`,
              parentGuardianPhone: `555-111-${1000 + i}`,
              parentGuardianEmail: `parent-${i}@springfield.edu`,
              department: {
                connect: {
                  id: i % 2 === 0 ? csDepartment.id : mathDepartment.id,
                },
              },
              batch: {
                connect: { id: i % 2 === 0 ? batches[0].id : batches[1].id },
              },
              currentSemester: i % 2 === 0 ? 4 : 2,
              currentYear: i % 2 === 0 ? 2 : 1,
              enrollmentStatus: "ACTIVE",
            },
          })
        )
      );
      logProgress("Student Records", studentRecords.length);
    } catch (error) {
      logProgress("Student Records", 0, error);
      throw error;
    }

    // 7. DepartmentHeads
    try {
      const departmentHeads = await Promise.all([
        prisma.departmentHead.create({
          data: {
            teacher: { connect: { id: teacherRecords[0].id } },
            department: { connect: { id: csDepartment.id } },
            appointmentDate: new Date("2023-01-01"),
          },
        }),
        prisma.departmentHead.create({
          data: {
            teacher: { connect: { id: teacherRecords[2].id } },
            department: { connect: { id: mathDepartment.id } },
            appointmentDate: new Date("2023-01-01"),
          },
        }),
      ]);
      logProgress("DepartmentHeads", departmentHeads.length);
    } catch (error) {
      logProgress("DepartmentHeads", 0, error);
      throw error;
    }

    // 8. Courses
    let courses;
    try {
      courses = await Promise.all([
        prisma.course.create({
          data: {
            courseCode: `CS101-${timestamp}`,
            name: "Introduction to Programming",
            description: "Basic programming concepts using Python",
            creditHours: 3,
            courseType: "CORE",
            department: { connect: { id: csDepartment.id } },
            createdBy: { connect: { id: teacherRecords[0].id } },
          },
        }),
        prisma.course.create({
          data: {
            courseCode: `CS102-${timestamp}`,
            name: "Data Structures",
            description: "Introduction to data structures and algorithms",
            creditHours: 4,
            courseType: "CORE",
            department: { connect: { id: csDepartment.id } },
            createdBy: { connect: { id: teacherRecords[1].id } },
          },
        }),
        prisma.course.create({
          data: {
            courseCode: `MATH101-${timestamp}`,
            name: "Calculus I",
            description: "Fundamentals of calculus",
            creditHours: 3,
            courseType: "CORE",
            department: { connect: { id: mathDepartment.id } },
            createdBy: { connect: { id: teacherRecords[2].id } },
          },
        }),
        prisma.course.create({
          data: {
            courseCode: `MATH102-${timestamp}`,
            name: "Linear Algebra",
            description: "Introduction to linear algebra",
            creditHours: 3,
            courseType: "CORE",
            department: { connect: { id: mathDepartment.id } },
            createdBy: { connect: { id: teacherRecords[3].id } },
          },
        }),
      ]);
      logProgress("Courses", courses.length);
    } catch (error) {
      logProgress("Courses", 0, error);
      throw error;
    }

    // 9. Semester
    let semester;
    try {
      semester = await prisma.semester.create({
        data: {
          name: "Spring 2025",
          startDate: new Date("2025-01-15"),
          endDate: new Date("2025-05-15"),
          institution: { connect: { id: institution.id } },
          isCurrent: true,
        },
      });
      logProgress("Semester", 1);
    } catch (error) {
      logProgress("Semester", 0, error);
      throw error;
    }

    // 10. ClassSections
    let classSections;
    try {
      classSections = await Promise.all([
        prisma.classSection.create({
          data: {
            sectionName: "CS-2023-A",
            batch: { connect: { id: batches[0].id } },
            semester: { connect: { id: semester.id } },
            teacher: { connect: { id: teacherRecords[0].id } },
            maxStudents: 50,
          },
        }),
        prisma.classSection.create({
          data: {
            sectionName: "CS-2023-B",
            batch: { connect: { id: batches[0].id } },
            semester: { connect: { id: semester.id } },
            teacher: { connect: { id: teacherRecords[1].id } },
            maxStudents: 50,
          },
        }),
        prisma.classSection.create({
          data: {
            sectionName: "MATH-2024-A",
            batch: { connect: { id: batches[1].id } },
            semester: { connect: { id: semester.id } },
            teacher: { connect: { id: teacherRecords[2].id } },
            maxStudents: 50,
          },
        }),
        prisma.classSection.create({
          data: {
            sectionName: "MATH-2024-B",
            batch: { connect: { id: batches[1].id } },
            semester: { connect: { id: semester.id } },
            teacher: { connect: { id: teacherRecords[3].id } },
            maxStudents: 50,
          },
        }),
      ]);
      logProgress("ClassSections", classSections.length);
    } catch (error) {
      logProgress("ClassSections", 0, error);
      throw error;
    }

    // 11. StudentClassEnrollments
    try {
      const enrollments = await Promise.all(
        studentRecords.map((student, i) =>
          prisma.studentClassEnrollment.create({
            data: {
              student: { connect: { id: student.id } },
              classSection: { connect: { id: classSections[i % 4].id } },
              enrollmentStatus: "ENROLLED",
            },
          })
        )
      );
      logProgress("StudentClassEnrollments", enrollments.length);
    } catch (error) {
      logProgress("StudentClassEnrollments", 0, error);
      throw error;
    }

    // 12. AttendanceSettings
    try {
      await prisma.attendanceSettings.create({
        data: {
          institution: { connect: { id: institution.id } },
          minimumAttendancePercentage: 75.0,
          autoLockAttendance: true,
          autoLockAfterHours: 24,
          allowExcusedAbsences: true,
        },
      });
      logProgress("AttendanceSettings", 1);
    } catch (error) {
      logProgress("AttendanceSettings", 0, error);
      throw error;
    }

    // 13. AttendanceSessions
    let attendanceSessions;
    try {
      attendanceSessions = await Promise.all([
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[0].id } },
            course: { connect: { id: courses[0].id } },
            teacher: { connect: { id: teacherRecords[0].id } },
            sessionDate: new Date("2025-04-14"),
            startTime: new Date("2025-04-14T09:00:00Z"),
            endTime: new Date("2025-04-14T10:30:00Z"),
            sessionType: "LECTURE",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[0].id } },
            course: { connect: { id: courses[0].id } },
            teacher: { connect: { id: teacherRecords[0].id } },
            sessionDate: new Date("2025-04-16"),
            startTime: new Date("2025-04-16T09:00:00Z"),
            endTime: new Date("2025-04-16T10:30:00Z"),
            sessionType: "LECTURE",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[1].id } },
            course: { connect: { id: courses[1].id } },
            teacher: { connect: { id: teacherRecords[1].id } },
            sessionDate: new Date("2025-04-15"),
            startTime: new Date("2025-04-15T10:00:00Z"),
            endTime: new Date("2025-04-15T11:30:00Z"),
            sessionType: "LECTURE",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[1].id } },
            course: { connect: { id: courses[1].id } },
            teacher: { connect: { id: teacherRecords[1].id } },
            sessionDate: new Date("2025-04-17"),
            startTime: new Date("2025-04-17T10:00:00Z"),
            endTime: new Date("2025-04-17T11:30:00Z"),
            sessionType: "LECTURE",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[2].id } },
            course: { connect: { id: courses[2].id } },
            teacher: { connect: { id: teacherRecords[2].id } },
            sessionDate: new Date("2025-04-14"),
            startTime: new Date("2025-04-14T11:00:00Z"),
            endTime: new Date("2025-04-14T12:30:00Z"),
            sessionType: "LECTURE",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[2].id } },
            course: { connect: { id: courses[2].id } },
            teacher: { connect: { id: teacherRecords[2].id } },
            sessionDate: new Date("2025-04-16"),
            startTime: new Date("2025-04-16T11:00:00Z"),
            endTime: new Date("2025-04-16T12:30:00Z"),
            sessionType: "LECTURE",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[3].id } },
            course: { connect: { id: courses[3].id } },
            teacher: { connect: { id: teacherRecords[3].id } },
            sessionDate: new Date("2025-04-15"),
            startTime: new Date("2025-04-15T09:00:00Z"),
            endTime: new Date("2025-04-15T10:30:00Z"),
            sessionType: "LECTURE",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[3].id } },
            course: { connect: { id: courses[3].id } },
            teacher: { connect: { id: teacherRecords[3].id } },
            sessionDate: new Date("2025-04-17"),
            startTime: new Date("2025-04-17T09:00:00Z"),
            endTime: new Date("2025-04-17T10:30:00Z"),
            sessionType: "LECTURE",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[0].id } },
            course: { connect: { id: courses[1].id } },
            teacher: { connect: { id: teacherRecords[4].id } },
            sessionDate: new Date("2025-04-14"),
            startTime: new Date("2025-04-14T13:00:00Z"),
            endTime: new Date("2025-04-14T14:30:00Z"),
            sessionType: "LAB",
            status: "SCHEDULED",
          },
        }),
        prisma.attendanceSession.create({
          data: {
            classSection: { connect: { id: classSections[2].id } },
            course: { connect: { id: courses[3].id } },
            teacher: { connect: { id: teacherRecords[3].id } },
            sessionDate: new Date("2025-04-16"),
            startTime: new Date("2025-04-16T13:00:00Z"),
            endTime: new Date("2025-04-16T14:30:00Z"),
            sessionType: "TUTORIAL",
            status: "SCHEDULED",
          },
        }),
      ]);
      logProgress("AttendanceSessions", attendanceSessions.length);
    } catch (error) {
      logProgress("AttendanceSessions", 0, error);
      throw error;
    }

    // 14. Attendance
    let attendanceCount = 0;
    try {
      for (const session of attendanceSessions) {
        const enrolledStudents = await prisma.studentClassEnrollment.findMany({
          where: { classSectionId: session.classSectionId },
          include: { student: true },
        });

        const attendances = await Promise.all(
          enrolledStudents.map((enrollment) =>
            prisma.attendance.create({
              data: {
                attendanceSession: { connect: { id: session.id } },
                student: { connect: { id: enrollment.studentId } },
                status:
                  Math.random() > 0.2
                    ? "PRESENT"
                    : Math.random() > 0.5
                    ? "ABSENT"
                    : "LATE",
                remarks: Math.random() > 0.8 ? "Participated actively" : null,
                recordedBy: { connect: { id: session.teacherId } },
                recordedAt: new Date(
                  session.sessionDate
                    .toISOString()
                    .replace("00:00:00", "09:15:00")
                ),
                isLocked: false,
              },
            })
          )
        );
        attendanceCount += attendances.length;
      }
      logProgress("Attendance Records", attendanceCount);
    } catch (error) {
      logProgress("Attendance Records", 0, error);
      throw error;
    }

    // 15. ExamTypes
    let examTypes;
    try {
      examTypes = await Promise.all([
        prisma.examType.create({
          data: {
            name: "Midterm",
            description: "Mid-semester examination",
            institution: { connect: { id: institution.id } },
            weightage: 30.0,
          },
        }),
        prisma.examType.create({
          data: {
            name: "Final",
            description: "End-of-semester examination",
            institution: { connect: { id: institution.id } },
            weightage: 50.0,
          },
        }),
      ]);
      logProgress("ExamTypes", examTypes.length);
    } catch (error) {
      logProgress("ExamTypes", 0, error);
      throw error;
    }

    // 16. Exams
    let exams;
    try {
      exams = await Promise.all([
        prisma.exam.create({
          data: {
            title: "CS101 Midterm",
            description: "Midterm for Introduction to Programming",
            examType: { connect: { id: examTypes[0].id } },
            classSection: { connect: { id: classSections[0].id } },
            examDate: new Date("2025-03-15"),
            startTime: new Date("2025-03-15T10:00:00Z"),
            endTime: new Date("2025-03-15T12:00:00Z"),
            durationMinutes: 120,
            totalMarks: 100.0,
            passingMarks: 50.0,
            isPublished: true,
            createdBy: { connect: { id: teacherRecords[0].id } },
            status: "PUBLISHED",
            isAiGenerated: false,
          },
        }),
        prisma.exam.create({
          data: {
            title: "MATH101 Final",
            description: "Final exam for Calculus I",
            examType: { connect: { id: examTypes[1].id } },
            classSection: { connect: { id: classSections[2].id } },
            examDate: new Date("2025-05-10"),
            startTime: new Date("2025-05-10T09:00:00Z"),
            endTime: new Date("2025-05-10T12:00:00Z"),
            durationMinutes: 180,
            totalMarks: 100.0,
            passingMarks: 50.0,
            isPublished: false,
            createdBy: { connect: { id: teacherRecords[2].id } },
            status: "DRAFT",
            isAiGenerated: false,
          },
        }),
      ]);
      logProgress("Exams", exams.length);
    } catch (error) {
      logProgress("Exams", 0, error);
      throw error;
    }

    // 17. Questions
    let questions;
    try {
      questions = await Promise.all([
        prisma.question.create({
          data: {
            exam: { connect: { id: exams[0].id } },
            questionText: "Write a Python function to calculate factorial.",
            questionType: "CODING",
            marks: 20.0,
            difficultyLevel: "MEDIUM",
            correctAnswer: {
              code: "def factorial(n): return 1 if n == 0 else n * factorial(n-1)",
            },
            createdBy: { connect: { id: teacherRecords[0].id } },
            isAiGenerated: false,
          },
        }),
        prisma.question.create({
          data: {
            exam: { connect: { id: exams[1].id } },
            questionText: "Solve the integral of x^2 dx.",
            questionType: "LONG_ANSWER",
            marks: 25.0,
            difficultyLevel: "HARD",
            correctAnswer: { solution: "x^3/3 + C" },
            createdBy: { connect: { id: teacherRecords[2].id } },
            isAiGenerated: false,
          },
        }),
      ]);
      logProgress("Questions", questions.length);
    } catch (error) {
      logProgress("Questions", 0, error);
      throw error;
    }

    // 18. ExamSubmissions
    let examSubmissionCount = 0;
    try {
      for (const exam of exams) {
        const enrolledStudents = await prisma.studentClassEnrollment.findMany({
          where: { classSectionId: exam.classSectionId },
          include: { student: true },
        });

        const submissions = await Promise.all(
          enrolledStudents.map((enrollment) =>
            prisma.examSubmission.create({
              data: {
                exam: { connect: { id: exam.id } },
                student: { connect: { id: enrollment.studentId } },
                submissionTime: randomDate(
                  new Date(exam.startTime),
                  new Date(exam.endTime)
                ),
                obtainedMarks:
                  Math.floor(Math.random() * (exam.totalMarks - 50)) + 50,
                status: "GRADED",
                feedback: "Good effort, review key concepts.",
                gradedBy: { connect: { id: exam.createdById } },
                gradedAt: new Date(
                  exam.examDate.toISOString().replace("00:00:00", "15:00:00")
                ),
              },
            })
          )
        );
        examSubmissionCount += submissions.length;
      }
      logProgress("ExamSubmissions", examSubmissionCount);
    } catch (error) {
      logProgress("ExamSubmissions", 0, error);
      throw error;
    }

    // 19. AnswerScripts
    let answerScriptCount = 0;
    try {
      const examSubmissions = await prisma.examSubmission.findMany();
      for (const submission of examSubmissions) {
        const examQuestions = await prisma.question.findMany({
          where: { examId: submission.examId },
        });

        const answerScripts = await Promise.all(
          examQuestions.map((question) =>
            prisma.answerScript.create({
              data: {
                examSubmission: { connect: { id: submission.id } },
                question: { connect: { id: question.id } },
                studentAnswer:
                  question.questionType === "CODING"
                    ? "Sample code"
                    : "Sample solution",
                obtainedMarks: Math.floor(Math.random() * question.marks),
                remarks: "Correct approach, minor errors.",
                status: "GRADED",
                gradedBy: { connect: { id: submission.gradedById } },
                gradedAt: submission.gradedAt,
                isAiGraded: false,
              },
            })
          )
        );
        answerScriptCount += answerScripts.length;
      }
      logProgress("AnswerScripts", answerScriptCount);
    } catch (error) {
      logProgress("AnswerScripts", 0, error);
      throw error;
    }

    // 20. AIVideoContent
    let aiVideos;
    try {
      aiVideos = await Promise.all([
        prisma.aIVideoContent.create({
          data: {
            title: "Python Basics",
            description: "Introduction to Python programming",
            course: { connect: { id: courses[0].id } },
            teacher: { connect: { id: teacherRecords[0].id } },
            classSection: { connect: { id: classSections[0].id } },
            videoUrl: "https://springfield.edu/videos/python_basics.mp4",
            thumbnailUrl:
              "https://springfield.edu/videos/python_basics_thumb.jpg",
            durationSeconds: 1800,
            chunkData: { segments: ["intro", "variables", "loops"] },
            voiceUri: "en-US-Wavenet-D",
            teacherModelUri: "model_123",
            summary: "Covers variables, loops, and functions in Python.",
            notes: "Refer to Python documentation for advanced topics.",
            status: "READY",
            creditsUsed: 10,
            createdBy: { connect: { id: teacherRecords[0].id } },
            version: 1,
          },
        }),
        prisma.aIVideoContent.create({
          data: {
            title: "Calculus Fundamentals",
            description: "Introduction to calculus concepts",
            course: { connect: { id: courses[2].id } },
            teacher: { connect: { id: teacherRecords[2].id } },
            classSection: { connect: { id: classSections[2].id } },
            videoUrl: "https://springfield.edu/videos/calculus.mp4",
            thumbnailUrl: "https://springfield.edu/videos/calculus_thumb.jpg",
            durationSeconds: 2400,
            chunkData: { segments: ["limits", "derivatives"] },
            voiceUri: "en-US-Wavenet-A",
            teacherModelUri: "model_124",
            summary: "Covers limits and derivatives.",
            notes: "Practice problems recommended.",
            status: "READY",
            creditsUsed: 15,
            createdBy: { connect: { id: teacherRecords[2].id } },
            version: 1,
          },
        }),
      ]);
      logProgress("AIVideoContent", aiVideos.length);
    } catch (error) {
      logProgress("AIVideoContent", 0, error);
      throw error;
    }

    // 21. VideoViewLogs
    let videoViewLogCount = 0;
    try {
      for (const video of aiVideos) {
        const enrolledStudents = await prisma.studentClassEnrollment.findMany({
          where: { classSectionId: video.classSectionId },
          include: { student: true },
        });

        const viewLogs = await Promise.all(
          enrolledStudents.slice(0, 5).map((enrollment) =>
            prisma.videoViewLog.create({
              data: {
                video: { connect: { id: video.id } },
                student: { connect: { id: enrollment.studentId } },
                viewStarted: new Date("2025-04-01T14:00:00Z"),
                viewEnded: new Date("2025-04-01T14:30:00Z"),
                durationWatchedSeconds: Math.floor(
                  Math.random() * video.durationSeconds
                ),
                completionPercentage: Math.random() * 100,
                feedback: Math.random() > 0.5 ? "Very informative!" : null,
                rating: Math.floor(Math.random() * 5) + 1,
              },
            })
          )
        );
        videoViewLogCount += viewLogs.length;
      }
      logProgress("VideoViewLogs", videoViewLogCount);
    } catch (error) {
      logProgress("VideoViewLogs", 0, error);
      throw error;
    }

    // 22. AIQuestionBanks
    try {
      const questionBanks = await Promise.all([
        prisma.aIQuestionBank.create({
          data: {
            title: "Python MCQs",
            course: { connect: { id: courses[0].id } },
            teacher: { connect: { id: teacherRecords[0].id } },
            questionType: "MCQ",
            questionCount: 50,
            difficultyLevel: "EASY",
            metadata: { topics: ["variables", "loops"] },
            status: "READY",
            createdBy: { connect: { id: teacherRecords[0].id } },
            version: 1,
          },
        }),
        prisma.aIQuestionBank.create({
          data: {
            title: "Calculus Short Answers",
            course: { connect: { id: courses[2].id } },
            teacher: { connect: { id: teacherRecords[2].id } },
            questionType: "SHORT_ANSWER",
            questionCount: 30,
            difficultyLevel: "MEDIUM",
            metadata: { topics: ["derivatives", "integrals"] },
            status: "READY",
            createdBy: { connect: { id: teacherRecords[2].id } },
            version: 1,
          },
        }),
      ]);
      logProgress("AIQuestionBanks", questionBanks.length);
    } catch (error) {
      logProgress("AIQuestionBanks", 0, error);
      throw error;
    }

    // 23. Subscription
    let subscription;
    try {
      subscription = await prisma.subscription.create({
        data: {
          institution: { connect: { id: institution.id } },
          plan: { connect: { id: subscriptionPlan.id } },
          startDate: new Date("2025-01-01"),
          endDate: new Date("2026-01-01"),
          status: "ACTIVE",
          amountPaid: 1999.99,
          paymentFrequency: "YEARLY",
          teachersCount: teacherRecords.length,
          studentsCount: studentRecords.length,
        },
      });
      logProgress("Subscription", 1);
    } catch (error) {
      logProgress("Subscription", 0, error);
      throw error;
    }

    // 24. Credit
    try {
      await prisma.credit.create({
        data: {
          institution: { connect: { id: institution.id } },
          videoCreditsBalance: 200,
          questionPaperCreditsBalance: 100,
          copyCheckingCreditsBalance: 100,
          lastUpdated: new Date(),
        },
      });
      logProgress("Credit", 1);
    } catch (error) {
      logProgress("Credit", 0, error);
      throw error;
    }

    // 25. CreditTransaction
    let creditTransactionCount = 0;
    try {
      const transactions = await Promise.all(
        aiVideos.map((video) =>
          prisma.creditTransaction.create({
            data: {
              institution: { connect: { id: institution.id } },
              transactionType: "USAGE",
              creditType: "VIDEO",
              quantity: video.creditsUsed,
              description: `Used credits for video: ${video.title}`,
              relatedEntityId: video.id,
              performedBy: { connect: { id: admins[0].id } },
            },
          })
        )
      );
      creditTransactionCount += transactions.length;
      logProgress("CreditTransactions", creditTransactionCount);
    } catch (error) {
      logProgress("CreditTransactions", 0, error);
      throw error;
    }

    // 26. CreditAllocation
    try {
      await prisma.creditAllocation.create({
        data: {
          institution: { connect: { id: institution.id } },
          creditType: "VIDEO",
          quantity: 200,
          allocatedAt: new Date(),
          source: "SUBSCRIPTION",
        },
      });
      logProgress("CreditAllocation", 1);
    } catch (error) {
      logProgress("CreditAllocation", 0, error);
      throw error;
    }

    // 27. Invoice (Corrected to use subscription.id)
    try {
      await prisma.invoice.create({
        data: {
          institution: { connect: { id: institution.id } },
          subscription: { connect: { id: subscription.id } }, // Fixed: Use subscription.id
          invoiceNumber: `INV-001-${timestamp}`,
          issueDate: new Date("2025-01-01"),
          dueDate: new Date("2025-01-15"),
          amount: 1999.99,
          status: "PAID",
          paymentMethod: "CREDIT_CARD",
          paymentReference: `PAY-123-${timestamp}`,
          paidAt: new Date("2025-01-10"),
        },
      });
      logProgress("Invoice", 1);
    } catch (error) {
      logProgress("Invoice", 0, error);
      throw error;
    }

    // 28. TeacherPerformanceMetrics
    let teacherPerformanceCount = 0;
    try {
      const metrics = await Promise.all(
        teacherRecords.map((teacher) =>
          prisma.teacherPerformanceMetric.create({
            data: {
              teacher: { connect: { id: teacher.id } },
              department: { connect: { id: teacher.departmentId } },
              semester: { connect: { id: semester.id } },
              attendanceRegularityScore: Math.random() * 20 + 80,
              studentPerformanceScore: Math.random() * 20 + 80,
              contentQualityScore: Math.random() * 20 + 80,
              overallScore: Math.random() * 20 + 80,
              detailedMetrics: { comments: "Strong performance" },
              evaluationDate: new Date("2025-03-01"),
              evaluatedBy: { connect: { id: teacherRecords[0].id } },
            },
          })
        )
      );
      teacherPerformanceCount += metrics.length;
      logProgress("TeacherPerformanceMetrics", teacherPerformanceCount);
    } catch (error) {
      logProgress("TeacherPerformanceMetrics", 0, error);
      throw error;
    }

    // 29. StudentPerformanceMetrics
    let studentPerformanceCount = 0;
    try {
      const metrics = await Promise.all(
        studentRecords.map((student, i) =>
          prisma.studentPerformanceMetric.create({
            data: {
              student: { connect: { id: student.id } },
              classSection: { connect: { id: classSections[i % 4].id } },
              semester: { connect: { id: semester.id } },
              attendancePercentage: Math.random() * 20 + 80,
              overallGradePoints: Math.random() * 20 + 80,
              assignmentCompletionRate: Math.random() * 20 + 80,
              detailedMetrics: { strengths: ["Participation"] },
              performanceCategory: Math.random() > 0.5 ? "EXCELLENT" : "GOOD",
            },
          })
        )
      );
      studentPerformanceCount += metrics.length;
      logProgress("StudentPerformanceMetrics", studentPerformanceCount);
    } catch (error) {
      logProgress("StudentPerformanceMetrics", 0, error);
      throw error;
    }

    // 30. Notifications
    let notificationCount = 0;
    try {
      const notifications = await Promise.all(
        students.map((student, i) =>
          prisma.notification.create({
            data: {
              user: { connect: { id: student.id } },
              title: `Welcome to Spring 2025`,
              message: `You are enrolled in ${
                courses[i % courses.length].name
              }.`,
              notificationType: "ENROLLMENT",
              isRead: false,
              actionUrl: `/courses/${courses[i % courses.length].id}`,
              channel: "EMAIL",
              templateId: "welcome_email",
            },
          })
        )
      );
      notificationCount += notifications.length;
      logProgress("Notifications", notificationCount);
    } catch (error) {
      logProgress("Notifications", 0, error);
      throw error;
    }

    // 31. Announcements
    try {
      const announcements = await Promise.all([
        prisma.announcement.create({
          data: {
            title: "Semester Start",
            content: "Spring 2025 semester begins on January 15.",
            createdByTeacher: { connect: { id: teacherRecords[0].id } },
            institution: { connect: { id: institution.id } },
            department: { connect: { id: csDepartment.id } },
            classSection: { connect: { id: classSections[0].id } },
            isImportant: true,
            isPinned: true,
            visibility: "STUDENTS",
            expiryDate: new Date("2025-02-01"),
          },
        }),
        prisma.announcement.create({
          data: {
            title: "Math Department Update",
            content: "New resources available for Calculus I.",
            createdByTeacher: { connect: { id: teacherRecords[2].id } },
            institution: { connect: { id: institution.id } },
            department: { connect: { id: mathDepartment.id } },
            classSection: { connect: { id: classSections[2].id } },
            isImportant: false,
            isPinned: false,
            visibility: "STUDENTS",
            expiryDate: new Date("2025-03-01"),
          },
        }),
      ]);
      logProgress("Announcements", announcements.length);
    } catch (error) {
      logProgress("Announcements", 0, error);
      throw error;
    }

    // 32. Assignments
    let assignments;
    try {
      assignments = await Promise.all([
        prisma.assignment.create({
          data: {
            title: "Python Assignment 1",
            description: "Write a program to calculate Fibonacci sequence.",
            classSection: { connect: { id: classSections[0].id } },
            createdBy: { connect: { id: teacherRecords[0].id } },
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
        }),
        prisma.assignment.create({
          data: {
            title: "Calculus Problem Set",
            description: "Solve integration problems.",
            classSection: { connect: { id: classSections[2].id } },
            createdBy: { connect: { id: teacherRecords[2].id } },
            dueDate: new Date("2025-04-25"),
            maxPoints: 60.0,
            isPublished: true,
            status: "IN_PROGRESS",
            submissionType: "GROUP",
            allowLate: false,
            isAiGenerated: false,
            version: 1,
          },
        }),
      ]);
      logProgress("Assignments", assignments.length);
    } catch (error) {
      logProgress("Assignments", 0, error);
      throw error;
    }

    // 33. AssignmentSubmissions
    let assignmentSubmissionCount = 0;
    try {
      for (const assignment of assignments) {
        const enrolledStudents = await prisma.studentClassEnrollment.findMany({
          where: { classSectionId: assignment.classSectionId },
          include: { student: true },
        });

        const submissions = await Promise.all(
          enrolledStudents.map((enrollment) =>
            prisma.assignmentSubmission.create({
              data: {
                assignment: { connect: { id: assignment.id } },
                student: { connect: { id: enrollment.studentId } },
                submissionTime: randomDate(
                  new Date("2025-04-10"),
                  new Date(assignment.dueDate)
                ),
                obtainedPoints: Math.floor(
                  Math.random() * assignment.maxPoints
                ),
                status: "GRADED",
                feedback: "Well done, review formatting.",
                gradedBy: { connect: { id: assignment.createdById } },
                gradedAt: new Date(
                  assignment.dueDate
                    .toISOString()
                    .replace("00:00:00", "10:00:00")
                ),
                isLate: Math.random() > 0.8,
              },
            })
          )
        );
        assignmentSubmissionCount += submissions.length;
      }
      logProgress("AssignmentSubmissions", assignmentSubmissionCount);
    } catch (error) {
      logProgress("AssignmentSubmissions", 0, error);
      throw error;
    }

    // 34. AssignmentAttachments
    let assignmentAttachmentCount = 0;
    try {
      const assignmentSubmissions =
        await prisma.assignmentSubmission.findMany();
      const attachments = await Promise.all(
        assignmentSubmissions.slice(0, 5).map((submission) =>
          prisma.assignmentAttachment.create({
            data: {
              submission: { connect: { id: submission.id } },
              fileUrl: `https://springfield.edu/uploads/assignment-${submission.id}.pdf`,
              fileName: `submission-${submission.id}.pdf`,
              fileType: "application/pdf",
              fileSize: 1024,
              uploadedBy: { connect: { id: students[0].id } },
            },
          })
        )
      );
      assignmentAttachmentCount += attachments.length;
      logProgress("AssignmentAttachments", assignmentAttachmentCount);
    } catch (error) {
      logProgress("AssignmentAttachments", 0, error);
      throw error;
    }

    // 35. AssignmentGroups
    let assignmentGroups;
    try {
      assignmentGroups = await Promise.all([
        prisma.assignmentGroup.create({
          data: {
            classSection: { connect: { id: classSections[2].id } },
            name: "Math Group A",
          },
        }),
        prisma.assignmentGroup.create({
          data: {
            classSection: { connect: { id: classSections[2].id } },
            name: "Math Group B",
          },
        }),
      ]);
      logProgress("AssignmentGroups", assignmentGroups.length);
    } catch (error) {
      logProgress("AssignmentGroups", 0, error);
      throw error;
    }

    // 36. AssignmentGroupMembers
    let groupMemberCount = 0;
    try {
      const mathStudents = studentRecords.filter(
        (s) => s.departmentId === mathDepartment.id
      );
      const members = await Promise.all(
        mathStudents.map((student, i) =>
          prisma.assignmentGroupMember.create({
            data: {
              group: { connect: { id: assignmentGroups[i % 2].id } },
              student: { connect: { id: student.id } },
            },
          })
        )
      );
      groupMemberCount += members.length;
      logProgress("AssignmentGroupMembers", groupMemberCount);
    } catch (error) {
      logProgress("AssignmentGroupMembers", 0, error);
      throw error;
    }

    // 37. AssignmentComments
    let assignmentCommentCount = 0;
    try {
      const assignmentSubmissions =
        await prisma.assignmentSubmission.findMany();
      const comments = await Promise.all(
        assignmentSubmissions.slice(0, 5).map((submission) =>
          prisma.assignmentComment.create({
            data: {
              assignment: { connect: { id: submission.assignmentId } },
              submission: { connect: { id: submission.id } },
              user: { connect: { id: teachers[0].id } },
              content: "Great work on this submission!",
            },
          })
        )
      );
      assignmentCommentCount += comments.length;
      logProgress("AssignmentComments", assignmentCommentCount);
    } catch (error) {
      logProgress("AssignmentComments", 0, error);
      throw error;
    }

    // Notes and Note Attachments
    let notes;
    try {
      notes = await Promise.all([
        // CS-2023-A Section Notes by Bob Teacher
        prisma.note.create({
          data: {
            title: "Introduction to Programming Concepts",
            content:
              "This note covers the basic concepts of programming including variables, loops, and conditionals.",
            subjectName: "Computer Science",
            isPublished: true,
            classSection: { connect: { id: classSections[0].id } },
            teacher: { connect: { id: teacherRecords[0].id } },
            attachments: {
              create: [
                {
                  fileUrl: "https://example.com/files/programming_intro.pdf",
                  fileName: "programming_intro.pdf",
                  fileType: "application/pdf",
                  fileSize: 2048,
                  uploadedBy: { connect: { id: teachers[0].id } },
                },
              ],
            },
          },
        }),
        prisma.note.create({
          data: {
            title: "Data Structures Overview",
            content:
              "An overview of fundamental data structures including arrays, linked lists, stacks, and queues.",
            subjectName: "Computer Science",
            isPublished: true,
            classSection: { connect: { id: classSections[0].id } },
            teacher: { connect: { id: teacherRecords[0].id } },
            attachments: {
              create: [
                {
                  fileUrl: "https://example.com/files/data_structures.pdf",
                  fileName: "data_structures.pdf",
                  fileType: "application/pdf",
                  fileSize: 3072,
                  uploadedBy: { connect: { id: teachers[0].id } },
                },
              ],
            },
          },
        }),

        // CS-2023-B Section Notes by Carol Teacher
        prisma.note.create({
          data: {
            title: "Object-Oriented Programming",
            content:
              "This note covers the principles of object-oriented programming including encapsulation, inheritance, and polymorphism.",
            subjectName: "Computer Science",
            isPublished: true,
            classSection: { connect: { id: classSections[1].id } },
            teacher: { connect: { id: teacherRecords[1].id } },
            attachments: {
              create: [
                {
                  fileUrl: "https://example.com/files/oop_principles.pdf",
                  fileName: "oop_principles.pdf",
                  fileType: "application/pdf",
                  fileSize: 2560,
                  uploadedBy: { connect: { id: teachers[1].id } },
                },
              ],
            },
          },
        }),

        // MATH-2024-A Section Notes by Dave Teacher
        prisma.note.create({
          data: {
            title: "Calculus I: Limits and Derivatives",
            content:
              "An introduction to the concept of limits and the fundamental operations of differentiation.",
            subjectName: "Mathematics",
            isPublished: true,
            classSection: { connect: { id: classSections[2].id } },
            teacher: { connect: { id: teacherRecords[2].id } },
            attachments: {
              create: [
                {
                  fileUrl: "https://example.com/files/calculus_limits.pdf",
                  fileName: "calculus_limits.pdf",
                  fileType: "application/pdf",
                  fileSize: 1536,
                  uploadedBy: { connect: { id: teachers[2].id } },
                },
              ],
            },
          },
        }),
        prisma.note.create({
          data: {
            title: "Calculus I: Integration Techniques",
            content:
              "This note covers various techniques for integration including substitution, parts, and partial fractions.",
            subjectName: "Mathematics",
            isPublished: true,
            classSection: { connect: { id: classSections[2].id } },
            teacher: { connect: { id: teacherRecords[2].id } },
            attachments: {
              create: [
                {
                  fileUrl:
                    "https://example.com/files/integration_techniques.pdf",
                  fileName: "integration_techniques.pdf",
                  fileType: "application/pdf",
                  fileSize: 2048,
                  uploadedBy: { connect: { id: teachers[2].id } },
                },
              ],
            },
          },
        }),

        // MATH-2024-B Section Notes by Emma Teacher
        prisma.note.create({
          data: {
            title: "Linear Algebra: Matrices and Operations",
            content: "An introduction to matrices and basic matrix operations.",
            subjectName: "Mathematics",
            isPublished: true,
            classSection: { connect: { id: classSections[3].id } },
            teacher: { connect: { id: teacherRecords[3].id } },
            attachments: {
              create: [
                {
                  fileUrl: "https://example.com/files/matrices.pdf",
                  fileName: "matrices.pdf",
                  fileType: "application/pdf",
                  fileSize: 1792,
                  uploadedBy: { connect: { id: teachers[3].id } },
                },
              ],
            },
          },
        }),

        // Draft note (not published)
        prisma.note.create({
          data: {
            title: "Advanced Topics in Programming",
            content:
              "This is a draft note covering advanced programming concepts.",
            subjectName: "Computer Science",
            isPublished: false,
            classSection: { connect: { id: classSections[0].id } },
            teacher: { connect: { id: teacherRecords[0].id } },
          },
        }),
      ]);
      logProgress("Notes and Note Attachments", notes.length);
    } catch (error) {
      logProgress("Notes and Note Attachments", 0, error);
      throw error;
    }

    // 38. ClassStreams
    let classStreamCount = 0;
    try {
      const streams = await Promise.all(
        assignments.map((assignment) =>
          prisma.classStream.create({
            data: {
              classSection: { connect: { id: assignment.classSectionId } },
              contentType: "ASSIGNMENT",
              contentId: assignment.id,
            },
          })
        )
      );
      classStreamCount += streams.length;
      logProgress("ClassStreams", classStreamCount);
    } catch (error) {
      logProgress("ClassStreams", 0, error);
      throw error;
    }

    // 39. CalendarEvents
    try {
      const events = await Promise.all(
        assignments.map((assignment) =>
          prisma.calendarEvent.create({
            data: {
              title: `${assignment.title} Due`,
              description: `Due date for ${assignment.title}`,
              classSection: { connect: { id: assignment.classSectionId } },
              institution: { connect: { id: institution.id } },
              startTime: new Date(assignment.dueDate),
              endTime: new Date(assignment.dueDate),
              eventType: "ASSIGNMENT_DEADLINE",
              relatedEntityId: assignment.id,
              createdBy: { connect: { id: teachers[0].id } },
            },
          })
        )
      );
      logProgress("CalendarEvents", events.length);
    } catch (error) {
      logProgress("CalendarEvents", 0, error);
      throw error;
    }

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("🚨 Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log("✅ Seeding completed"))
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
