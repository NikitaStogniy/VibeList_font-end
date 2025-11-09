/**
 * Image Upload Utility
 *
 * Handles image uploading to the backend server.
 * Supports multipart/form-data uploads with progress tracking.
 */

import { API_CONFIG } from '@/constants/config';

export interface ImageUploadOptions {
  uri: string;
  fileName?: string;
  type?: string;
  onProgress?: (progress: number) => void;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image to the server
 * @param options - Upload options including URI and callbacks
 * @param token - Authentication token
 * @returns Promise with upload result containing the image URL
 */
export async function uploadImage(
  options: ImageUploadOptions,
  token: string
): Promise<ImageUploadResult> {
  const { uri, fileName, type = 'image/jpeg', onProgress } = options;

  try {
    // Create FormData
    const formData = new FormData();

    // Extract filename from URI if not provided
    const finalFileName = fileName || uri.split('/').pop() || 'upload.jpg';

    // Append the image file
    formData.append('image', {
      uri,
      type,
      name: finalFileName,
    } as unknown as Blob);

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);

            // Handle backend response wrapper
            const data = response.data || response;

            if (data.url) {
              resolve({
                success: true,
                url: data.url,
              });
            } else {
              reject({
                success: false,
                error: 'No URL returned from server',
              });
            }
          } catch (error) {
            reject({
              success: false,
              error: 'Failed to parse server response',
            });
          }
        } else {
          reject({
            success: false,
            error: `Upload failed with status ${xhr.status}`,
          });
        }
      });

      // Handle network errors
      xhr.addEventListener('error', () => {
        reject({
          success: false,
          error: 'Network error during upload',
        });
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        reject({
          success: false,
          error: 'Upload timeout',
        });
      });

      // Configure and send request
      xhr.open('POST', `${API_CONFIG.baseUrl}/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.timeout = 60000; // 60 second timeout
      xhr.send(formData as unknown as Document);
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Uploads multiple images concurrently
 * @param images - Array of image URIs
 * @param token - Authentication token
 * @param onProgress - Progress callback for overall progress
 * @returns Promise with array of upload results
 */
export async function uploadMultipleImages(
  images: string[],
  token: string,
  onProgress?: (progress: number) => void
): Promise<ImageUploadResult[]> {
  let completedCount = 0;

  const uploadPromises = images.map((uri) =>
    uploadImage(
      {
        uri,
        onProgress: () => {
          // Track individual progress
          if (onProgress) {
            completedCount++;
            const overallProgress = (completedCount / images.length) * 100;
            onProgress(overallProgress);
          }
        },
      },
      token
    )
  );

  return Promise.all(uploadPromises);
}
