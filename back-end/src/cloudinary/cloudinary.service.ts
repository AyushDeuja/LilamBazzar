import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(image: string, folder: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder,
      });
      return result.secure_url; // Return the uploaded image URL
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }
}
