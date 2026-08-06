import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES } from "../constants/uploads";
import {
  generateUniqueStorageFileName,
  validateImageFile,
} from "./upload-validation";

describe("validateImageFile", () => {
  it("accepts JPG by MIME type", () => {
    const result = validateImageFile({
      name: "photo.jpg",
      type: "image/jpeg",
      size: 1024,
    });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.mimeType).toBe("image/jpeg");
  });

  it("accepts PNG by extension when MIME is empty", () => {
    const result = validateImageFile({
      name: "photo.png",
      type: "",
      size: 1024,
    });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.mimeType).toBe("image/png");
  });

  it("accepts WEBP", () => {
    const result = validateImageFile({
      name: "photo.webp",
      type: "image/webp",
      size: 1024,
    });
    expect(result.valid).toBe(true);
  });

  it("accepts HEIC", () => {
    const result = validateImageFile({
      name: "photo.heic",
      type: "image/heic",
      size: 1024,
    });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.mimeType).toBe("image/heic");
  });

  it("rejects files over 50 MB", () => {
    const result = validateImageFile({
      name: "huge.jpg",
      type: "image/jpeg",
      size: MAX_UPLOAD_BYTES + 1,
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("50 MB");
  });

  it("rejects empty files", () => {
    const result = validateImageFile({
      name: "empty.jpg",
      type: "image/jpeg",
      size: 0,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects unsupported types", () => {
    const result = validateImageFile({
      name: "doc.pdf",
      type: "application/pdf",
      size: 1024,
    });
    expect(result.valid).toBe(false);
  });
});

describe("generateUniqueStorageFileName", () => {
  it("preserves extension and adds unique suffix", () => {
    const name = generateUniqueStorageFileName("holiday photo.jpg");
    expect(name).toMatch(/holiday photo-.+\.jpg$/);
  });
});
