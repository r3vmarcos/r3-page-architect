@echo off
chcp 65001 >nul
echo === Verificar Node/NPM ===
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node nao encontrado no PATH.
  echo Instale o Node LTS e reabra o terminal.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] NPM nao encontrado no PATH.
  pause
  exit /b 1
)

echo Node:
node -v
echo NPM:
npm -v
echo.
pause
