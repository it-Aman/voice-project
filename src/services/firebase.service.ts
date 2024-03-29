import * as admin from 'firebase-admin';
import * as mime from 'mime-types';
import * as fs from 'fs';
import firebaseConfig from '../../config/firebase';
import { GaxiosResponse } from 'gaxios';
import internal from 'stream';

export class StorageService {
  
  private readonly bucket: any;

  constructor(serviceAccount: admin.ServiceAccount) {

    if(serviceAccount && (typeof serviceAccount !="object" || !Object.keys('serviceAccount').length)) {
      throw new Error('Invalid Service Account');
    }

    if (admin.apps.length === 0)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'gs://value-d05e0.appspot.com',
    });
    // Get a reference to the default Firebase Storage bucket
    this.bucket = admin.storage().bucket();
  }

  async uploadPublic(folder: string, filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = filePath.split('/').pop(); // Extract file name from the path
  
    const uniqueFilename = `${folder}/${Date.now()}_${fileName}`;
    const fileUpload = this.bucket.file(uniqueFilename);
  
    const contentType = mime.lookup(filePath) || 'application/octet-stream'; // Default to octet-stream if content type is not detected
  
    const uploadStream = fileUpload.createWriteStream({
      metadata: {
        contentType: contentType,
      },
    });
  
    return new Promise<string>((resolve, reject) => {
      uploadStream.on('error', (error: Error) => {
        reject(error);
      });
  
      uploadStream.on('finish', async () => {
        // Set the public URL of the uploaded file
        await fileUpload.makePublic();
        const publicUrl = await fileUpload.getSignedUrl({
          action: 'read',
          expires: '03-09-2500', // Set an appropriate expiration date
        });
        resolve(publicUrl[0]);
      });
  
      uploadStream.end(fileBuffer);
    });
  }

  async uploadStream(response: GaxiosResponse<internal.Readable>, uid: string) {
    const uniqueFilename = `audios/${uid}.mp3`;

    const fileUpload = this.bucket.file(uniqueFilename);

    await new Promise((resolve, reject) => {
      response.data
        .pipe(fileUpload.createWriteStream())
        .on('error', reject)
        .on('finish', resolve);
    });

    await fileUpload.makePublic();

    const publicUrl = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-09-2500', // Set an appropriate expiration date
    });

    return publicUrl[0];
  }
}

const storage = new StorageService({
  clientEmail: firebaseConfig.client_email,
  privateKey: firebaseConfig.private_key,
  projectId: firebaseConfig.project_id
})

export default storage