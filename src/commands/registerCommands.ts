import * as vscode from "vscode";
import { WorkspaceStore } from "../core/workspaceStore";
import { NotesProvider } from "../providers/notesProvider";
import { SystemProvider } from "../providers/systemProvider";
import { WorkPageProvider } from "../providers/workPageProvider";
import { registerSafeCommand } from "./commandUtils";
import {
  copyPath,
  deleteComment,
  editComment,
  initializeWorkspace,
  openNotes,
  openSystemStatus,
  openTrackedFile,
  refreshWorkspace,
  trackCurrentFile,
  updateMetadata
} from "./workspaceCommands";

interface Providers {
  work: WorkPageProvider;
  system: SystemProvider;
  notes: NotesProvider;
}

export function registerCommands(
  context: vscode.ExtensionContext,
  store: WorkspaceStore,
  providers: Providers
): void {
  const views = {
    refreshAll(): void {
      providers.work.refresh();
      providers.system.refresh();
      providers.notes.refresh();
    }
  };

  registerSafeCommand(context, "serverWorkspace.initialize", () => initializeWorkspace(store, views));
  registerSafeCommand(context, "serverWorkspace.refresh", () => refreshWorkspace(store, views));
  registerSafeCommand(context, "serverWorkspace.openNotes", () => openNotes(store));
  registerSafeCommand(context, "serverWorkspace.openSystemStatus", () => openSystemStatus(store));
  registerSafeCommand(context, "serverWorkspace.openFile", (input) => openTrackedFile(store, views, input));
  registerSafeCommand(context, "serverWorkspace.trackCurrentFile", () => trackCurrentFile(store, views));
  registerSafeCommand(context, "serverWorkspace.editComment", (input) => editComment(store, views, input));
  registerSafeCommand(context, "serverWorkspace.deleteComment", (input) => deleteComment(store, views, input));
  registerSafeCommand(context, "serverWorkspace.copyPath", (input) => copyPath(input));
  registerSafeCommand(context, "serverWorkspace.updateMetadata", (input) => updateMetadata(store, views, input));
}
