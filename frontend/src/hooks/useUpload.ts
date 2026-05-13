import { useState } from 'react';
import { mediaService } from '../services/media.service';

export interface UploadResult { publicId: string; url: string; duration?: number; filename?: string }

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, uploadType: 'video' | 'pdf' | 'image' | 'avatar'): Promise<UploadResult> => {
    setUploading(true); setProgress(0);
    try {
      const sigData = await mediaService.signUpload(uploadType, file.name);
      const { data } = sigData;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', data.apiKey);
      formData.append('timestamp', String(data.timestamp));
      formData.append('signature', data.signature);
      formData.append('folder', data.folder);

      const cloudUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/${data.resourceType}/upload`;
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const r = JSON.parse(xhr.responseText);
            resolve({ publicId: r.public_id, url: r.secure_url, duration: r.duration, filename: file.name });
          } else { reject(new Error('Upload failed')); }
        };
        xhr.onerror = () => reject(new Error('Upload network error'));
        xhr.open('POST', cloudUrl);
        xhr.send(formData);
      });
    } finally { setUploading(false); }
  };

  return { upload, progress, uploading };
}