import { cloudinary } from '../config/cloudinary';

export interface CloudinaryAsset {
  publicId:     string;
  url:          string;
  resourceType: 'image' | 'video' | 'raw';
  duration?:    number;
  format?:      string;
  bytes?:       number;
}

const FOLDER_MAP: Record<string, string> = {
  video:  'lms/lessons/videos',
  pdf:    'lms/lessons/pdfs',
  image:  'lms/thumbnails',
  avatar: 'lms/avatars',
};

const RESOURCE_TYPE_MAP: Record<string, 'image' | 'video' | 'raw'> = {
  video:  'video',
  pdf:    'raw',
  image:  'image',
  avatar: 'image',
};

export function buildSignature(uploadType: string): {
  signature: string;
  timestamp: number;
  folder: string;
  resourceType: string;
  apiKey: string;
  cloudName: string;
} {
  const folder = FOLDER_MAP[uploadType];
  const resourceType = RESOURCE_TYPE_MAP[uploadType];
  if (!folder || !resourceType) throw new Error(`Invalid uploadType: ${uploadType}`);

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    folder,
    resourceType,
    apiKey:    process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}

export async function deleteAsset(publicId: string, resourceType: 'image' | 'video' | 'raw') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export function signedUrl(
  publicId: string,
  resourceType: 'video' | 'raw' | 'image' = 'video',
  ttlSeconds = 600
): string {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type:          'authenticated',
    sign_url:      true,
    expires_at:    Math.round(Date.now() / 1000) + ttlSeconds,
    format:        resourceType === 'video' ? 'mp4' : undefined,
  });
}
