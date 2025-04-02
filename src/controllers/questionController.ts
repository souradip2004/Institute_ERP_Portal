import { NextRequest, NextResponse } from 'next/server';
import { QuestionService, CreateQuestionDTO, UpdateQuestionDTO } from '@/services/questionService';

const questionService = new QuestionService();

export class QuestionController {
  async getAllQuestions(req: NextRequest) {
    try {
      const questions = await questionService.getAllQuestions();
      return NextResponse.json(questions);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching questions:', error.message);
      } else {
        console.error('Error fetching questions:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching questions' }, { status: 500 });
    }
  }

  async createQuestion(req: NextRequest) {
    try {
      const data = await req.json();
      const {
        examId,
        questionText,
        questionType,
        marks,
        difficultyLevel,
        correctAnswer,
        options,
        createdById,
        isAiGenerated,
      } = data;

      if (!examId || !questionText || !questionType || !marks || !difficultyLevel || !correctAnswer || !createdById) {
        return NextResponse.json({ error: 'examId, questionText, questionType, marks, difficultyLevel, correctAnswer, and createdById are required' }, { status: 400 });
      }

      const createData: CreateQuestionDTO = {
        examId,
        questionText,
        questionType,
        marks,
        difficultyLevel,
        correctAnswer,
        options,
        createdById,
        isAiGenerated,
      };
      const question = await questionService.createQuestion(createData);
      return NextResponse.json(question, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating question:', error.message);
      } else {
        console.error('Error creating question:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while creating the question' }, { status: 500 });
    }
  }

  async getQuestionById(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });

      const question = await questionService.getQuestionById(id);
      if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

      return NextResponse.json(question);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error fetching question ${id}:`, error.message);
      } else {
        console.error(`Error fetching question ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching the question' }, { status: 500 });
    }
  }

  async updateQuestion(id: string, req: NextRequest) {
    try {
      if (!id) return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });

      const data = await req.json();
      const updateData: UpdateQuestionDTO = {
        questionText: data.questionText,
        questionType: data.questionType,
        marks: data.marks,
        difficultyLevel: data.difficultyLevel,
        correctAnswer: data.correctAnswer,
        options: data.options,
        isAiGenerated: data.isAiGenerated,
      };

      const updatedQuestion = await questionService.updateQuestion(id, updateData);
      return NextResponse.json(updatedQuestion);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error updating question ${id}:`, error.message);
      } else {
        console.error(`Error updating question ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while updating the question' }, { status: 500 });
    }
  }

  async deleteQuestion(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });

      await questionService.deleteQuestion(id);
      return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting question ${id}:`, error.message);
      } else {
        console.error(`Error deleting question ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while deleting the question' }, { status: 500 });
    }
  }
}