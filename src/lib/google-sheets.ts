import { google } from 'googleapis';

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;

// Column layout (A=# auto, B=carNumber, C=carBrand, D=carType, E=tokefTest,
//                F=mileage, G=assignedTo, H=company, I=dateAdded, J=folderUrl,
//                K=hasRishaon, L=hasGiyus, M=isComplete)

export interface CarRecord {
  carNumber: string;
  carBrand: string;
  carType: string;
  tokefTest: string;
  mileage: string;
  assignedTo: string;
  company: string;
  dateAdded: string;
  folderUrl: string;
  hasRishaon: boolean;
  hasGiyus: boolean;
  isComplete: boolean;
}

export interface TransferRecord {
  carNumber: string;
  fromPerson: string;
  toPerson: string;
  transferDate: string;
}

export async function initializeSpreadsheet() {
  const sheets = getSheetsClient();

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existingSheets = (meta.data.sheets || []).map((s) => s.properties?.title);

  const sheetsToCreate: { title: string }[] = [];
  if (!existingSheets.includes('Cars')) sheetsToCreate.push({ title: 'Cars' });
  if (!existingSheets.includes('Transfers')) sheetsToCreate.push({ title: 'Transfers' });

  if (sheetsToCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: sheetsToCreate.map((s) => ({
          addSheet: { properties: { title: s.title } },
        })),
      },
    });
  }

  // Cars headers (A=# B=מספר רכב C=יצרן D=סוג E=תוקף F=ק"מ G=שייך ל H=חברה I=תאריך J=קישור K=רישיון L=טופס גיוס M=הושלם)
  const carsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Cars!A1:M1',
  });

  if (!carsRes.data.values || carsRes.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Cars!A1:M1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          '#',
          'מספר רכב',
          'יצרן',
          'סוג רכב',
          'תוקף טסט',
          'ק"מ',
          'שייך ל',
          'חברה',
          'תאריך הוספה',
          'קישור לתיקייה',
          'רישיון רכב',
          'טופס גיוס',
          'הושלם',
        ]],
      },
    });
  }

  // Transfers headers
  const transfersRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Transfers!A1:D1',
  });

  if (!transfersRes.data.values || transfersRes.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Transfers!A1:D1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['מספר רכב', 'ממי', 'למי', 'תאריך העברה']],
      },
    });
  }
}

export async function findCarByNumber(carNumber: string): Promise<CarRecord | null> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Cars!A:M',
  });

  const rows = res.data.values || [];
  // carNumber is in column B (index 1), skip header row
  const row = rows.slice(1).find((r) => r[1]?.toString().toUpperCase() === carNumber.toUpperCase());

  if (!row) return null;

  return rowToCarRecord(row);
}

function rowToCarRecord(row: string[]): CarRecord {
  return {
    carNumber: row[1] || '',
    carBrand: row[2] || '',
    carType: row[3] || '',
    tokefTest: row[4] || '',
    mileage: row[5] || '',
    assignedTo: row[6] || '',
    company: row[7] || '',
    dateAdded: row[8] || '',
    folderUrl: row[9] || '',
    hasRishaon: row[10] === '✓',
    hasGiyus: row[11] === '✓',
    isComplete: row[12] === '✓',
  };
}

export async function addCar(car: CarRecord): Promise<void> {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Cars!A:M',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        '=ROW()-1',  // # auto-numbering
        car.carNumber,
        car.carBrand,
        car.carType,
        car.tokefTest,
        car.mileage,
        car.assignedTo,
        car.company,
        car.dateAdded,
        car.folderUrl,
        car.hasRishaon ? '✓' : '✗',
        car.hasGiyus ? '✓' : '✗',
        car.isComplete ? '✓' : '✗',
      ]],
    },
  });
}

export async function transferCar(
  carNumber: string,
  newAssignedTo: string,
  transferDate: string
): Promise<boolean> {
  const sheets = getSheetsClient();

  // Read columns A:G to find the row (carNumber=B=index1, assignedTo=G=index6)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Cars!A:G',
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[1]?.toString().toUpperCase() === carNumber.toUpperCase());

  if (rowIndex === -1) return false;

  const oldAssignedTo = rows[rowIndex][6] || '';
  const sheetRow = rowIndex + 1; // 1-indexed

  // Column G = assignedTo
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Cars!G${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[newAssignedTo]],
    },
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Transfers!A:D',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[carNumber, oldAssignedTo, newAssignedTo, transferDate]],
    },
  });

  return true;
}

export async function getAllCars(): Promise<CarRecord[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Cars!A:M',
  });

  const rows = res.data.values || [];
  return rows.slice(1).map(rowToCarRecord);
}
