@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado. Consulte README.md.
  pause
  exit /b 1
)
echo Abra http://localhost:3210 no seu navegador depois que o servidor iniciar.
node server.js
pause
