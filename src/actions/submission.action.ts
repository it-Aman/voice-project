"use server";

import dbConnect from "@/lib/db";
import Submissions from "@/models/submission.model";
import { appendToSheet } from "@/services/sheet.service";

export async function sendSubmission(form: FormData) {
  await dbConnect();
  const sheet_id = form.get("sheet_id")?.toString();
  const s_id = form.get("s_id")?.toString() || "";

  const username = form.get("name")?.toString() || "";
  const email = form.get("email")?.toString() || "";
  const language = form.get("language")?.toString() || "";

  const segmentAnswers = [];
  const s_count = Number(form.get("s_count")) || 0;

  for (let i = 0; i < s_count; i++) {
    segmentAnswers.push(form.get(`audio-${i}`)?.toString() || "");
  }

  const data = {
    username,
    email,
    language,
    s_id,
    segments: segmentAnswers,
  };

  try {
    await Submissions.updateOne(
      {
        s_id,
      },
      data,
      {
        upsert: true,
      }
    );

    await appendToSheet(s_id, data, "");
    console.log("Submission saved successfully");
  } catch (error) {
    console.error("Error saving submission:", error);
  }
}

export async function getLatestSubmission(s_id: any) {
  await dbConnect();
  try {
    // Find the latest submission based on email and language
    const latestSubmission = await Submissions.findOne({
      s_id,
    }); // Sort by createdAt in descending order to get the latest submission

    return latestSubmission;
  } catch (error) {
    console.error("Error fetching latest submission:", error);
    return null;
  }
}
