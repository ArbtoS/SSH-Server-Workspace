import * as path from "path";
import * as vscode from "vscode";
import { updateTrackedFileMetadata, refreshTrackedFiles, setTrackedFileComment } from "../core/fileMetadata";
import { readSystemInfo } from "../core/systemInfo";
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

export async function openNotes(store: WorkspaceStore): Promise<void> {
  if (!(await store.isInitialized())) {
    vscode.window.showWarningMessage("Bitte zuerst Server Workspace initialisieren.");
    return;
  }

  await vscode.window.showTextDocument(store.notesUri(), { preview: false });
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

  const trackedFile = await updateTrackedFileMetadata(data, editor.document.uri.fsPath);
  await store.save(data);
  views.refreshAll();
  vscode.window.showInformationMessage(`Datei wird getrackt: ${trackedFile.path}`);
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
