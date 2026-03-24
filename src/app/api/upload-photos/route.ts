import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/google-drive';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const folderId = formData.get('folderId') as string;
    const startIndex = parseInt((formData.get('startIndex') as string) || '0', 10);

    if (!folderId) {
      return NextResponse.json({ error: 'Missing folderId' }, { status: 400 });
    }

    const uploads: Promise<void>[] = [];
    let i = 0;
    while (true) {
      const photo = formData.get(`photo_${i}`) as File | null;
      if (!photo) break;
      const idx = startIndex + i;
      uploads.push(
        photo.arrayBuffer()
          .then((buf) => uploadFile(folderId, `car_photo_${idx + 1}.${photo.name.split('.').pop() || 'jpg'}`, Buffer.from(buf), photo.type))
          .then(() => {})
      );
      i++;
    }

    await Promise.all(uploads);
    return NextResponse.json({ success: true, uploaded: i });
  } catch (error) {
    console.error('POST /api/upload-photos error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
