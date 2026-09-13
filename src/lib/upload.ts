export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
  "video/x-matroska",
]);

export const ALLOWED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".avi",
  ".mkv",
  ".m4v",
]);

export const VIDEO_ACCEPT =
  "video/*,.mp4,.webm,.mov,.avi,.mkv,.m4v";

function getFileExtension(filename: string): string {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

function inferVideoContentType(filename: string): string {
  const extension = getFileExtension(filename);
  const map: Record<string, string> = {
    ".mp4": "video/mp4",
    ".m4v": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
  };
  return map[extension] ?? "video/mp4";
}

export function isAllowedVideoFile(file: File): boolean {
  if (ALLOWED_VIDEO_TYPES.has(file.type)) return true;
  return ALLOWED_VIDEO_EXTENSIONS.has(getFileExtension(file.name));
}

export type ParsedUpload = {
  contentType: string;
  data: Buffer;
  filename: string;
};

export async function parseUploadFile(
  file: File,
  options: {
    maxSize: number;
    allowedTypes: Set<string>;
    label: string;
  }
): Promise<ParsedUpload> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error(`${options.label}が選択されていません`);
  }

  if (!options.allowedTypes.has(file.type)) {
    const isVideoLabel = options.label.includes("動画");
    if (!(isVideoLabel && isAllowedVideoFile(file))) {
      throw new Error(`${options.label}の形式が不正です（${file.type || file.name}）`);
    }
  }

  if (file.size > options.maxSize) {
    const maxMb = Math.round(options.maxSize / (1024 * 1024));
    throw new Error(`${options.label}は${maxMb}MB以下にしてください`);
  }

  const data = Buffer.from(await file.arrayBuffer());
  const contentType =
    file.type ||
    (options.label.includes("動画")
      ? inferVideoContentType(file.name)
      : file.type);

  return {
    contentType,
    data,
    filename: file.name,
  };
}

export function isFileEntry(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}
