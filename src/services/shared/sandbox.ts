import { Sandbox } from "@vercel/sandbox";

export async function runJavascript({ code }: { code: string }): Promise<void> {
  if (process.env.VERCEL_OIDC_TOKEN == null) {
    throw new Error("VERCEL_OIDC_TOKEN environment variable is not set");
  }

  const sandbox = await Sandbox.create({
    runtime: "node24",
    timeout: 60_000,
  });

  try {
    await sandbox.writeFiles([
      {
        path: "main.js",
        content: Buffer.from(code),
      },
    ]);

    await sandbox.runCommand("node", ["main.js"]);
  } finally {
    await sandbox.stop();
  }
}
