@echo off
chcp 65001 >nul
echo === Instalar dependencias (padrao) ===
echo.

call "%~dp0\00_verificar_node_npm.bat" || exit /b 1

echo Rodando npm install sem alterar cache, prefix ou registry...
npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo [ERRO] npm install falhou.
  echo Tente novamente no mesmo terminal.
  pause
  exit /b 1
)

echo.
echo OK! Dependencias instaladas.
pause
