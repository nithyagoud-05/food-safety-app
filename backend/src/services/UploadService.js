import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/errors.js";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const maxFiles = 3;
const maxFileSize = 5 * 1024 * 1024;

function ensureCloudinaryConfig() {
  const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
  } = process.env;

  if (
    !CLOUDINARY_CLOUD_NAME ||
    !CLOUDINARY_API_KEY ||
    !CLOUDINARY_API_SECRET
  ) {
    throw new ApiError(500, "Cloudinary is not configured");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
}

export function validateEvidenceFiles(files = []) {
  if (files.length > maxFiles) {
    throw new ApiError(400, "Upload a maximum of 3 images");
  }

  for (const file of files) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new ApiError(
        400,
        "Unsupported file type. Upload JPG, JPEG, PNG, or WEBP images"
      );
    }

    if (file.size > maxFileSize) {
      throw new ApiError(
        400,
        "Each evidence image must be 5 MB or smaller"
      );
    }
  }
}

export async function uploadEvidenceImages(files = []) {
  validateEvidenceFiles(files);

  if (!files.length) {
    return [];
  }

  ensureCloudinaryConfig();

  try {
    const uploads = await Promise.all(
      files.map((file) => {
        const base64 = file.buffer.toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64}`;

        return cloudinary.uploader.upload(dataUri, {
          folder: "annapurna/report-evidence",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"]
        });
      })
    );

    return uploads.map((upload) => upload.secure_url);

  } catch (error) {
    console.error("========== CLOUDINARY UPLOAD ERROR ==========");
    console.error(error);

    if (error.response) {
      console.error("Response:", error.response);
    }

    if (error.http_code) {
      console.error("HTTP Code:", error.http_code);
    }

    if (error.message) {
      console.error("Message:", error.message);
    }

    console.error("=============================================");

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      502,
      error?.message || "Evidence upload failed"
    );
  }
}