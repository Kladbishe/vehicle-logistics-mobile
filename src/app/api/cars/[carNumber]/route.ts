import { NextRequest, NextResponse } from 'next/server';
import { findCarByNumber, transferCar } from '@/lib/google-sheets';
import { formatDateForSheet, normalizePlate } from '@/lib/utils';

interface Params {
  params: { carNumber: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const carNumber = normalizePlate(decodeURIComponent(params.carNumber));
    const car = await findCarByNumber(carNumber);

    if (!car) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true, car });
  } catch (error) {
    console.error('GET /api/cars/[carNumber] error:', error);
    return NextResponse.json({ error: 'Failed to search car' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const carNumber = normalizePlate(decodeURIComponent(params.carNumber));
    const body = await req.json();
    const { assignedTo } = body;

    if (!assignedTo?.trim()) {
      return NextResponse.json({ error: 'assignedTo is required' }, { status: 400 });
    }

    const transferDate = formatDateForSheet(new Date());
    const success = await transferCar(carNumber, assignedTo.trim(), transferDate);

    if (!success) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, transferDate });
  } catch (error) {
    console.error('PUT /api/cars/[carNumber] error:', error);
    return NextResponse.json({ error: 'Failed to transfer car' }, { status: 500 });
  }
}
