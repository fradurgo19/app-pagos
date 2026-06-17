/**
 * Copia archivos del bucket "invoices" ORIGEN → DESTINO.
 * Uso: node scripts/migrate-supabase-storage.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.migrate') });

const BUCKET = 'invoices';

const SOURCE_URL = process.env.SOURCE_SUPABASE_STORAGE_URL || process.env.SOURCE_SUPABASE_URL;
const SOURCE_KEY = process.env.SOURCE_SUPABASE_STORAGE_KEY || process.env.SOURCE_SUPABASE_SERVICE_KEY;
const DEST_URL = process.env.DEST_SUPABASE_STORAGE_URL || process.env.DEST_SUPABASE_URL;
const DEST_KEY = process.env.DEST_SUPABASE_STORAGE_KEY || process.env.DEST_SUPABASE_SERVICE_KEY;

async function listAllFiles(storage, prefix = '') {
  const files = [];
  const { data, error } = await storage.from(BUCKET).list(prefix, { limit: 1000 });

  if (error) throw new Error(`List ${prefix || '/'}: ${error.message}`);
  if (!data) return files;

  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      const nested = await listAllFiles(storage, fullPath);
      files.push(...nested);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  if (!SOURCE_URL || !SOURCE_KEY || !DEST_URL || !DEST_KEY) {
    console.error('❌ Configura SOURCE_* y DEST_* en .env.migrate');
    process.exit(1);
  }

  const source = createClient(SOURCE_URL, SOURCE_KEY);
  const dest = createClient(DEST_URL, DEST_KEY);

  console.log(`🗂️  Migrando bucket "${BUCKET}"...\n`);

  const paths = await listAllFiles(source.storage);
  console.log(`   Archivos encontrados: ${paths.length}`);

  let ok = 0;
  let fail = 0;

  for (const filePath of paths) {
    const { data: blob, error: dlError } = await source.storage.from(BUCKET).download(filePath);
    if (dlError || !blob) {
      console.warn(`   ⚠️  Descarga fallida: ${filePath}`);
      fail += 1;
      continue;
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const { error: upError } = await dest.storage.from(BUCKET).upload(filePath, buffer, {
      upsert: true,
      contentType: blob.type || 'application/octet-stream'
    });

    if (upError) {
      console.warn(`   ⚠️  Subida fallida: ${filePath} — ${upError.message}`);
      fail += 1;
    } else {
      ok += 1;
      if (ok % 10 === 0) console.log(`   ... ${ok} archivos copiados`);
    }
  }

  console.log(`\n✅ Storage: ${ok} OK, ${fail} errores`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
