// Shared by the setup and dev scripts: where the repo, the MDK CLI and the dev
// stack are, and how to run a command.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEV = join(ROOT, "dev");
// MDK's SATEC meter worker, which isn't on npm: the files it needs from the
// MDK release the CLI is at (scripts/setup.mjs fetches them).
export const SATEC = join(DEV, ".mdk-satec");

export const mdkBin = () => join(ROOT, "node_modules", ".bin", "mdk");

/** Runs a command, inheriting stdio; resolves on exit 0. */
export function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolvePromise()
        : reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`)),
    );
  });
}

/**
 * Runs long-lived commands together until one exits or Ctrl+C; then stops the
 * rest. Each entry is [cmd, args, opts].
 */
export function runTogether(commands) {
  const children = commands.map(([cmd, args, opts = {}]) =>
    spawn(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts }),
  );
  let stopping = false;
  const stop = (code) => {
    if (stopping) return;
    stopping = true;
    for (const c of children) if (c.exitCode === null) c.kill("SIGINT");
    setTimeout(() => process.exit(code), 5000).unref();
  };
  for (const c of children) c.on("exit", (code) => stop(code ?? 0));
  process.on("SIGINT", () => stop(0));
  process.on("SIGTERM", () => stop(0));
}

export const step = (msg) => console.log(`\n▸ ${msg}`);
