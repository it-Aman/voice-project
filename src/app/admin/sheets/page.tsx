"use server";

import { redirect } from "next/navigation";
import { isAdmin } from "@/services/auth.service";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Sheets from "@/models/sheet.model";

import { NewSheet } from "@/components/fixed/new-sheet";
import { SheetsTable } from "@/components/fixed/sheets-table";

// Simulate a database read for tasks.
async function getSheets() {
  await dbConnect();

  const sheets = await Sheets.find({}).limit(10).exec();
  console.log("getting sheets");
  return sheets.map((sheetDoc) => {
    const sheet = sheetDoc.toJSON();
    return {
      ...sheet,
      _id: sheet._id.toString(),
    };
  });
}

export default async function TaskPage() {
  const cookieStore = cookies();
  const username = cookieStore.get("username")?.value;
  const password = cookieStore.get("password")?.value;

  if (!(await isAdmin(username, password))) {
    redirect(`/admin`);
  }

  const sheets = await getSheets();

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <NewSheet />
        <SheetsTable sheets={sheets} />
      </div>
    </>
  );
}
