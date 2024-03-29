"use server";

import dbConnect from "@/lib/db";
import Sheets from "@/models/sheet.model";
import {
  createSheet,
  readSheetValues,
  writeToSheet,
} from "@/services/sheet.service";
import { revalidatePath } from "next/cache";

export async function createNewSheet(formData: FormData) {
  const name = formData.get("name")?.toString() || "";
  await dbConnect();

  try {
    const spreadsheet = await createSheet(name);
    console.log(spreadsheet);

    revalidatePath("/");

    const sheetDoc = new Sheets({
      name: name,
      sid: spreadsheet,
      status: "pending",
    });

    await sheetDoc.save();

    return {
      status: true,
      id: spreadsheet,
    };
  } catch (e: any) {
    return {
      status: false,
      message: "something went wrong",
    };
  }
}

export async function syncSheet(formData: FormData) {
  await dbConnect();
  const sheetId = formData.get("id")?.toString() || "";
  const s_id = formData.get("s_id")?.toString() || "";

  const sheetDoc = await Sheets.findById(sheetId);

  const values = await readSheetValues(sheetDoc.sid, "Input!A2:D100");

  const audio_url = values[0][0];

  console.log(values);

  await writeToSheet(s_id, values, "Consolidated!A4");

  const segments = [];

  for (const segmentValues of values) {
    segments.push({
      start_time: timeStringToSeconds(segmentValues[1]),
      end_time: timeStringToSeconds(segmentValues[2]),
    });
  }

  console.log(segments);

  sheetDoc.audio_url = audio_url;
  sheetDoc.segments = segments;
  sheetDoc.status = "synced";
  sheetDoc.last_synced = new Date();

  await sheetDoc.save();

  revalidatePath("/");
}

function timeStringToSeconds(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(":");

  const totalSeconds =
    parseInt(hours, 10) * 3600 +
    parseInt(minutes, 10) * 60 +
    parseInt(seconds, 10);

  return totalSeconds;
}
