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
echo Para entrar desde tu celular (misma red Wi-Fi), usa esta direccion:
echo 👉 http://192.168.1.52:5173
echo --------------------------------------------------
pause