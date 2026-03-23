import { existsSync } from "node:fs";
import path from "node:path";

export function resolveJsonDataFilePath(relativeDataFilePath: string) {
  const cwdPath = path.join(process.cwd(), relativeDataFilePath);
  if (existsSync(cwdPath)) {
    return cwdPath;
  }

  const workspacePath = path.join(process.cwd(), "apps", "web", relativeDataFilePath);
  if (existsSync(workspacePath)) {
    return workspacePath;
  }

  return workspacePath;
}
