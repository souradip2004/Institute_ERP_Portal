-- CreateTable
CREATE TABLE "TeacherAnswerSheet" (
    "id" TEXT NOT NULL,
    "ansSheetS3URL" TEXT NOT NULL,
    "config1" JSONB NOT NULL,
    "config2" JSONB NOT NULL,
    "config3" JSONB NOT NULL,
    "examId" TEXT NOT NULL,
    "pythonParsedResponse" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherAnswerSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSubmissionRecord" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentAnswerSheetURL" TEXT NOT NULL,
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSubmissionRecord_pkey" PRIMARY KEY ("id")
);
