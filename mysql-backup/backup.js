
import { google } from "googleapis";
import { spawn } from "node:child_process";
import { createGzip } from "node:zlib";
import {
  createWriteStream,
  createReadStream
} from "node:fs";
import { unlink } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const required = [
  "MYSQLHOST",
  "MYSQLPORT",
  "MYSQLUSER",
  "MYSQLPASSWORD",
  "MYSQLDATABASE",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN"
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta configurar la variable ${key}`);
  }
}

const {
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN
} = process.env;

const RETENTION_DAYS = Number(process.env.RETENTION_DAYS || 14);
const FOLDER_NAME = "BACKUPS_RAILWAY_MYSQL";

if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS < 1) {
  throw new Error("RETENTION_DAYS debe ser un número mayor que cero");
}

const auth = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);

auth.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({
  version: "v3",
  auth
});

function getDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

// Busca carpetas creadas y accesibles por esta aplicación.
// Si encuentra varias, prioriza la que ya contiene respaldos.
async function getFolder() {
  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    console.log("Usando carpeta configurada mediante ID.");
    return process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  const result = await drive.files.list({
    q: `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id,name,createdTime)",
    pageSize: 100,
    orderBy: "createdTime desc"
  });

  const folders = result.data.files || [];

  if (folders.length > 0) {
    let selectedFolder = null;
    let highestBackupCount = -1;

    for (const folder of folders) {
      const contents = await drive.files.list({
        q: `'${folder.id}' in parents and trashed = false and name contains 'mysql-backup-'`,
        fields: "files(id,name)",
        pageSize: 100
      });

      const count = contents.data.files?.length || 0;

      if (count > highestBackupCount) {
        highestBackupCount = count;
        selectedFolder = folder;
      }
    }

    console.log("Reutilizando carpeta existente:", selectedFolder.name);
    console.log("Carpeta ID:", selectedFolder.id);

    return selectedFolder.id;
  }

  const created = await drive.files.create({
    requestBody: {
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder"
    },
    fields: "id,name"
  });

  console.log("Carpeta creada:", created.data.name);
  console.log("Carpeta ID:", created.data.id);

  return created.data.id;
}

async function createBackup() {
  const filename =
    `mysql-backup-${getDate()}-${randomUUID().slice(0, 8)}.sql.gz`;

  const filepath = path.join(os.tmpdir(), filename);

  const args = [
    "--protocol=TCP",
    "--host", MYSQLHOST,
    "--port", MYSQLPORT,
    "--user", MYSQLUSER,
    "--single-transaction",
    "--quick",
    "--routines",
    "--triggers",
    "--events",
    "--hex-blob",
    MYSQLDATABASE
  ];

  console.log("Iniciando exportación de MySQL...");

  const dump = spawn("mysqldump", args, {
    env: {
      ...process.env,
      MYSQL_PWD: MYSQLPASSWORD
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";

  dump.stderr.on("data", chunk => {
    stderr += chunk.toString();
  });

  const closePromise = new Promise((resolve, reject) => {
    dump.on("error", reject);
    dump.on("close", code => resolve(code));
  });

  try {
    await pipeline(
      dump.stdout,
      createGzip(),
      createWriteStream(filepath)
    );

    const code = await closePromise;

    if (code !== 0) {
      throw new Error(`mysqldump falló: ${stderr}`);
    }

    console.log("Backup generado:", filename);

    return { filename, filepath };
  } catch (error) {
    dump.kill();
    throw error;
  }
}

async function uploadBackup(filename, filepath, folderId) {
  console.log("Subiendo backup a Google Drive...");

  const result = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId]
    },
    media: {
      mimeType: "application/gzip",
      body: createReadStream(filepath)
    },
    fields: "id,name,size"
  });

  console.log("Backup subido correctamente:", result.data.name);
  console.log("Tamaño:", result.data.size, "bytes");
}

async function cleanOldBackups(folderId) {
  const cutoff = Date.now() - RETENTION_DAYS * 86400000;

  let pageToken;

  do {
    const result = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,createdTime)",
      pageSize: 100,
      orderBy: "createdTime asc",
      pageToken
    });

    for (const file of result.data.files || []) {
      if (
        file.name.startsWith("mysql-backup-") &&
        new Date(file.createdTime).getTime() < cutoff
      ) {
        await drive.files.delete({ fileId: file.id });
        console.log("Backup antiguo eliminado:", file.name);
      }
    }

    pageToken = result.data.nextPageToken;
  } while (pageToken);
}

async function main() {
  let filepath;

  try {
    const folderId = await getFolder();

    const backup = await createBackup();
    filepath = backup.filepath;

    await uploadBackup(
      backup.filename,
      backup.filepath,
      folderId
    );

    await cleanOldBackups(folderId);

    console.log("Proceso de backup finalizado correctamente.");
  } finally {
    if (filepath) {
      await unlink(filepath).catch(() => {});
    }
  }
}

main().catch(error => {
  console.error("ERROR EN BACKUP:", error.message);
  process.exitCode = 1;
});
