/**
 * Migra tablas de Supabase ORIGEN → DESTINO preservando UUIDs.
 *
 * Uso:
 *   1. Copia .env.migrate.example → .env.migrate y completa credenciales
 *   2. node scripts/migrate-supabase-data.mjs
 *
 * Requiere SERVICE ROLE KEY en origen y destino (Settings → API).
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.migrate') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SOURCE_URL = process.env.SOURCE_SUPABASE_URL;
const SOURCE_KEY = process.env.SOURCE_SUPABASE_SERVICE_KEY;
const DEST_URL = process.env.DEST_SUPABASE_URL;
const DEST_KEY = process.env.DEST_SUPABASE_SERVICE_KEY;

const TABLES_IN_ORDER = [
  'profiles',
  'utility_bills',
  'bill_consumptions',
  'notifications',
  'budget_thresholds'
];

const PAGE_SIZE = 1000;
const UPSERT_BATCH = 200;

function requireEnv() {
  const missing = [];
  if (!SOURCE_URL) missing.push('SOURCE_SUPABASE_URL');
  if (!SOURCE_KEY) missing.push('SOURCE_SUPABASE_SERVICE_KEY');
  if (!DEST_URL) missing.push('DEST_SUPABASE_URL');
  if (!DEST_KEY) missing.push('DEST_SUPABASE_SERVICE_KEY');
  if (missing.length > 0) {
    console.error('❌ Faltan variables en .env.migrate:', missing.join(', '));
    process.exit(1);
  }
}

async function fetchAllRows(client, table) {
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Lectura ${table}: ${error.message}`);

    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function upsertRows(client, table, rows) {
  if (rows.length === 0) {
    console.log(`   ⏭️  ${table}: sin registros, se omite`);
    return 0;
  }

  for (let i = 0; i < rows.length; i += UPSERT_BATCH) {
    const batch = rows.slice(i, i + UPSERT_BATCH);
    const { error } = await client.from(table).upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(`Escritura ${table}: ${error.message}`);
  }

  return rows.length;
}

async function getCount(client, table) {
  const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`Conteo ${table}: ${error.message}`);
  return count ?? 0;
}

async function runOrphanBillsCheck(dest) {
  const { data: bills } = await dest.from('utility_bills').select('user_id');
  const { data: profiles } = await dest.from('profiles').select('id');
  const profileIds = new Set((profiles ?? []).map((p) => p.id));
  return (bills ?? []).filter((b) => !profileIds.has(b.user_id)).length;
}

async function runOrphanConsumptionsCheck(dest) {
  const { data: consumptions } = await dest.from('bill_consumptions').select('bill_id');
  const { data: allBills } = await dest.from('utility_bills').select('id');
  const billIds = new Set((allBills ?? []).map((b) => b.id));
  return (consumptions ?? []).filter((c) => !billIds.has(c.bill_id)).length;
}

async function updateDocumentUrls(dest) {
  if (!SOURCE_URL || !DEST_URL || SOURCE_URL === DEST_URL) return;

  const originHost = new URL(SOURCE_URL).origin;
  const destHost = new URL(DEST_URL).origin;

  const { data: bills, error: readError } = await dest
    .from('utility_bills')
    .select('id, document_url')
    .not('document_url', 'is', null);

  if (readError) {
    console.warn('⚠️  No se pudieron leer document_url:', readError.message);
    return;
  }

  const toUpdate = (bills ?? []).filter((b) => b.document_url?.includes(originHost));
  if (toUpdate.length === 0) {
    console.log('   URLs de documentos: ninguna requiere actualización');
    return;
  }

  for (const bill of toUpdate) {
    const newUrl = bill.document_url.replaceAll(originHost, destHost);
    const { error } = await dest.from('utility_bills').update({ document_url: newUrl }).eq('id', bill.id);
    if (error) {
      console.warn(`   ⚠️  URL bill ${bill.id}:`, error.message);
    }
  }
  console.log(`   URLs de documentos actualizadas: ${toUpdate.length}`);
}

async function main() {
  requireEnv();

  const source = createClient(SOURCE_URL, SOURCE_KEY);
  const dest = createClient(DEST_URL, DEST_KEY);

  console.log('🚀 Migración Supabase ORIGEN → DESTINO\n');
  console.log(`   Origen:  ${SOURCE_URL}`);
  console.log(`   Destino: ${DEST_URL}\n`);

  const summary = [];

  for (const table of TABLES_IN_ORDER) {
    console.log(`📦 ${table}...`);
    const rows = await fetchAllRows(source, table);
    const written = await upsertRows(dest, table, rows);
    console.log(`   ✅ ${written} registro(s) migrados`);
    summary.push({ table, source: rows.length, dest: written });
  }

  console.log('\n📊 Conteos en DESTINO:');
  for (const table of TABLES_IN_ORDER) {
    const count = await getCount(dest, table);
    console.log(`   ${table}: ${count}`);
  }

  const billsSinUsuario = await runOrphanBillsCheck(dest);
  const consumosHuerfanos = await runOrphanConsumptionsCheck(dest);
  console.log('\n🔍 Validación de integridad:');
  console.log(`   bills_sin_usuario: ${billsSinUsuario} (debe ser 0)`);
  console.log(`   consumos_huerfanos: ${consumosHuerfanos} (debe ser 0)`);

  if (billsSinUsuario === 0 && consumosHuerfanos === 0) {
    console.log('   ✅ Integridad OK');
  } else {
    console.log('   ❌ Hay registros huérfanos — revisa el orden de importación');
    process.exitCode = 1;
  }

  console.log('\n🔗 Actualizando document_url si cambió el dominio...');
  await updateDocumentUrls(dest);

  console.log('\n✅ Migración de datos completada.');
  console.log('\nSiguiente paso: node scripts/migrate-supabase-storage.mjs');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
