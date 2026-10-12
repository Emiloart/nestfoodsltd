export const MAX_CAREER_FILES = 4;
export const MAX_CAREER_FILE_BYTES = 3 * 1024 * 1024;
export const MAX_CAREER_TOTAL_BYTES = 4 * 1024 * 1024;

const fileTypes: Record<string, string[]> = {
  pdf: ["application/pdf", "application/x-pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
};

export function validateCareerFiles(files: Pick<File, "name" | "type" | "size">[]) {
  if (!files.length) return "Attach your CV before submitting your application.";
  if (files.length > MAX_CAREER_FILES)
    return "Select no more than 4 files. Remove extra files before submitting.";
  let total = 0;
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const types = fileTypes[extension];
    if (
      !Object.hasOwn(fileTypes, extension) ||
      !types ||
      (file.type &&
        file.type !== "application/octet-stream" &&
        !types.includes(file.type.toLowerCase()))
    )
      return `${file.name}: use PDF, DOC, DOCX, JPG or PNG.`;
    if (!file.size) return `${file.name} is empty. Choose a file containing your document.`;
    if (file.size > MAX_CAREER_FILE_BYTES) return `${file.name} exceeds the 3 MB file limit.`;
    total += file.size;
  }
  if (total > MAX_CAREER_TOTAL_BYTES)
    return "Selected files exceed 4 MB in total. Compress or remove a file.";
  return null;
}
