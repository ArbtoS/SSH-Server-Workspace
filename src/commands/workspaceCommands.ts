import * as path from "path";
import * as vscode from "vscode";
import {
  updateTrackedFileMetadata,
  refreshTrackedFiles,
  setTrackedFileComment,
  setTrackedFileDisplayName
} from "../core/fileMetadata";
import { readSystemInfo } from "../core/systemInfo";
import { createDefaultWorkspaceData } from "../core/types";
import { WorkspaceStore } from "../core/workspaceStore";
import { extractFilePath } from "./commandUtils";

export interface RefreshableViews {
  refreshAll(): void;
}

async function loadRequiredData(store: WorkspaceStore) {
  const data = await store.load();
  if (!data) {
    vscode.window.showWarningMessage("Server Workspace ist noch nicht initialisiert.");
    return undefined;
  }

  return data;
}

export async function initializeWorkspace(store: WorkspaceStore, views: RefreshableViews): Promise<void> {
  await store.initialize();
  views.refreshAll();
  vscode.window.showInformationMessage(`Server Workspace wurde initialisiert: ${store.paths.directory}`);
}

export async function refreshWorkspace(store: WorkspaceStore, views: RefreshableViews): Promise<void> {
  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  data.server = await readSystemInfo();
  await refreshTrackedFiles(data);
  await store.save(data);
  views.refreshAll();
  vscode.window.showInformationMessage("Server Workspace wurde aktualisiert.");
}

export async function recreateWorkspaceData(store: WorkspaceStore, views: RefreshableViews): Promise<void> {
  if (!(await store.isInitialized())) {
    vscode.window.showWarningMessage("Bitte zuerst Server Workspace initialisieren.");
    return;
  }

  const confirmation = await vscode.window.showWarningMessage(
    "workspace-data.json neu erstellen? Arbeitsliste und Rohlog werden geloescht. SYSTEMSTATUS.md und NOTIZEN.md bleiben erhalten.",
    { modal: true },
    "Neu erstellen"
  );

  if (confirmation !== "Neu erstellen") {
    return;
  }

  const data = createDefaultWorkspaceData();
  data.server = await readSystemInfo();
  await store.recreateData(data);
  views.refreshAll();
  vscode.window.showInformationMessage("workspace-data.json wurde neu erstellt.");
}

export async function openNotes(store: WorkspaceStore): Promise<void> {
  if (!(await store.isInitialized())) {
    vscode.window.showWarningMessage("Bitte zuerst Server Workspace initialisieren.");
    return;
  }

  await vscode.window.showTextDocument(store.notesUri(), { preview: false });
}

export async function addNote(store: WorkspaceStore, views: RefreshableViews): Promise<void> {
  if (!(await store.isInitialized())) {
    vscode.window.showWarningMessage("Bitte zuerst Server Workspace initialisieren.");
    return;
  }

  const note = await vscode.window.showInputBox({
    title: "Notiz hinzufuegen",
    prompt: "Wird direkt an NOTIZEN.md angehaengt",
    ignoreFocusOut: true,
    validateInput: (value) => (value.trim() ? undefined : "Notiz ist leer.")
  });

  if (note === undefined) {
    return;
  }

  await store.addNote(note.trim());
  views.refreshAll();
  vscode.window.showInformationMessage("Notiz hinzugefuegt.");
}

export async function openSystemStatus(store: WorkspaceStore): Promise<void> {
  if (!(await store.isInitialized())) {
    vscode.window.showWarningMessage("Bitte zuerst Server Workspace initialisieren.");
    return;
  }

  await vscode.window.showTextDocument(store.systemStatusUri(), { preview: false });
}

export async function openTrackedFile(store: WorkspaceStore, views: RefreshableViews, input?: unknown): Promise<void> {
  const filePath = extractFilePath(input);
  if (!filePath) {
    vscode.window.showWarningMessage("Keine Datei ausgewaehlt.");
    return;
  }

  if (store.isInternalPath(filePath)) {
    await vscode.window.showTextDocument(vscode.Uri.file(filePath), { preview: false });
    return;
  }

  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  const trackedFile = await updateTrackedFileMetadata(data, filePath);
  await store.save(data);
  views.refreshAll();

  if (!trackedFile.exists) {
    vscode.window.showWarningMessage(`Datei existiert nicht mehr: ${trackedFile.path}`);
    return;
  }

  await vscode.window.showTextDocument(vscode.Uri.file(trackedFile.path), { preview: false });
}

export async function trackCurrentFile(store: WorkspaceStore, views: RefreshableViews): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.uri.scheme !== "file") {
    vscode.window.showWarningMessage("Keine lokale Remote-Datei im aktiven Editor.");
    return;
  }

  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  if (store.isInternalPath(editor.document.uri.fsPath)) {
    vscode.window.showWarningMessage("Interne Server-Workspace-Dateien werden nicht in der Arbeitsliste getrackt.");
    return;
  }

  const trackedFile = await updateTrackedFileMetadata(data, editor.document.uri.fsPath);
  await store.save(data);
  views.refreshAll();
  vscode.window.showInformationMessage(`Datei wird getrackt: ${trackedFile.path}`);
}

export async function trackPath(store: WorkspaceStore, views: RefreshableViews): Promise<void> {
  const filePath = await vscode.window.showInputBox({
    title: "Pfad tracken",
    prompt: "Absoluter Pfad auf dem verbundenen Remote-Host",
    placeHolder: "/etc/systemd/system/hostapd-healthcheck.timer",
    ignoreFocusOut: true,
    validateInput: (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return "Pfad ist erforderlich.";
      }

      return path.isAbsolute(trimmed) ? undefined : "Bitte einen absoluten Pfad angeben.";
    }
  });

  if (filePath === undefined) {
    return;
  }

  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  if (store.isInternalPath(filePath.trim())) {
    vscode.window.showWarningMessage("Interne Server-Workspace-Dateien werden nicht in der Arbeitsliste getrackt.");
    return;
  }

  const trackedFile = await updateTrackedFileMetadata(data, filePath.trim());
  await store.save(data);
  views.refreshAll();

  if (!trackedFile.exists) {
    vscode.window.showWarningMessage(`Pfad wurde aufgenommen, Datei existiert aber nicht: ${trackedFile.path}`);
    return;
  }

  vscode.window.showInformationMessage(`Pfad wird getrackt: ${trackedFile.path}`);
}

export async function editComment(store: WorkspaceStore, views: RefreshableViews, input?: unknown): Promise<void> {
  const filePath = extractFilePath(input);
  if (!filePath) {
    vscode.window.showWarningMessage("Keine Datei ausgewaehlt.");
    return;
  }

  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  const trackedFile = data.trackedFiles.find((file) => path.resolve(file.path) === path.resolve(filePath));
  if (!trackedFile) {
    vscode.window.showWarningMessage("Datei ist noch nicht getrackt.");
    return;
  }

  const comment = await vscode.window.showInputBox({
    title: "Kommentar bearbeiten",
    prompt: trackedFile.path,
    value: trackedFile.comment
  });

  if (comment === undefined) {
    return;
  }

  setTrackedFileComment(data, trackedFile.path, comment.trim());
  await store.save(data);
  views.refreshAll();
}

export async function editDisplayName(store: WorkspaceStore, views: RefreshableViews, input?: unknown): Promise<void> {
  const filePath = extractFilePath(input);
  if (!filePath) {
    vscode.window.showWarningMessage("Keine Datei ausgewaehlt.");
    return;
  }

  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  const trackedFile = data.trackedFiles.find((file) => path.resolve(file.path) === path.resolve(filePath));
  if (!trackedFile) {
    vscode.window.showWarningMessage("Datei ist noch nicht getrackt.");
    return;
  }

  const displayName = await vscode.window.showInputBox({
    title: "Klarname bearbeiten",
    prompt: trackedFile.path,
    value: trackedFile.displayName || trackedFile.name,
    ignoreFocusOut: true
  });

  if (displayName === undefined) {
    return;
  }

  setTrackedFileDisplayName(data, trackedFile.path, displayName);
  await store.save(data);
  views.refreshAll();
}

export async function clearDisplayName(store: WorkspaceStore, views: RefreshableViews, input?: unknown): Promise<void> {
  const filePath = extractFilePath(input);
  if (!filePath) {
    vscode.window.showWarningMessage("Keine Datei ausgewaehlt.");
    return;
  }

  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  if (!setTrackedFileDisplayName(data, filePath, "")) {
    vscode.window.showWarningMessage("Datei ist noch nicht getrackt.");
    return;
  }

  await store.save(data);
  views.refreshAll();
}

export async function deleteComment(store: WorkspaceStore, views: RefreshableViews, input?: unknown): Promise<void> {
  const filePath = extractFilePath(input);
  if (!filePath) {
    vscode.window.showWarningMessage("Keine Datei ausgewaehlt.");
    return;
  }

  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  if (!setTrackedFileComment(data, filePath, "")) {
    vscode.window.showWarningMessage("Datei ist noch nicht getrackt.");
    return;
  }

  await store.save(data);
  views.refreshAll();
}

export async function copyPath(input?: unknown): Promise<void> {
  const filePath = extractFilePath(input);
  if (!filePath) {
    vscode.window.showWarningMessage("Kein Pfad ausgewaehlt.");
    return;
  }

  await vscode.env.clipboard.writeText(filePath);
  vscode.window.showInformationMessage("Pfad kopiert.");
}

export async function updateMetadata(store: WorkspaceStore, views: RefreshableViews, input?: unknown): Promise<void> {
  const filePath = extractFilePath(input);
  if (!filePath) {
    vscode.window.showWarningMessage("Keine Datei ausgewaehlt.");
    return;
  }

  const data = await loadRequiredData(store);
  if (!data) {
    return;
  }

  await updateTrackedFileMetadata(data, filePath);
  await store.save(data);
  views.refreshAll();
  vscode.window.showInformationMessage("Metadaten aktualisiert.");
}
