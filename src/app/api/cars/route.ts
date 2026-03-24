import { NextRequest, NextResponse } from 'next/server';
import { addCar, findCarByNumber, getAllCars, initializeSpreadsheet } from '@/lib/google-sheets';
import { createCarFolder, uploadFile } from '@/lib/google-drive';
import { formatDateForSheet, normalizePlate } from '@/lib/utils';

export const maxDuration = 60;

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
    const filledBy = (formData.get('filledBy') as string) || '';
    const hasEquipmentRaw = formData.get('hasEquipment') as string;
    const hasEquipment: boolean | null =
      hasEquipmentRaw === 'yes' ? true : hasEquipmentRaw === 'no' ? false : null;
    const missingEquipment = (formData.get('missingEquipment') as string) || '';

    // Validation
    if (!carNumber || !carBrand || !carType || !tokefTest || !mileage || !assignedTo || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check duplicate
    const existing = await findCarByNumber(carNumber);
    if (existing) {
      return NextResponse.json({ error: 'Car already exists' }, { status: 409 });
    }

    // Create Drive folder
    const { id: folderId, url: folderUrl } = await createCarFolder(carNumber);

    // Collect car photos
    const carPhotoFiles: File[] = [];
    let photoIndex = 0;
    while (true) {
      const photo = formData.get(`carPhoto_${photoIndex}`) as File | null;
      if (!photo) break;
      carPhotoFiles.push(photo);
      photoIndex++;
    }

    // Upload all files in parallel
    const [hasRishaon, hasGiyus] = await Promise.all([
      rishaonPhoto
        ? rishaonPhoto.arrayBuffer().then((buf) =>
            uploadFile(folderId, `rishaon_rehev.${rishaonPhoto.name.split('.').pop() || 'jpg'}`, Buffer.from(buf), rishaonPhoto.type)
          ).then(() => true)
        : Promise.resolve(false),
      giyusPhoto
        ? giyusPhoto.arrayBuffer().then((buf) =>
            uploadFile(folderId, `tofes_giyus.${giyusPhoto.name.split('.').pop() || 'jpg'}`, Buffer.from(buf), giyusPhoto.type)
          ).then(() => true)
        : Promise.resolve(false),
      ...carPhotoFiles.map((photo, i) =>
        photo.arrayBuffer().then((buf) =>
          uploadFile(folderId, `car_photo_${i + 1}.${photo.name.split('.').pop() || 'jpg'}`, Buffer.from(buf), photo.type)
        )
      ),
    ]).then(([r, g]) => [r, g]);

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
      hasZikhuy: false,
      filledBy,
      hasEquipment,
      missingEquipment,
    });

    return NextResponse.json({ success: true, carNumber, folderUrl });
  } catch (error) {
    console.error('POST /api/cars error:', error);
    return NextResponse.json({ error: 'Failed to save car' }, { status: 500 });
  }
}
