import { NextRequest, NextResponse } from 'next/server';
import { AddStudentController } from '@/controllers/addStudentController';

const addStudentController = new AddStudentController();

export async function POST(req:NextRequest) {
    return addStudentController.bulkCreateStudents(req);
}
