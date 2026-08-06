import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_BYTES_LABEL,
} from "../constants/uploads";

export type ImageFileLike = {
  name: string;
  type: string;
  size: number;
};

export type UploadValidationResult =
  | { valid: true; mimeType: string }
  | { valid: false; error: string };

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

function normalizeMimeType(mimeType: string, fileName: string): string | null {
  const normalized = mimeType.toLowerCase().split(";")[0]?.trim() ?? "";

  if (
    ALLOWED_IMAGE_MIME_TYPES.includes(
      normalized as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return normalized;
  }

  const ext = extensionOf(fileName);
  const extToMime: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".heic": "image/heic",
    ".heif": "image/heif",
  };

  return extToMime[ext] ?? null;
}

export function validateImageFile(file: ImageFileLike): UploadValidationResult {
  if (file.size <= 0) {
    return { valid: false, error: "File is empty." };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: `File exceeds the ${MAX_UPLOAD_BYTES_LABEL} limit.`,
    };
  }

  const ext = extensionOf(file.name);
  if (ext && !ALLOWED_IMAGE_EXTENSIONS.includes(ext as typeof ALLOWED_IMAGE_EXTENSIONS[number])) {
    return {
      valid: false,
      error: "Unsupported file type. Use JPG, PNG, WEBP, or HEIC.",
    };
  }

  const mimeType = normalizeMimeType(file.type, file.name);
  if (!mimeType) {
    return {
      valid: false,
      error: "Unsupported file type. Use JPG, PNG, WEBP, or HEIC.",
    };
  }

  return { valid: true, mimeType };
}

export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? "upload";
  const sanitized = base
    .replace(/[^\w.\-()+ ]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return sanitized.length > 0 ? sanitized : "upload";
}

export function generateUniqueStorageFileName(originalName: string): string {
  const safe = sanitizeFileName(originalName);
  const ext = extensionOf(safe);
  const stem = ext ? safe.slice(0, -ext.length) : safe;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${stem}-${id}${ext || ".jpg"}`;
}
