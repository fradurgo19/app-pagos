@echo off
echo 🔧 Solucionando error ERR_MODULE_NOT_FOUND de Mailgun
echo.

echo 📦 Verificando package.json...
findstr "mailgun.js" package.json
if %errorlevel% neq 0 (
    echo ❌ mailgun.js no encontrado en package.json
    pause
    exit /b 1
)

echo ✅ mailgun.js encontrado en package.json
echo.

echo 📝 Agregando archivos al git...
git add package.json package-lock.json
if %errorlevel% neq 0 (
    echo ❌ Error al agregar archivos
    pause
    exit /b 1
)

echo ✅ Archivos agregados al git
echo.

echo 💾 Haciendo commit...
git commit -m "fix: Add Mailgun dependencies to main package.json for Vercel deployment"
if %errorlevel% neq 0 (
    echo ❌ Error al hacer commit
    pause
    exit /b 1
)

echo ✅ Commit realizado
echo.

echo 🚀 Haciendo push...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Error al hacer push
    pause
    exit /b 1
)

echo ✅ Push completado
echo.
echo 🎉 ¡Deploy iniciado en Vercel!
echo 📧 Recuerda configurar las variables de entorno:
echo    MAILGUN_API_KEY=***REEMPLAZAR_EN_VERCE***
echo    MAILGUN_DOMAIN=***REEMPLAZAR_EN_VERCE***
echo    EMAIL_FROM=analista.mantenimiento@partequipos.com
echo    EMAIL_TO=fherrera@partequipos.com
echo.
pause
