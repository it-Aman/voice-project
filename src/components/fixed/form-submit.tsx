"use client";

import { Button } from "@/components/ui/button";
import { sendSubmission } from "@/actions/submission.action";
import { getLatestSubmission } from "@/actions/submission.action"
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ISegment, ISheet } from "@/models/sheet.model";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import AudioPlayer from "./audio-player";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import dbConnect from "@/lib/db";
import Submissions from "@/models/submission.model";
import { appendToSheet } from "@/services/sheet.service";

interface FormSubmitPageProps {
  sheet: ISheet;
}

function secondsToHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const hoursString = hours.toString().padStart(2, '0');
  const minutesString = minutes.toString().padStart(2, '0');
  const secondsString = remainingSeconds.toString().padStart(2, '0');

  return `${hoursString}:${minutesString}:${secondsString}`;
}

const FormSubmitPage: React.FC<FormSubmitPageProps> = ({ sheet }) => {

  // console.log("sheet", sheet)
  // const [formData, setFormData] = useState<Record<string, string>>({});


  // // Load form data from local storage on page load
  // useEffect(() => {
  //   const savedFormData = localStorage.getItem(`form_data_${sheet._id}`);
  //   if (savedFormData) {
  //     setFormData(JSON.parse(savedFormData));
  //   }
  // }, [sheet._id]);

  // // Function to handle form changes
  // function onFormChange(event: React.ChangeEvent<HTMLFormElement>) {
  //   const newFormData = new FormData(event.currentTarget);
  //   const newFormDataObject: Record<string, string> = {};

  //   if (!newFormData.get('name')) {
  //     return;
  //   }
  //   newFormData.forEach((value, key) => {
  //     newFormDataObject[key] = value as string;
  //   });

  //   // Save form data to local storage
  //   localStorage.setItem(`form_data_${sheet._id}`, JSON.stringify(newFormDataObject));

  //   // Update state with the new form data
  //   setFormData(newFormDataObject);

  // }

  // const setInitialFieldValues = () => {
  //   const form = document.getElementById('submitForm') as HTMLFormElement;

  //   Object.entries(formData).forEach(([name, value]) => {
  //     const input = form?.elements.namedItem(name) as HTMLInputElement;
  //     if (input) {
  //       input.value = value;
  //     }
  //   });
  // };

  // useEffect(() => {
  //   setInitialFieldValues();
  // }, [formData]);

  // const FormSubmitPage: React.FC<FormSubmitPageProps> = ({ sheet }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formDataShow, setFormDataShow] = useState(false);
  const [emails, setEmail] = useState('');

  // Load form data from local storage on page load
  useEffect(() => {
    const savedFormData = localStorage.getItem(`form_data_${sheet._id}`);
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, [sheet._id]);

  // Function to handle form changes
  function onFormChange(event: React.ChangeEvent<HTMLFormElement>) {
    const newFormData = new FormData(event.currentTarget);
    const newFormDataObject: Record<string, string> = {};

    newFormData.forEach((value, key) => {
      newFormDataObject[key] = value as string;
    });

    // Save form data to local storage
    localStorage.setItem(`form_data_${sheet._id}`, JSON.stringify(newFormDataObject));

    // Update state with the new form data
    setFormData(newFormDataObject);
  }

  // Function to fetch the latest submission data based on email and language
  async function fetchData(sheet: any) {
    const latestSubmission = await getLatestSubmission(sheet?.sid);
    if (latestSubmission) {
      setFormData({
        ...formData,
        name: latestSubmission.username,
        email: latestSubmission.email,
        language: latestSubmission.language,
        s_id: latestSubmission.s_id,
        s_count: latestSubmission.segments.length.toString(),
        ...latestSubmission.segments.reduce((acc, segment, index) => {
          acc[`audio-${index}`] = segment;
          return acc;
        }, {})
      });
      setEmail(latestSubmission.email);
    }
  }

  useEffect(() => {
    fetchData(sheet);
  }, []);

  function submit(e: any) {
    localStorage.removeItem(`form_data_${sheet._id}`);
    location.reload()
  }

  console.log("segments", formData?.s_count)

  const handleEmailBlur = async (e) => {
    console.log("sheetsss", sheet)
    const enteredEmail = e.target.value;
    if (emails === enteredEmail) {
      setFormDataShow(true);
      await fetchData(sheet);
    } else {
      setFormDataShow(false);
      setFormData({});
    }
  }

  return (
    <form action={sendSubmission} className="w-3/5 m-5" onChange={onFormChange} id="submitForm" onSubmitCapture={submit}>
      <input type="text" name="sheet_id" readOnly value={sheet._id} hidden />
      <input type="text" name="s_id" readOnly value={sheet.sid} hidden />
      <input type="text" name="s_count" readOnly value={sheet.segments.length} hidden />
      <Card>
        <CardHeader>
          <CardTitle>Form: {sheet.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Enter your name" value={formData?.name != '' && formDataShow === true ? formData?.name : ''} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="Enter your email" onBlur={(e) => handleEmailBlur(e)} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Input id="language" name="language" placeholder="Enter Language e.g Bengali" value={formData?.language != '' && formDataShow === true ? formData?.language : ''} />
            </div>

            {sheet.segments.map((segment: ISegment, i: number) => {
              return (
                <div className="flex flex-col space-y-1.5 my-4" key={i}>
                  <Label htmlFor={`audio-${i}`}>Audio {i + 1} : {secondsToHMS(segment.start_time)} - {secondsToHMS(segment.end_time)}</Label>

                  <AudioPlayer
                    url={sheet.audio_url}
                    // i == 1 ? segment.start_time - 4 : segment.start_time
                    startTime={ segment.start_time}
                    endTime={segment.end_time}
                  />

                  <Textarea
                    id={`audio-${i}`}
                    name={`audio-${i}`}
                    rows={3}
                    placeholder="Write what you understand from the audio"
                    className="flex-1 p-4"
                  />
                  <Separator />
                </div>
              );
            })}
            <div className="flex flex-col space-y-1.5 my-4">
              <Label htmlFor="full-audio">Full Audio:{sheet?.segments[0].start_time} -{sheet?.segments[1].end_time}</Label>

              <AudioPlayer
                url={sheet.audio_url}
                startTime={sheet?.segments[0].start_time} // Assuming the full audio starts from the beginning
                endTime={sheet?.segments[1].end_time} // Assuming sheet.total_duration holds the total duration of the audio
              />

              {/* <Textarea
                id="full-audio"
                name="full-audio"
                rows={3}
                placeholder="Write what you understand from the audio"
                className="flex-1 p-4"
              /> */}
              <Separator />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">{'Submit'}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will submit this form.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit" form="submitForm">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </form>
  );
};

export default FormSubmitPage;
