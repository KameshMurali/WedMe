const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageBytes = 8 * 1024 * 1024;
const maxGuestVideoBytes = 40 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (!imageMimeTypes.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }

  if (file.size > maxImageBytes) {
    throw new Error("Images must be 8MB or smaller.");
  }
}

export function validateGuestMedia(file: File) {
  const allowedTypes = [...imageMimeTypes, "video/mp4", "video/quicktime"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Please upload an image or a short MP4/MOV video.");
  }

  if (file.type.startsWith("image/")) {
    validateImageFile(file);
    return;
  }

  if (file.size > maxGuestVideoBytes) {
    throw new Error("Guest videos must be 40MB or smaller.");
  }
}
