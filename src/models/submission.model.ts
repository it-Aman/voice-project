import mongoose, { Document, Schema } from "mongoose";
import { ISegment, SegmentSchema } from "./audio.model";

export interface ISubmission {
  username: string;
  email: string;
  language: string;
  s_id: string;
  segments: string[];
}

const SubmissionSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  language: { type: String, required: true },
  s_id: { type: String, required: true },
  segments: { type: Array<String>, required: true },
});

const Submissions =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submissions;
