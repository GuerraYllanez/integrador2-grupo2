
import { google } from "googleapis";
import { spawn } from "node:child_process";
import { createGzip } from "node:zlib";
import { createWriteStream, createReadStream } from "node:fs";
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

async function getFolder() {
  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    return process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  const result = await drive.files.create({
    requestBody: {
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder"
    },
    fields: "id,name"
  });

  console.log("Carpeta creada en Drive:", result.data.name);
  console.log("GOOGLE_DRIVE_FOLDER_ID:", result.data.id);

  return result.data.id;
}

async function createBackup() {
  const filename = `mysql-backup-${getDate()}-${randomUUID().slice(0, 8)}.sql.gz`;
  const filepath = path.join(os.tmpdir(), filename);

  const args = [
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
  console.log("Archivo ID:", result.data.id);
}

async function cleanOldBackups(folderId) {
  const cutoff = Date.now() - RETENTION_DAYS * 86400000;

  const result = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,createdTime)",
    pageSize: 100,
    orderBy: "createdTime desc"
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
      const { unlink } = await import("node:fs/promises");
      await unlink(filepath).catch(() => {});
    }
  }
}

main().catch(error => {
  console.error("ERROR EN BACKUP:", error.message);
  process.exitCode = 1;
});
