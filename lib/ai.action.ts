import puter from "@heyputer/puter.js";

import { APARTIX_RENDER_PROMPT } from "./contants";

// Fetch an image from a URL and return its Data URL (Base64)
export async function fetchAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`,
    );
  }
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsDataURL(blob);
  });
}

export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
  const dataUrl = sourceImage.startsWith("data:")
    ? sourceImage
    : await fetchAsDataUrl(sourceImage);

  // Correctly extract base64 data and mime type from Data URL
  const [header, base64Data] = dataUrl.split(",");
  const mimeType = header.split(";")[0].split(":")[1];

  if (!mimeType || !base64Data)
    throw new Error("Invalid source image payload!");

  const response = await puter.ai.txt2img(APARTIX_RENDER_PROMPT, {
    provider: "gemini",
    model: "gemini-2.5-flash-image-preview",
    input_image: base64Data,
    input_image_mime_type: mimeType,
    ratio: { w: 1024, h: 1024 },
  });

  const rawImageUrl = (response as HTMLImageElement).src ?? null;
  if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

  const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl
    : await fetchAsDataUrl(rawImageUrl);

  return { renderedImage, renderedPath: undefined };
};
