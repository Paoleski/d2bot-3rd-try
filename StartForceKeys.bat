@echo off
setlocal EnableExtensions
REM One elevated PowerShell. Output always saved to forcekeys_boot.log
set ROOT=C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try
set PS1=%ROOT%\StartForceKeys.ps1
set LOG=%ROOT%\forcekeys_boot.log

echo Accept the ONE UAC prompt.
echo Elevated window may flash — full output is saved to:
echo   %LOG%
echo.

powershell -NoProfile -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -NoExit -File \"%PS1%\"' -Verb RunAs"

echo.
echo Waiting 8s for elevated script...
timeout /t 8 /nobreak >nul

echo.
echo === forcekeys_boot.log ===
if exist "%LOG%" (
  type "%LOG%"
) else (
  echo LOG MISSING — UAC was cancelled, or elevated PowerShell never started.
)
echo.
echo === inject / ingame files ===
if exist "%ROOT%\d2bs\kolbot\data\pd2_forcekeys.inject" (
  type "%ROOT%\d2bs\kolbot\data\pd2_forcekeys.inject"
) else (
  echo inject MISSING
)
if exist "%ROOT%\d2bs\kolbot\data\pd2_forcekeys.ingame" (
  type "%ROOT%\d2bs\kolbot\data\pd2_forcekeys.ingame"
) else (
  echo ingame MISSING
)
echo.
pause
