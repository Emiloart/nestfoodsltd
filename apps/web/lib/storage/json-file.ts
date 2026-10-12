import { existsSync } from "node:fs";
import path from "node:path";

export function resolveJsonDataFilePath(relativeDataFilePath: string) {
  const fileName = path.basename(relativeDataFilePath);
  const configuredDirectory = process.env.NESTFOODS_DATA_DIR?.trim();
  if (configuredDirectory) {
    return path.join(path.resolve(configuredDirectory), fileName);
  }
  const cwdPath = path.join(process.cwd(), "data", fileName);
  if (existsSync(cwdPath)) {
    return cwdPath;
  }

  const workspacePath = path.join(process.cwd(), "apps", "web", "data", fileName);
  if (existsSync(workspacePath)) {
    return workspacePath;
  }

  return existsSync(path.join(process.cwd(), "apps", "web", "package.json"))
    ? workspacePath
    : cwdPath;
}
