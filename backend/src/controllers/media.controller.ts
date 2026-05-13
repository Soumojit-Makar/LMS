import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { cloudinary } from '../config/cloudinary';
import { Lesson } from '../models/Lesson.model';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

const FOLDER_MAP: Record<string, string> = {
  video: 'lms/lessons/videos',
  pdf: 'lms/lessons/pdfs',
  image: 'lms/thumbnails',
  avatar: 'lms/avatars',
};

const RESOURCE_TYPE_MAP: Record<string, 'video' | 'raw' | 'image'> = {
  video: 'video',
  pdf: 'raw',
  image: 'image',
  avatar: 'image',
};

export const signUpload = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const { uploadType } = req.body as { uploadType: string };
    const folder = FOLDER_MAP[uploadType];
    const resourceType = RESOURCE_TYPE_MAP[uploadType];

    if (!folder || !resourceType) {
      throw new ApiError(400, `Invalid uploadType. Allowed: ${Object.keys(FOLDER_MAP).join(', ')}`);
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        folder,
        resourceType,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const completeUpload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { publicId, url, resourceType, lessonId, duration, filename } = req.body;

    // Validate that the publicId belongs to our lms/ folder
    if (!publicId.startsWith('lms/')) {
      throw new ApiError(400, 'Invalid asset: must be uploaded to lms/ folder');
    }

    if (lessonId) {
      let updateField: Record<string, any> = {};
      if (resourceType === 'video') {
        updateField = { 'content.video': { publicId, url, duration: duration || 0, format: 'mp4' } };
      } else if (resourceType === 'raw') {
        updateField = { 'content.pdf': { publicId, url, filename: filename || 'document.pdf' } };
      }

      const lesson = await Lesson.findByIdAndUpdate(lessonId, updateField, { new: true });
      if (!lesson) throw new ApiError(404, 'Lesson not found');
      return res.json({ success: true, data: lesson });
    }

    res.json({ success: true, data: { publicId, url } });
  } catch (err) {
    next(err);
  }
};

export const deleteMedia = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { publicId, resourceType } = req.body;
    if (!publicId.startsWith('lms/')) throw new ApiError(400, 'Invalid asset');

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image',
    });

    res.json({ success: true, message: 'Asset deleted from Cloudinary' });
  } catch (err) {
    next(err);
  }
};
