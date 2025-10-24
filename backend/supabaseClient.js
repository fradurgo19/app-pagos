import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno (busca .env en la raíz del proyecto)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Cliente para Base de Datos (tablas)
const supabaseDbUrl = process.env.VITE_SUPABASE_URL;
const supabaseDbKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
export const supabaseDb = createClient(supabaseDbUrl, supabaseDbKey);

// Cliente para Storage (archivos)
const supabaseStorageUrl = process.env.SUPABASE_STORAGE_URL;
const supabaseStorageKey = process.env.SUPABASE_STORAGE_KEY;
export const supabaseStorage = createClient(supabaseStorageUrl, supabaseStorageKey);

export const supabase = supabaseDb; // Por compatibilidad

// Subir archivo a Supabase Storage (proyecto de storage)
export const uploadToSupabase = async (file, userId) => {
  try {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabaseStorage.storage
      .from('invoices')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Error al subir a Supabase Storage:', error);
      throw error;
    }

    // Obtener URL pública
    const { data: publicUrl } = supabaseStorage.storage
      .from('invoices')
      .getPublicUrl(filePath);

    return {
      url: publicUrl.publicUrl,
      filename: file.originalname,
      path: filePath
    };
  } catch (error) {
    console.error('Error en uploadToSupabase:', error);
    throw error;
  }
};

export default supabase;

