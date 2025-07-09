export interface Exam {
  id: string;
  title: string;
  status: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  startTime: string;
  endTime: string;
  examSubmissions: Array<{
    id: string;
    examId: string;
    studentId: string;
    submissionTime: Date | string;
    obtainedMarks: number;
    status: 'PENDING' | 'GRADED';
    gradedById?: string | null;
    gradedAt?: Date | string | null;
    student: {
      id: string;
      user: {
        name: string;
        email: string;
      }
      currentSemester: string;
      currentYear: string;
      studentRoll: string;
      department: {
        id: string;
        name: string;
      }
    }
  }>
  classSection: {
    batch: {
      name: string;
    };
    semester: {
      name: string;
    };
  };
  examType?: {
    name: string;
  };
}
