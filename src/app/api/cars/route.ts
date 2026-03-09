import { NextRequest, NextResponse } from 'next/server';
import { addCar, findCarByNumber, getAllCars, initializeSpreadsheet } from '@/lib/google-sheets';
import { createCarFolder, uploadFile } from '@/lib/google-drive';
import { formatDateForSheet, normalizePlate } from '@/lib/utils';

export async function GET() {
  try {
    await initializeSpreadsheet();
    const cars = await getAllCars();
    return NextResponse.json({ cars });
  } catch (error) {
    console.error('GET /api/cars error:', error);
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const carNumber = normalizePlate(formData.get('carNumber') as string);
    const carBrand = formData.get('carBrand') as string;
    const carType = formData.get('carType') as string;
    const tokefTest = formData.get('tokefTest') as string;
    const mileage = formData.get('mileage') as string;
    const assignedTo = formData.get('assignedTo') as string;
    const company = formData.get('company') as string;
    const rishaonPhoto = formData.get('rishaonPhoto') as File | null;
    const giyusPhoto = formData.get('giyusPhoto') as File | null;

    // Validation
    if (!carNumber || !carBrand || !carType || !tokefTest || !mileage || !assignedTo || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check duplicate
    await initializeSpreadsheet();
    const existing = await findCarByNumber(carNumber);
    if (existing) {
      return NextResponse.json({ error: 'Car already exists' }, { status: 409 });
    }

    // Create Drive folder
    const { id: folderId, url: folderUrl } = await createCarFolder(carNumber);

    // Upload rishaon photo
    let hasRishaon = false;
    if (rishaonPhoto) {
      const buffer = Buffer.from(await rishaonPhoto.arrayBuffer());
      const ext = rishaonPhoto.name.split('.').pop() || 'jpg';
      await uploadFile(folderId, `rishaon_rehev.${ext}`, buffer, rishaonPhoto.type);
      hasRishaon = true;
    }

    // Upload giyus photo
    let hasGiyus = false;
    if (giyusPhoto) {
      const buffer = Buffer.from(await giyusPhoto.arrayBuffer());
      const ext = giyusPhoto.name.split('.').pop() || 'jpg';
      await uploadFile(folderId, `tofes_giyus.${ext}`, buffer, giyusPhoto.type);
      hasGiyus = true;
    }

    // Upload car photos
    let photoIndex = 0;
    while (true) {
      const photo = formData.get(`carPhoto_${photoIndex}`) as File | null;
      if (!photo) break;
      const buffer = Buffer.from(await photo.arrayBuffer());
      const ext = photo.name.split('.').pop() || 'jpg';
      await uploadFile(folderId, `car_photo_${photoIndex + 1}.${ext}`, buffer, photo.type);
      photoIndex++;
    }

    const isComplete = hasRishaon && !!carType && !!tokefTest && !!mileage && !!assignedTo;

    // Save to Sheets
    await addCar({
      carNumber,
      carBrand,
      carType,
      tokefTest,
      mileage,
      assignedTo,
      company,
      dateAdded: formatDateForSheet(new Date()),
      folderUrl,
      hasRishaon,
      hasGiyus,
      isComplete,
    });

    return NextResponse.json({ success: true, carNumber, folderUrl });
  } catch (error) {
    console.error('POST /api/cars error:', error);
    return NextResponse.json({ error: 'Failed to save car' }, { status: 500 });
  }
}
