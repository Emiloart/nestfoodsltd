import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const base = process.env.FORMAT_BASE_REF || "HEAD~1";
const diffArgs = process.argv.includes("--staged")
  ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
  : ["diff", "--name-only", "--diff-filter=ACMR", "-z", base, "HEAD"];
const result = spawnSync("git", diffArgs, { encoding: "utf8" });
if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}
const files = result.stdout
  .split("\0")
  .filter(
    (file) =>
      file &&
      existsSync(file) &&
      /\.(?:[cm]?[jt]sx?|json|css|md|ya?ml)$/.test(file) &&
      !file.startsWith("docs/audits/") &&
      !file.startsWith("docs/upgrades/"),
  );
if (files.length === 0) process.exit(0);
const check = spawnSync("pnpm", ["exec", "prettier", "--check", ...files], { stdio: "inherit" });
process.exit(check.status ?? 1);
