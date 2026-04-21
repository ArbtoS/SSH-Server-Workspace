import * as vscode from "vscode";
import { WorkspaceStore } from "../core/workspaceStore";
import { ActionsProvider } from "../providers/actionsProvider";
import { NotesProvider } from "../providers/notesProvider";
import { SystemProvider } from "../providers/systemProvider";
import { WorkPageProvider } from "../providers/workPageProvider";
import { registerSafeCommand } from "./commandUtils";
import {
  addNote,
  clearDisplayName,
  copyPath,
  deleteComment,
  editComment,
  editDisplayName,
  initializeWorkspace,
  openNotes,
  openSystemStatus,
  openTrackedFile,
  recreateWorkspaceData,
  refreshWorkspace,
  trackCurrentFile,
  trackPath,
  updateMetadata
} from "./workspaceCommands";

interface Providers {
  actions: ActionsProvider;
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
      providers.actions.refresh();
      providers.work.refresh();
      providers.system.refresh();
      providers.notes.refresh();
    }
  };

  registerSafeCommand(context, "serverWorkspace.initialize", () => initializeWorkspace(store, views));
  registerSafeCommand(context, "serverWorkspace.refresh", () => refreshWorkspace(store, views));
  registerSafeCommand(context, "serverWorkspace.recreateData", () => recreateWorkspaceData(store, views));
  registerSafeCommand(context, "serverWorkspace.openNotes", () => openNotes(store));
  registerSafeCommand(context, "serverWorkspace.addNote", () => addNote(store, views));
  registerSafeCommand(context, "serverWorkspace.openSystemStatus", () => openSystemStatus(store));
  registerSafeCommand(context, "serverWorkspace.openFile", (input) => openTrackedFile(store, views, input));
  registerSafeCommand(context, "serverWorkspace.trackCurrentFile", () => trackCurrentFile(store, views));
  registerSafeCommand(context, "serverWorkspace.trackPath", () => trackPath(store, views));
  registerSafeCommand(context, "serverWorkspace.editDisplayName", (input) => editDisplayName(store, views, input));
  registerSafeCommand(context, "serverWorkspace.clearDisplayName", (input) => clearDisplayName(store, views, input));
  registerSafeCommand(context, "serverWorkspace.editComment", (input) => editComment(store, views, input));
  registerSafeCommand(context, "serverWorkspace.deleteComment", (input) => deleteComment(store, views, input));
  registerSafeCommand(context, "serverWorkspace.copyPath", (input) => copyPath(input));
  registerSafeCommand(context, "serverWorkspace.updateMetadata", (input) => updateMetadata(store, views, input));
}
