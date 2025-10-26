import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentClass = searchParams.get('class');
  const section = searchParams.get('section');
  const date = searchParams.get('date');

  const whereClause: any = {};
  if (studentClass || section) {
    whereClause.student = {};
    if (studentClass) whereClause.student.class = studentClass;
    if (section) whereClause.student.section = section;
  }
  if (date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    whereClause.entryTime = { gte: startOfDay, lte: endOfDay };
  }

  try {
    const entries = await prisma.labEntry.findMany({
      where: whereClause,
      include: { student: true },
      orderBy: { entryTime: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
