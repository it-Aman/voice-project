import { Separator } from "@/components/ui/separator"

import { CounterClockwiseClockIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import { sendSubmission } from "@/actions/submission.action"
import Audios from "@/models/audio.model"
import dbConnect from "@/lib/db"
import { cookies } from "next/headers"
import { RedirectType, redirect } from "next/navigation"
import Sheets, { ISegment } from "@/models/sheet.model"
import FormSubmitPage from "@/components/fixed/form-submit"

async function getSheetInfo(sheetId: string) {
  await dbConnect();

  const sheetDoc = await Sheets.findOne({
    _id: sheetId
  });

  const sheetInfo = sheetDoc.toObject();

  sheetInfo._id = sheetInfo._id.toString()
  sheetInfo.segments = sheetInfo.segments.map((segment: any) => ({
    start_time: segment.start_time,
    end_time: segment.end_time
  }))

  return sheetInfo;
}

export default async function FormPage({ params }: { params: { id: string } }) {
  const sheetInfo = await getSheetInfo(params.id);

  return (
    <div className="w-screen flex items-center justify-center">
        <FormSubmitPage sheet={sheetInfo} />
    </div>
  )
}
