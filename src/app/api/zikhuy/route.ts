import { NextRequest, NextResponse } from 'next/server';
import { findCarByNumber, initializeSpreadsheet, markCarAsZikhuy } from '@/lib/google-sheets';
import { createCarFolder, getOrCreateZikhuyFolder, uploadFile } from '@/lib/google-drive';
import { normalizePlate } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const carNumber = normalizePlate(formData.get('carNumber') as string);
    const zikhuyPhoto = formData.get('zikhuyPhoto') as File | null;

    if (!carNumber) {
      return NextResponse.json({ error: 'מספר רכב חסר' }, { status: 400 });
    }
    if (!zikhuyPhoto) {
      return NextResponse.json({ error: 'יש לצלם טופס זיכוי' }, { status: 400 });
    }

    await initializeSpreadsheet();
    const car = await findCarByNumber(carNumber);

    const buffer = Buffer.from(await zikhuyPhoto.arrayBuffer());
    const ext = zikhuyPhoto.name.split('.').pop() || 'jpg';

    if (car) {
      // Car exists — upload to car's folder, mark as מזוכה
      const { id: folderId } = await createCarFolder(carNumber);
      await uploadFile(folderId, `tofes_zikhuy.${ext}`, buffer, zikhuyPhoto.type);
      await markCarAsZikhuy(carNumber);
      return NextResponse.json({ success: true, carExists: true });
    } else {
      // Car not in system — upload to shared "טופסי זיכוי" folder
      const folderId = await getOrCreateZikhuyFolder();
      const timestamp = Date.now();
      await uploadFile(folderId, `zikhuy_${carNumber}_${timestamp}.${ext}`, buffer, zikhuyPhoto.type);
      return NextResponse.json({ success: true, carExists: false });
    }
  } catch (error) {
    console.error('POST /api/zikhuy error:', error);
    return NextResponse.json({ error: 'שגיאה בשמירה' }, { status: 500 });
  }
}
