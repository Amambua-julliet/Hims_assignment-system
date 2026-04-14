/**
 * Cloudinary Upload Utility
 * Handles file uploads to Cloudinary using the unsigned upload preset.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  original_filename: string;
  format: string;
  resource_type: string;
  created_at: string;
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryResponse> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing. Please check your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
