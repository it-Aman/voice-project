import mongoose, { Document, Schema } from 'mongoose';

export type STATUS = "pending" | "syncing" | "synced" | "error";
export interface ISheet extends Document {
  name: string;
  sid: string;
  status: STATUS;
  last_synced: Date;
  audio_url: string;
  segments: [ISegment]
}
export interface ISegment {
  start_time: number;
  end_time: number;
}

export const SegmentSchema = {
  start_time: { type: Number, required: true }, // HH:MM:SS format
  end_time: { type: Number, required: true }    // HH:MM:SS format
};

const SheetSchema: Schema = new Schema({
  name: { type: String, required: true},
  sid: { type: String, required: true },
  status: { type: String, required: true, default: 'pending' },
  last_synced: { type: Date, default: new Date() },
  audio_url: { type: String },
  segments: [SegmentSchema]
});

const Sheets = mongoose.models.Sheet || mongoose.model<ISheet>('Sheet', SheetSchema);

export default Sheets