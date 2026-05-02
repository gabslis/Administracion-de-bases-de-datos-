@echo off
start "SERVER" cmd /k "cd server && node index.js"
start "CLIENT" cmd /k "cd client && npm run dev"