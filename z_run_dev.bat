@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM === LER CONFIG | inicio ===
set "ARQ_CONFIG=%~dp0config\servidor_dev.env"
if not exist "%ARQ_CONFIG%" (
  echo [ERRO] Nao encontrei: %ARQ_CONFIG%
  pause
  exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in ("%ARQ_CONFIG%") do (
  set "CHAVE=%%A"
  set "VALOR=%%B"
  if /I "!CHAVE!"=="HOST" set "HOST=!VALOR!"
  if /I "!CHAVE!"=="PORTA" set "PORTA=!VALOR!"
)
if "%HOST%"=="" set "HOST=localhost"
if "%PORTA%"=="" set "PORTA=5198"
REM === LER CONFIG | fim ===

echo.
echo ==========================================
echo   Rodando DEV: http://localhost:%PORTA%/
echo   Host LAN: %HOST%
echo ==========================================
echo.

npm run dev -- --host %HOST% --port %PORTA% --strictPort --open

endlocal
