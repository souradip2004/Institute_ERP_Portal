import { NextRequest, NextResponse } from 'next/server';
import { AnswerScriptService } from '@/services/answerScriptService';

const answerScriptService = new AnswerScriptService();

export class AnswerScriptController {
  async getAllAnswerScripts() {
    try {
      const answerScripts = await answerScriptService.getAllAnswerScripts();
      return NextResponse.json(answerScripts);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createAnswerScript(req: NextRequest) {
    try {
      const data = await req.json();
      const answerScript = await answerScriptService.createAnswerScript(data);
      return NextResponse.json(answerScript, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getAnswerScriptById(id: string) {
    try {
      const answerScript = await answerScriptService.getAnswerScriptById(id);
      if (!answerScript) {
        return NextResponse.json({ error: 'Answer script not found' }, { status: 404 });
      }
      return NextResponse.json(answerScript);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateAnswerScript(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const updatedAnswerScript = await answerScriptService.updateAnswerScript(id, data);
      return NextResponse.json(updatedAnswerScript);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteAnswerScript(id: string) {
    try {
      await answerScriptService.deleteAnswerScript(id);
      return NextResponse.json({ message: 'Answer script deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
