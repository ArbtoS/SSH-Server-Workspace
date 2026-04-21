import * as vscode from "vscode";
import { toLocalIsoString } from "../core/dateUtils";
import { ServerStorage } from "../core/serverStorage";
import { SavedServer } from "../core/types";
import { WorkspaceStore } from "../core/workspaceStore";
import { extractSavedServer } from "./commandUtils";
import { RefreshableViews } from "./workspaceCommands";

async function promptServerField(title: string, value = "", required = false): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    title,
    value,
    ignoreFocusOut: true,
    validateInput: required ? (input) => (input.trim() ? undefined : "Pflichtfeld") : undefined
  });

  return result?.trim();
}

async function defaultServerFromWorkspace(store: WorkspaceStore): Promise<Partial<SavedServer>> {
  const data = await store.load();
  if (!data) {
    return {};
  }

  return {
    displayName: data.server.hostname || data.server.mainIp,
    host: data.server.mainIp || data.server.hostname
  };
}

export async function saveCurrentServer(
  storage: ServerStorage,
  store: WorkspaceStore,
  views: RefreshableViews,
  input?: unknown
): Promise<void> {
  const existing = extractSavedServer(input);
  const defaults = existing ?? (await defaultServerFromWorkspace(store));
  const displayName = await promptServerField("Anzeigename", defaults.displayName ?? defaults.host ?? "", true);
  if (!displayName) {
    return;
  }

  const host = await promptServerField("Host/IP", defaults.host ?? "", true);
  if (!host) {
    return;
  }

  const user = await promptServerField("User optional", defaults.user ?? "");
  if (user === undefined) {
    return;
  }

  const portRaw = await promptServerField("Port optional", defaults.port ? String(defaults.port) : "");
  if (portRaw === undefined) {
    return;
  }

  const port = portRaw ? Number(portRaw) : undefined;
  if (port !== undefined && (!Number.isInteger(port) || port <= 0 || port > 65535)) {
    vscode.window.showWarningMessage("Port muss eine Zahl zwischen 1 und 65535 sein.");
    return;
  }

  await storage.save(
    {
      displayName,
      host,
      user: user || undefined,
      port,
      lastUsedAt: toLocalIsoString()
    },
    existing
  );
  views.refreshAll();
  vscode.window.showInformationMessage("Server gespeichert.");
}

export async function copyHost(input?: unknown): Promise<void> {
  const server = extractSavedServer(input);
  if (!server?.host) {
    vscode.window.showWarningMessage("Kein Server ausgewaehlt.");
    return;
  }

  await vscode.env.clipboard.writeText(server.host);
  vscode.window.showInformationMessage("Host/IP kopiert.");
}

export async function renameServer(storage: ServerStorage, views: RefreshableViews, input?: unknown): Promise<void> {
  const server = extractSavedServer(input);
  if (!server) {
    vscode.window.showWarningMessage("Kein Server ausgewaehlt.");
    return;
  }

  const displayName = await promptServerField("Anzeigename bearbeiten", server.displayName, true);
  if (!displayName) {
    return;
  }

  await storage.rename(server, displayName);
  views.refreshAll();
}
