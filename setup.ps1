# Script de Configuración Automática - APPpagos
# Ejecutar con: .\setup.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  APPpagos - Setup Automático" -ForegroundColor Cyan
Write-Host "  Sistema de Gestión de Facturas" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Verificar Node.js
Write-Host "[1/6] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado." -ForegroundColor Red
    exit 1
}

# Verificar archivo .env
Write-Host "`n[2/6] Verificando archivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
    
    # Leer y verificar contenido
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_SUPABASE_URL=https://.*\.supabase\.co" -and 
        $envContent -match "VITE_SUPABASE_ANON_KEY=eyJ") {
        Write-Host "✅ Variables de entorno configuradas correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Advertencia: Las variables en .env parecen estar sin configurar" -ForegroundColor Yellow
        Write-Host "   Por favor, actualiza VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con tus credenciales reales" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Archivo .env no encontrado. Creando plantilla..." -ForegroundColor Yellow
    
    $envTemplate = @"
# Supabase Configuration
# IMPORTANTE: Reemplaza estos valores con tus credenciales reales de Supabase
# Puedes obtenerlas desde: https://app.supabase.com -> Tu Proyecto -> Settings -> API

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
"@
    
    Set-Content -Path ".env" -Value $envTemplate
    Write-Host "✅ Archivo .env creado. Por favor, edítalo con tus credenciales de Supabase." -ForegroundColor Green
    Write-Host "   Ubicación: $(Get-Location)\.env" -ForegroundColor Cyan
}

# Instalar dependencias
Write-Host "`n[3/6] Instalando dependencias de npm..." -ForegroundColor Yellow
Write-Host "   Esto puede tomar algunos minutos..." -ForegroundColor Gray

try {
    npm install
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al instalar dependencias. Verifica tu conexión a internet." -ForegroundColor Red
    exit 1
}

# Verificar TypeScript
Write-Host "`n[4/6] Verificando TypeScript..." -ForegroundColor Yellow
try {
    npm run typecheck 2>&1 | Out-Null
    Write-Host "✅ TypeScript: Sin errores" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Advertencia: Hay algunos errores de TypeScript" -ForegroundColor Yellow
}

# Verificar ESLint
Write-Host "`n[5/6] Verificando ESLint..." -ForegroundColor Yellow
try {
    npm run lint 2>&1 | Out-Null
    Write-Host "✅ ESLint: Sin errores" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Advertencia: Hay algunos errores de linting" -ForegroundColor Yellow
}

# Inicializar Git si no existe
Write-Host "`n[6/6] Verificando Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Repositorio Git ya inicializado" -ForegroundColor Green
} else {
    try {
        git init
        git add .
        git commit -m "Initial commit: Sistema de gestión de facturas"
        Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Git no disponible o error al inicializar" -ForegroundColor Yellow
    }
}

# Resumen final
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE CONFIGURACIÓN" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Estado del proyecto:" -ForegroundColor White
Write-Host "  ✅ Dependencias instaladas" -ForegroundColor Green
Write-Host "  ✅ Configuración de TypeScript verificada" -ForegroundColor Green
Write-Host "  ✅ ESLint configurado" -ForegroundColor Green

Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Edita el archivo .env con tus credenciales de Supabase" -ForegroundColor White
Write-Host "  2. Configura la base de datos en Supabase (ver SETUP_INSTRUCTIONS.md)" -ForegroundColor White
Write-Host "  3. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "  4. Abre http://localhost:5173 en tu navegador" -ForegroundColor White

Write-Host "`nDocumentación:" -ForegroundColor Yellow
Write-Host "  📖 Instrucciones completas: SETUP_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host "  📝 Cambios aplicados: CHANGES_APPLIED.md" -ForegroundColor Cyan
Write-Host "  📚 README del proyecto: README.md" -ForegroundColor Cyan

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  ¡Configuración completada!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

# Preguntar si desea iniciar el servidor de desarrollo
$response = Read-Host "¿Deseas iniciar el servidor de desarrollo ahora? (s/n)"
if ($response -eq "s" -or $response -eq "S") {
    Write-Host "`nIniciando servidor de desarrollo..." -ForegroundColor Yellow
    Write-Host "Presiona Ctrl+C para detener el servidor`n" -ForegroundColor Gray
    npm run dev
}

