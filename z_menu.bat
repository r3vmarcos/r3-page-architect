@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ARQ_CONFIG=%~dp0config\servidor_dev.env"
set "HOST=localhost"
set "PORTA=5195"

if exist "%ARQ_CONFIG%" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%ARQ_CONFIG%") do (
    set "CHAVE=%%A"
    set "VALOR=%%B"
    if /I "!CHAVE!"=="HOST" set "HOST=!VALOR!"
    if /I "!CHAVE!"=="PORTA" set "PORTA=!VALOR!"
  )
)

:MENU
cls
echo ==========================================
echo   PAGE ARCHITECT v_A01
echo ==========================================
echo   Porta atual : %PORTA%
echo   Arquivo env : %ARQ_CONFIG%
echo ==========================================
echo.
echo [1] npm install
echo [2] rodar dev (z_run_dev)
echo [3] abrir VS Code
echo [0] sair
echo.
set /p OP=Escolha uma opcao: 

if "%OP%"=="1" call "%~dp0z_npm_install.bat"
if "%OP%"=="2" call "%~dp0z_run_dev.bat"
if "%OP%"=="3" call "%~dp0z_bat_vscode.bat"
if "%OP%"=="0" exit /b 0

pause
goto MENU
