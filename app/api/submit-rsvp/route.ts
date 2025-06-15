// pages/api/submit-rsvp.js (for Next.js Pages Router)
// OR app/api/submit-rsvp/route.js (for Next.js App Router)

import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Your Google Sheets ID (extract from your sheet URL)
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Prepare data to insert
    const values = [[
      new Date().toISOString(), // Timestamp
      body.name,
      body.email,
      body.phone,
      body.guests,
      body.specialRequests,
    ]];

    // Insert data into the sheet
    
    await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:F',
    valueInputOption: 'RAW',
    requestBody: {
        values,
    },
    });


    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit RSVP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Your Google Sheets ID
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Prepare data to insert
    const values = [[
      new Date().toISOString(), // Timestamp
      body.name,
      body.email,
      body.phone,
      body.guests,
      body.specialRequests,
    ]];

    // Insert data into the sheet
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:F',
        valueInputOption: 'RAW',
        requestBody: {
            values,
        },
    });


    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    console.log(error);
    res.status(500).json({ error: 'Failed to submit RSVP' });
  }
}