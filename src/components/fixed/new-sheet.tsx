"use client";

import { createNewSheet } from "@/actions/sheet.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function NewSheet() {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Create New Sheet</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form
            action={createNewSheet}
            onSubmit={() => toast("Sheet is being created", {})}
          >
            <DialogHeader>
              <DialogTitle>Create new sheet</DialogTitle>
              <DialogDescription>Enter Name of your sheet</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="destructive">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Create</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
