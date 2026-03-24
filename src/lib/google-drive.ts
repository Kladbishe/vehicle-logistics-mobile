import { google } from 'googleapis';
import { Readable } from 'stream';

// Drive uses OAuth2 (personal account) — service accounts have no storage quota on personal Drive
function getDriveAuth() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });
  return oauth2Client;
}

function getDriveClient() {
  return google.drive({ version: 'v3', auth: getDriveAuth() });
}

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

export async function createCarFolder(carNumber: string): Promise<{ id: string; url: string }> {
  const drive = getDriveClient();

  // Check if folder already exists
  const existing = await drive.files.list({
    q: `name='${carNumber}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, webViewLink)',
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return {
      id: existing.data.files[0].id!,
      url: existing.data.files[0].webViewLink!,
    };
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name: carNumber,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ROOT_FOLDER_ID],
    },
    fields: 'id, webViewLink',
  });

  return {
    id: folder.data.id!,
    url: folder.data.webViewLink!,
  };
}

export async function getOrCreateZikhuyFolder(): Promise<string> {
  const drive = getDriveClient();
  const folderName = 'טופסי זיכוי';

  const existing = await drive.files.list({
    q: `name='${folderName}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ROOT_FOLDER_ID],
    },
    fields: 'id',
  });

  return folder.data.id!;
}

export async function uploadFile(
  folderId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const drive = getDriveClient();

  const stream = Readable.from(fileBuffer);

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  });

  return file.data.webViewLink || '';
}
