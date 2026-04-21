# Server Workspace

Kleine VS-Code-Extension fuer Nutzer, die bereits per Remote-SSH mit einem Linux-Server verbunden sind. Die Extension baut keine SSH-Verbindung auf, bearbeitet keine SSH-Config und bringt keine Backend-Komponente mit.

## Ziel von V1

- Eigener Activity-Bar-Bereich `Server Workspace`
- Tree Views: `Aktionen`, `Arbeitsseite`, `System`, `Notizen`
- Remote-Dateien unter `~/.server-workspace/`
- Commands fuer Initialisierung, Refresh, Notizen und Kommentare

## Entwicklung

```bash
npm install
npm run compile
```

Zum Testen in VS Code:

1. Projektordner in VS Code oeffnen.
2. `F5` starten, um ein Extension Development Host Fenster zu oeffnen.
3. Die Extension ist fuer Remote-SSH-Workspaces gedacht und laeuft als Workspace-Extension.

## Nutzung

### Initialisieren

Command ausfuehren:

```text
Server Workspace: Initialisieren
```

Erst dieser Command legt auf dem verbundenen Host den Ordner an:

```text
~/.server-workspace/
```

Darin werden fehlende Dateien erstellt:

- `SYSTEMSTATUS.md`
- `NOTIZEN.md`
- `workspace-data.json`

Vor dem Initialisieren legt die Extension keine Server-Dateien an.

### Aktualisieren

Command:

```text
Server Workspace: Aktualisieren
```

Der Refresh liest Systeminfos, aktualisiert `workspace-data.json`, prueft bekannte getrackte Dateien und refreshed die Views.

Wenn die Arbeitsdaten neu aufgebaut werden sollen:

```text
Server Workspace: Daten neu erstellen
```

Dieser Command erstellt `workspace-data.json` neu und leert Arbeitsliste sowie Rohlog. `SYSTEMSTATUS.md` und `NOTIZEN.md` bleiben erhalten.

### Arbeitsseite

Die View besteht aus:

- `Arbeitsliste`: getrackte Dateien, sortiert nach letzter Aenderung absteigend.
- `Rohlog`: einfache Logzeilen im Format `Datum Uhrzeit | Pfad`.

Eine Datei wird ueber `Server Workspace: Aktuelle Datei tracken` in die Arbeitsliste aufgenommen. Fuer Dateien, die im Terminal bearbeitet wurden, gibt es `Server Workspace: Pfad tracken`, z. B. `/etc/systemd/system/hostapd-healthcheck.timer`.

Kontextmenues bieten Oeffnen, Klarname bearbeiten/loeschen, Kommentar bearbeiten/loeschen, Pfad kopieren und Metadaten aktualisieren. Dateien in der Arbeitsliste koennen per Drag & Drop umsortiert werden. Wenn eine bekannte Datei ausserhalb von VS Code geaendert wurde, erfasst `Server Workspace: Aktualisieren` die neuen Metadaten.

Interne Server-Workspace-Dateien wie `NOTIZEN.md`, `SYSTEMSTATUS.md` und `workspace-data.json` werden nicht in der Arbeitsliste angezeigt.

### System

Zeigt Hostname, OS, Kernel, Architektur, Haupt-IP und letzten Refresh.

### Notizen

Die Notizen-View bietet:

- `Notiz hinzufuegen`: schreibt direkt eine neue Zeile in `NOTIZEN.md`
- `NOTIZEN.md`: oeffnet die Markdown-Datei zur freien Bearbeitung
- `SYSTEMSTATUS.md`: oeffnet die manuell pflegbare Datei fuer Rolle, Zweck und Bemerkungen
- Anzeige der letzten Notizzeilen

### Aktionen

Buendelt die globalen Befehle der Extension, damit Arbeitsseite und System nicht dieselben Buttons doppelt anbieten:

- Initialisieren
- Aktualisieren
- Pfad tracken
- Aktuelle Datei tracken
- Notiz hinzufuegen
- Daten neu erstellen

## Nicht enthalten

Die Extension speichert keine SSH-Hosts. Dafuer bleibt der VS-Code Remote Explorer bzw. Remote-SSH zustaendig.
