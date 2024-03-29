import dbConnect from "@/lib/db";
import Audios from "@/models/audio.model";

export async function deleteAudio(form: FormData) {
    const id = form.get('id')?.toString();
    await dbConnect()
    await Audios.deleteOne({_id: id})
}