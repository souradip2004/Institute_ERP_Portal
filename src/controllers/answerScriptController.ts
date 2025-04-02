import { NextRequest, NextResponse } from 'next/server';
import { AnswerScriptService } from '@/services/answerScriptService';

const answerScriptService = new AnswerScriptService();

export class AnswerScriptController {
  async getAll() {
    try {
      const answerScripts = await answerScriptService.getAll();
      return NextResponse.json(answerScripts);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async create(req: NextRequest) {
    try {
      const data = await req.json();
      const answerScript = await answerScriptService.create(data);
      return NextResponse.json(answerScript, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getById(id: string) {
    try {
      const answerScript = await answerScriptService.getById(id);
      if (!answerScript) {
        return NextResponse.json({ error: 'Answer script not found' }, { status: 404 });
      }
      return NextResponse.json(answerScript);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const updatedAnswerScript = await answerScriptService.update(id, data);
      return NextResponse.json(updatedAnswerScript);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async delete(id: string) {
    try {
      await answerScriptService.delete(id);
      return NextResponse.json({ message: 'Answer script deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
