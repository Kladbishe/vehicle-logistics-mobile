import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function GET() {
  try {
    const sheets = google.sheets({ version: 'v4', auth: getAuth() });
    const id = process.env.GOOGLE_SHEETS_ID!;

    // Force-write Cars headers (Hebrew only)
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: 'Cars!A1:Q1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          '#', 'מספר רכב', 'יצרן', 'סוג רכב', 'תוקף טסט', 'ק"מ',
          'שייך ל', 'חברה', 'תאריך הוספה', 'קישור לתיקייה',
          'רישיון רכב', 'טופס גיוס', 'הושלם', 'מזוכה',
          'מי מילא', 'יש כלי רכב', 'מה חסר',
        ]],
      },
    });

    // Force-write Transfers headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: 'Transfers!A1:D1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['מספר רכב', 'ממי', 'למי', 'תאריך העברה']],
      },
    });

    return NextResponse.json({ success: true, message: 'Headers updated (17 columns A-Q)' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
