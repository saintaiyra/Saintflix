@echo off
echo ============================================
echo  Saintflix - Setup Automatizado
echo ============================================
echo.

echo [1/5] Instalando dependencias do Frontend...
cd /d "%~dp0"
npm install --legacy-peer-deps

echo.
echo [2/5] Instalando dependencias do Backend...
cd /d "%~dp0\backend"
npm install

echo.
echo [3/5] Verificando arquivos de ambiente...
if not exist "%~dp0\.env" (
    copy "%~dp0\.env.example" "%~dp0\.env"
    echo Criado .env no frontend (configure as variaveis)
) else (
    echo .env ja existe no frontend
)

if not exist "%~dp0\backend\.env" (
    copy "%~dp0\backend\.env.example" "%~dp0\backend\.env"
    echo Criado .env no backend (configure as variaveis)
) else (
    echo .env ja existe no backend
)

echo.
echo [4/5] Verificando MongoDB...
echo Certifique-se de que o MongoDB esta rodando:
echo   - Local: mongod
echo   - Ou configure MONGODB_URI no backend/.env para Atlas

echo.
echo [5/5] Verificando Stripe...
echo Configure as chaves do Stripe nos arquivos .env:
echo   - STRIPE_SECRET_KEY (backend)
echo   - STRIPE_PUBLISHABLE_KEY (frontend + backend)
echo   - STRIPE_WEBHOOK_SECRET (backend - use 'stripe listen' para dev)

echo.
echo ============================================
echo  Setup concluido!
echo ============================================
echo.
echo Para executar:
echo.
echo Terminal 1 (Backend):
echo   cd backend ^& npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd .. ^& npm run dev
echo.
echo Acesse: http://localhost:3000
echo.
echo Para webhook Stripe em desenvolvimento:
echo   stripe listen --forward-to localhost:5000/api/payments/webhook
echo.
pause