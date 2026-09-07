import { removeBackground } from "@imgly/background-removal";

export async function removeImageBackground(
  file: File
): Promise<Blob> {
  const result = await removeBackground(file);

  return result;
}