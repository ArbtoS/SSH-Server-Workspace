import * as path from "path";
import * as vscode from "vscode";
import { t } from "../core/localization";
import { WorkspaceNote } from "../core/types";
import { WorkspaceStore } from "../core/workspaceStore";
import { CommandItem, MessageItem } from "./commonItems";

type NotesNode = CommandItem | MessageItem | NoteFileItem;
const notesMime = "application/vnd.ssh-workspace.note-file";

class NoteFileItem extends vscode.TreeItem {
  public constructor(public readonly note: WorkspaceNote, private readonly protectedNote: boolean) {
    super(note.title, vscode.TreeItemCollapsibleState.None);
    this.contextValue = protectedNote ? "noteFileProtected" : "noteFile";
    this.description = path.basename(note.path);
    this.iconPath = new vscode.ThemeIcon("note");
    this.command = {
      command: "sshWorkspace.openNotes",
      title: t("open"),
      arguments: [note.path]
    };
    this.tooltip = note.path;
  }
}


export class NotesProvider implements vscode.TreeDataProvider<NotesNode>, vscode.TreeDragAndDropController<NotesNode> {
  public readonly dragMimeTypes = [notesMime];
  public readonly dropMimeTypes = [notesMime];
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<NotesNode | undefined | null | void>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  public constructor(private readonly store: WorkspaceStore) {}

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: NotesNode): vscode.TreeItem {
    return element;
  }

  public async getChildren(): Promise<NotesNode[]> {
    try {
      if (!(await this.store.isInitialized())) {
        return [new MessageItem(t("notInitialized"), t("initializeHint"))];
      }

      const data = await this.store.load();
      if (!data) {
        return [new MessageItem(t("notInitialized"), t("initializeHint"))];
      }

      const noteItems = this.store
        .listNotes(data)
        .map((note) => new NoteFileItem(note, path.resolve(note.path) === path.resolve(this.store.paths.notes)));

      return [
        new CommandItem(
          t("actionAddNote"),
          {
            command: "sshWorkspace.addNote",
            title: t("actionAddNote")
          },
          "add"
        ),
        ...noteItems
      ];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [new MessageItem(t("errorLoading"), message)];
    }
  }

  public handleDrag(source: readonly NotesNode[], dataTransfer: vscode.DataTransfer): void {
    const notePaths = source.filter((item): item is NoteFileItem => item instanceof NoteFileItem).map((item) => item.note.path);

    if (notePaths.length > 0) {
      dataTransfer.set(notesMime, new vscode.DataTransferItem(JSON.stringify(notePaths)));
    }
  }

  public async handleDrop(target: NotesNode | undefined, dataTransfer: vscode.DataTransfer): Promise<void> {
    const transferItem = dataTransfer.get(notesMime);
    if (!transferItem) {
      return;
    }

    if (target && !(target instanceof NoteFileItem)) {
      return;
    }

    const rawPaths = await transferItem.asString();
    const draggedPaths = JSON.parse(rawPaths) as string[];
    if (draggedPaths.length === 0) {
      return;
    }

    const data = await this.store.load();
    if (!data) {
      return;
    }

    this.store.reorderNotes(data, draggedPaths, target instanceof NoteFileItem ? target.note.path : undefined);
    await this.store.save(data);
    this.refresh();
  }
}
