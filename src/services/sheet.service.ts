"use server";

import { google } from "googleapis";
import gcpConfig from "../../config/gcp";
import { ISubmission } from "@/models/submission.model";

export async function createSheet(name: string) {
  "use server";
  const auth = new google.auth.GoogleAuth({
    credentials: gcpConfig, // Path to your JSON key file
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  const input = ["filename", "segment start", "segment end", "speaker label"];
  try {
    const spreadsheet = await sheets.spreadsheets.create({
      fields: "spreadsheetId",
      requestBody: {
        properties: {
          title: name,
        },
        sheets: [
          {
            properties: {
              title: "Input",
            },
            data: [
              {
                rowData: [
                  {
                    values: [
                      {
                        userEnteredValue: {
                          stringValue: "filename",
                        },
                      },
                      {
                        userEnteredValue: {
                          stringValue: "segment start",
                        },
                      },
                      {
                        userEnteredValue: {
                          stringValue: "segment end",
                        },
                      },
                      {
                        userEnteredValue: {
                          stringValue: "speaker label",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            properties: {
              title: "Consolidated",
            },
            data: [
              {
                rowData: [
                  {
                    values: [
                      {
                        userEnteredValue: {
                          stringValue: "filename",
                        },
                      },
                      {
                        userEnteredValue: {
                          stringValue: "segment start",
                        },
                      },
                      {
                        userEnteredValue: {
                          stringValue: "segment end",
                        },
                      },
                      {
                        userEnteredValue: {
                          stringValue: "speaker label",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    const spreadsheetId = spreadsheet.data.spreadsheetId || "";

    const response = await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: "writer",
        type: "anyone",
      },
    });

    //console.log(spreadsheet.data, response.data);

    return spreadsheetId;
  } catch (error) {
    console.error("The API returned an error: " + error);
    throw error;
  }
}

export async function writeToSheet(
  spreadsheetId: string,
  values: any[],
  range: string
) {
  const auth = new google.auth.GoogleAuth({
    credentials: gcpConfig,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const rawData = {
    values,
  };
  const response = await sheets.spreadsheets.values.update({
    valueInputOption: "RAW",
    spreadsheetId,
    range,
    requestBody: rawData,
  });
}

export async function appendToSheet(
  spreadsheetId: string,
  data: ISubmission,
  range: string
) {
  const auth = new google.auth.GoogleAuth({
    credentials: gcpConfig,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
  const sheets = google.sheets({ version: "v4", auth });

  try {
    // Add your logic here to construct the data in the format expected by the Sheets API
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Consolidated",
    });

    // Calculate the next available column (add 1 to the last column index)
    let nextColumnIndex = existingData.data.values
      ? existingData.data.values[0].length + 1
      : 1;
    nextColumnIndex--;

    const rawData = {
      values: [[data.username], [data.email], [data.language]],
    };

    const range = `Consolidated!${String.fromCharCode(
      65 + nextColumnIndex
    )}:${String.fromCharCode(65 + nextColumnIndex)}`;

    for (const segment of data.segments) {
      rawData.values.push([segment]);
    }

    const response = await sheets.spreadsheets.values.append({
      valueInputOption: "RAW",
      spreadsheetId,
      range,
      requestBody: rawData,
    });
  } catch (error) {
    console.error("The API returned an error: " + error);
    throw error;
  }
}

export async function readSheetValues(id: string, range: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: gcpConfig, // Path to your JSON key file
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const valueResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: range,
  });

  const values = valueResponse.data.values;

  return values || [];
}
