import { NextRequest, NextResponse } from 'next/server';
import { StudentService } from '@/services/studentService';
import { UserService } from '@/services/userService';

const studentService = new StudentService();
const userService = new UserService();

export class AddStudentController {


 async createStudent(req: NextRequest) {
  try {
    const data = await req.json();
    // This method creates both a user and a student record
    const {
      name, email, phone, gender, dateOfBirth, address,
      studentRoll, departmentId, batchId,
      parentGuardianName, parentGuardianPhone, parentGuardianEmail,
      currentSemester, currentYear
    } = data;
    
    // Create user first
    const userData = {
      name: name || studentRoll,
      email: email || `${studentRoll}@example.com`,
      phone,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address,
      password: 'DefaultPass123',
      role: 'STUDENT'
    };
    
    // FIXED: Remove the extra object nesting - this was causing the error
    const newUser = await userService.create(userData);
    
    const studentData = {
      userId: newUser.id,
      studentRoll,
      departmentId,
      batchId,
      parentGuardianName,
      parentGuardianPhone,
      parentGuardianEmail,
      currentSemester: currentSemester || 1,
      currentYear: currentYear || 1,
      enrollmentStatus: 'ACTIVE'
    };
    
    const newStudent = await studentService.createStudent(studentData);
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
  
  async bulkCreateStudents(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const departmentId = formData.get('departmentId') as string;
    const batchId = formData.get('batchId') as string;
    
    // Validate inputs
    if (!file || !departmentId || !batchId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
    
    // Check headers (first row)
    const headers = rows[0];
    
    // Map column indexes to field names
    const fieldIndexes: Record<string, number> = {};
    headers.forEach((header, index) => {
      fieldIndexes[header.toLowerCase()] = index;
    });

    // Results tracking
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Process each row (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2 || !row[0]) continue; // Skip empty rows
      
      try {
        const studentRoll = row[fieldIndexes['studentroll']];
        const name = row[fieldIndexes['name']] || studentRoll;
        const email = row[fieldIndexes['email']] || `${studentRoll.toLowerCase()}@example.com`;
        const phone = row[fieldIndexes['phonenumber']];
        
        // Optional fields (if present in CSV)
        const parentGuardianName = fieldIndexes['parentguardianname'] !== undefined ? 
          row[fieldIndexes['parentguardianname']] : '';
        const parentGuardianPhone = fieldIndexes['parentguardianphone'] !== undefined ? 
          row[fieldIndexes['parentguardianphone']] : '';
        const parentGuardianEmail = fieldIndexes['parentguardianemail'] !== undefined ? 
          row[fieldIndexes['parentguardianemail']] : '';
        
        // Create user first
        const userData = {
          name,
          email,
          phone,
          password: 'DefaultPass123', // Default password
          role: 'STUDENT'
        };
        
        const newUser = await userService.create(userData);
        
        // Create student
        const studentData = {
          userId: newUser.id,
          studentRoll,
          departmentId,
          batchId,
          parentGuardianName,
          parentGuardianPhone,
          parentGuardianEmail,
          enrollmentStatus: 'ACTIVE'
        };
        
        await studentService.createStudent(studentData);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i,
          studentRoll: row[fieldIndexes['studentroll']] || 'unknown',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.success + results.failed} students`,
      results
    });
    
  } catch (error: any) {
    console.error('Error processing bulk student upload:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process CSV file' },
      { status: 500 }
    );
  }
}


}
