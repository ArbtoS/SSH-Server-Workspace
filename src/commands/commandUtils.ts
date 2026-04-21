import * as vscode from "vscode";
import { SavedServer } from "../core/types";
import { SavedServerItem } from "../providers/serverProvider";
import { LogEntryItem, TrackedFileItem } from "../providers/workPageProvider";

export function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function registerSafeCommand(
  context: vscode.ExtensionContext,
  command: string,
  callback: (...args: unknown[]) => Promise<void> | void
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(command, async (...args: unknown[]) => {
      try {
        await callback(...args);
      } catch (error) {
        vscode.window.showErrorMessage(`Server Workspace: ${messageFromError(error)}`);
      }
    })
  );
}

export function extractFilePath(input: unknown): string | undefined {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof TrackedFileItem) {
    return input.file.path;
  }

  if (input instanceof LogEntryItem) {
    return input.entry.path;
  }

  if (typeof input === "object" && input && "path" in input && typeof input.path === "string") {
    return input.path;
  }

  if (typeof input === "object" && input && "file" in input) {
    const file = input.file as { path?: unknown };
    return typeof file.path === "string" ? file.path : undefined;
  }

  if (typeof input === "object" && input && "entry" in input) {
    const entry = input.entry as { path?: unknown };
    return typeof entry.path === "string" ? entry.path : undefined;
  }

  return undefined;
}

export function extractSavedServer(input: unknown): SavedServer | undefined {
  if (input instanceof SavedServerItem) {
    return input.server;
  }

  if (typeof input === "object" && input && "server" in input) {
    return input.server as SavedServer;
  }

  if (typeof input === "object" && input && "host" in input) {
    return input as SavedServer;
  }

  return undefined;
}
