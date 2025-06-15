import { AnyAaaaRecord } from 'dns';
import { google } from 'googleapis';

const CURRENT_SLOT = 'Sheet1';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const MAX_REVIEWERS_PER_SHEET = 250;

async function getGoogleSheetsInstance() {

  const auth = new google.auth.JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY ,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  await auth.authorize();

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}


async function getCurrentSheetInfo(sheets: any) {
  try {
    // Get all sheets in the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const allSheets = spreadsheet.data.sheets;
        
    let currentSheetIndex = 1;
    let currentSheetName = 'Sheet1';
        
    for (const sheet of allSheets) {
      const sheetName = sheet.properties.title;
      const match = sheetName.match(/^Sheet(\d+)$/);
      if (match) {
        const sheetNumber = parseInt(match[1]);
        if (sheetNumber > currentSheetIndex) {
          currentSheetIndex = sheetNumber;
          currentSheetName = sheetName;
        }
      }
    }

    // Get data from columns A (reviewers) and the guests column
    // Assuming guests column is B, but you can adjust this
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${currentSheetName}!A:E`, // Adjust range if guests column is different
    });

    const rows = response.data.values || [];
    const currentRowCount = rows.length;
    
    let totalCapacity = 0;
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // const reviewerCount = row[0] ? 1 : 0; // 1 if reviewer exists, 0 if empty
      const guestCount = row[1] ? parseInt(row[3]) || 0 : 0; // Number of guests, default to 0
      
      totalCapacity +=  guestCount;
    }

    console.log(">>>>>>>>>>>>", totalCapacity);

    return {
      currentSheetName,
      currentSheetIndex,
      currentRowCount,
      totalCapacity,
      needsNewSheet: totalCapacity >= MAX_REVIEWERS_PER_SHEET // Compare total capacity instead of row count
    };
  } catch (error) {
    console.error('Error getting sheet info:', error);
    throw error;
  }
}

async function createNewSheet(sheets: any, sheetIndex: any) {
  const newSheetName = `Sheet${sheetIndex}`;
  
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: newSheetName,
              },
            },
          },
        ],
      },
    });

    const headers = [
      'Timestamp',
      'Ward Name',
      'Ward Class', 
      'Number of Participants',
      'Email',
      'Phone',
      'Participant 1 Name',
      'Participant 1 Relation',
      'Participant 2 Name',
      'Participant 2 Relation'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${newSheetName}!A1:J1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    return newSheetName;
  } catch (error) {
    console.error('Error creating new sheet:', error);
    throw error;
  }
}

async function appendToSheet(sheets: any, sheetName: any, data: any) {
  // Prepare row data
  const readableDate = new Date(data.timestamp).toLocaleString('en-US', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const rowData = [
    readableDate,
    data.wardName,
    data.wardClass,
    data.numberOfParticipants,
    data.email || '',
    data.phone || '',
    data.participants[0]?.name || '',
    data.participants[0]?.relationToStudent || '',
    data.participants[1]?.name || '',
    data.participants[1]?.relationToStudent || ''
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });
  } catch (error) {
    console.error('Error appending to sheet:', error);
    throw error;
  }
}

export async function POST(request: any) {
  try {
    const data = await request.json();
    
    const sheets = await getGoogleSheetsInstance();
    const sheetInfo = await getCurrentSheetInfo(sheets);
    
    let targetSheetName = sheetInfo.currentSheetName;
    let currentSlot = true; // Default to true for Sheet1
    
    if (sheetInfo.needsNewSheet) {
      const newSheetIndex = sheetInfo.currentSheetIndex + 1;
      targetSheetName = await createNewSheet(sheets, newSheetIndex);
      currentSlot = false; // New sheet created, not in current slot
    } else if (sheetInfo.currentSheetName !== CURRENT_SLOT) {
      currentSlot = false; // Using existing sheet that's not Sheet1
    }
    
    const match = targetSheetName.match(/\d+$/);
    const sheetNumber = match ? parseInt(match[0], 10) : null;

    await appendToSheet(sheets, targetSheetName, data);
    
    return Response.json({ 
      message: 'RSVP submitted successfully',
      sheet: sheetNumber,
      currentSlot: currentSlot
    });
  } catch (error: any) {
    console.error('Error processing RSVP:', error);
    return Response.json({ 
      message: 'Failed to submit RSVP',
      error: error.message 
    }, { status: 500 });
  }
}