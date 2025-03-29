import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '@/services/questionService';

const questionService = new QuestionService();

export class QuestionController {
  async getAllQuestions() {
    try {
      const questions = await questionService.getAllQuestions();
      return NextResponse.json(questions);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createQuestion(req: NextRequest) {
    try {
      const data = await req.json();
      const question = await questionService.createQuestion(data);
      return NextResponse.json(question, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getQuestionById(id: string) {
    try {
      const question = await questionService.getQuestionById(id);
      if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }
      return NextResponse.json(question);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateQuestion(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const updatedQuestion = await questionService.updateQuestion(id, data);
      return NextResponse.json(updatedQuestion);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteQuestion(id: string) {
    try {
      await questionService.deleteQuestion(id);
      return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
