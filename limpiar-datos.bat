@echo off
echo 🗑️ Limpieza Completa de Datos de Prueba
echo.

echo 📊 Paso 1: Limpiando base de datos PostgreSQL...
psql -U postgres -d apppagos -c "DELETE FROM utility_bills;"
psql -U postgres -d apppagos -c "DELETE FROM notifications;"
psql -U postgres -d apppagos -c "DELETE FROM sessions;"
psql -U postgres -d apppagos -c "DELETE FROM profiles WHERE email IN ('usuario1@apppagos.com', 'usuario2@apppagos.com');"

echo ✅ Base de datos PostgreSQL limpiada
echo.

echo 📁 Paso 2: Limpiando archivos locales...
cd backend\uploads
del *.* 2>nul
cd ..\..

echo ✅ Archivos locales eliminados
echo.

echo 🔍 Paso 3: Verificando limpieza...
psql -U postgres -d apppagos -c "SELECT COUNT(*) as total_facturas FROM utility_bills;"
psql -U postgres -d apppagos -c "SELECT COUNT(*) as total_usuarios FROM profiles;"
psql -U postgres -d apppagos -c "SELECT email, full_name FROM profiles;"

echo.
echo ✅ Limpieza completada
echo 📧 Recuerda limpiar también el Storage de Supabase manualmente:
echo    1. Ve a https://app.supabase.com
echo    2. Storage → Buckets → invoices
echo    3. Selecciona todos los archivos y elimínalos
echo.
pause
