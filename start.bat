@echo off
echo ==================================================
echo   Iniciando Prestamos Tech (Modo Local/Wi-Fi)
echo ==================================================

echo Iniciando Backend Local...
start "SERVER" cmd /k "cd server && node index.js"

echo Iniciando Frontend Local...
start "CLIENT" cmd /k "cd client && npm run dev"

echo --------------------------------------------------
echo ¡Todo en marcha!
echo El frontend estara disponible en tu navegador en:
echo 👉 http://localhost:5173
echo --------------------------------------------------
pause