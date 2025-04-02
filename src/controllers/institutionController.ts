import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/services/institutionService';

const institutionService = new InstitutionService();

export class InstitutionController {
  async getAllInstitutions(req: NextRequest) {
    try {
      const institutions = await institutionService.getAllInstitutions();
      return NextResponse.json(institutions);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createInstitution(req: NextRequest) {
    try {
      const data = await req.json();
      const institution = await institutionService.createInstitution(data);
      return NextResponse.json(institution, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getInstitutionById(id: string) {
    try {
      const institution = await institutionService.getInstitutionById(id);
      if (!institution) {
        return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
      }
      return NextResponse.json(institution);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateInstitution(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const institution = await institutionService.updateInstitution(id, data);
      return NextResponse.json(institution);
    } catch (error: any) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteInstitution(id: string) {
    try {
      await institutionService.deleteInstitution(id);
      return NextResponse.json({ message: 'Institution deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }



   async fetchDepartmentsByInstitute(institutionId: string) {
    
      try {
      const dept = await institutionService.getAllDepartmentsByInstitute(institutionId);
      console.log('dept: ');
      console.log(dept);
      if (!dept) {
        return NextResponse.json({ error: 'department not found' }, { status: 404 });
      }
      return NextResponse.json(dept);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
  
    async fetchSemestersByInstituteId(institutionId: string) {
    
      try {
      const semesters = await institutionService.getAllSemestersByinstituteId(institutionId);
      console.log('institute: ');
      console.log(semesters);
      if (!semesters) {
        return NextResponse.json({ error: 'department not found' }, { status: 404 });
      }
      return NextResponse.json(semesters);
      } catch (error: any) {
        console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
};
}
