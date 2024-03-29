"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { syncSheet } from "@/actions/sheet.action";
import { ISheet } from "@/models/sheet.model";

import ClipboardJS from "clipboard";
import { useEffect } from "react";
// import dbConnect from "@/lib/db";

export function SheetsTable({ sheets }: { sheets: ISheet[] }) {
  useEffect(() => {
    // Initialize ClipboardJS
    new ClipboardJS(".copy-link-button", {
      text: (trigger) => {
        const sheetId = trigger.getAttribute("data-sheet-id");
        return `${window.location.origin}/form/${sheetId}`;
      },
    });
  }, []);

  // async function getSheets() {
  //   await dbConnect();

  //   const sheets = await Sheets.find({}).limit(10).exec();
  //   console.log("getting sheets");
  //   return sheets.map((sheetDoc) => {
  //     const sheet = sheetDoc.toJSON();
  //     return {
  //       ...sheet,
  //       _id: sheet._id.toString(),
  //     };
  //   });
  // }

  return (
    <>
      {/* <div><button onClick={getSheets}>reload </button></div> */}
      <Table>
        <TableCaption>{sheets.length} available sheets.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">SNO</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Synced</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sheets.map((sheet, i) => {
            const sheetId = sheet._id;
            return (
              <TableRow key={sheetId}>
                <TableCell className="font-medium">Task-{i}</TableCell>
                <TableCell>{sheet.name}</TableCell>
                <TableCell>{sheet.status}</TableCell>
                <TableCell>
                  {new Date(sheet.last_synced).toDateString() || "-"}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button asChild>
                    <Link
                      href={`https://docs.google.com/spreadsheets/d/${sheet.sid}`}
                      target="_blank"
                    >
                      Open Sheet
                    </Link>
                  </Button>
                  <Button
                    data-sheet-id={sheetId}
                    className="copy-link-button"
                    disabled={sheet.status == "pending"}
                    asChild
                  >
                    <Link href={'/form/' + sheetId} target="_blank">
                      Copy Link
                    </Link>
                  </Button>
                  <form action={syncSheet}>
                    <input
                      hidden
                      type="text"
                      readOnly
                      name="id"
                      value={sheet._id}
                    />
                    <input
                      hidden
                      type="text"
                      readOnly
                      name="s_id"
                      value={sheet.sid}
                    />
                    <Button type="submit">Sync Now</Button>
                  </form>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
