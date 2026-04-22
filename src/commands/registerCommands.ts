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

  registerSafeCommand(context, "sshServerWorkspace.initialize", () => initializeWorkspace(store, views));
  registerSafeCommand(context, "sshServerWorkspace.refresh", () => refreshWorkspace(store, views));
  registerSafeCommand(context, "sshServerWorkspace.recreateData", () => recreateWorkspaceData(store, views));
  registerSafeCommand(context, "sshServerWorkspace.openNotes", () => openNotes(store));
  registerSafeCommand(context, "sshServerWorkspace.addNote", () => addNote(store, views));
  registerSafeCommand(context, "sshServerWorkspace.openSystemStatus", () => openSystemStatus(store));
  registerSafeCommand(context, "sshServerWorkspace.openFile", (input) => openTrackedFile(store, views, input));
  registerSafeCommand(context, "sshServerWorkspace.trackCurrentFile", () => trackCurrentFile(store, views));
  registerSafeCommand(context, "sshServerWorkspace.trackPath", () => trackPath(store, views));
  registerSafeCommand(context, "sshServerWorkspace.editDisplayName", (input) => editDisplayName(store, views, input));
  registerSafeCommand(context, "sshServerWorkspace.clearDisplayName", (input) => clearDisplayName(store, views, input));
  registerSafeCommand(context, "sshServerWorkspace.editComment", (input) => editComment(store, views, input));
  registerSafeCommand(context, "sshServerWorkspace.deleteComment", (input) => deleteComment(store, views, input));
  registerSafeCommand(context, "sshServerWorkspace.copyPath", (input) => copyPath(input));
  registerSafeCommand(context, "sshServerWorkspace.updateMetadata", (input) => updateMetadata(store, views, input));
}
