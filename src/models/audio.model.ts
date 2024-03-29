import mongoose, { Document, Schema } from 'mongoose';

export interface ISegment {
    start_time: number;
    end_time: number;
}
export interface IAudio {
    _id: mongoose.ObjectId;
    url: string;
    segments: [ISegment]
}

export const SegmentSchema = {
    start_time: { type: Number, required: true }, // HH:MM:SS format
    end_time: { type: Number, required: true }    // HH:MM:SS format
};

const AudioSchema = new Schema({
    url: { type: String, required: true },
    segments: [SegmentSchema] // Array of segment objects
});


const Audios = mongoose.models.Audio || mongoose.model<IAudio>('Audio', AudioSchema);

export default Audios