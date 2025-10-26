import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { admissionNo } = await request.json();
    if (!admissionNo) {
      return NextResponse.json({ error: 'Admission number is required' }, { status: 400 });
    }
    const student = await prisma.student.findUnique({
      where: { admissionNo },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    const newEntry = await prisma.labEntry.create({
      data: { studentAdmissionNo: admissionNo, },
      include: { student: true, },
    });
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
