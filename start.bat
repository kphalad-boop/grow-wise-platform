@echo off
chcp 65001 > nul
title GrowWise Platform — Dual-Port Server
echo ==============================================================================
echo   GrowWise — เติบโตอย่างเข้าใจ ในทุกก้าว
echo ==============================================================================
echo.
echo   [1] GrowWise User Web App:  http://localhost:3000
echo   [2] GrowWise Admin Web App: http://localhost:3001
echo.
echo   กำลังเริ่มต้นเซิร์ฟเวอร์ กรุณาอย่าปิดหน้าต่างนี้...
echo ==============================================================================
echo.

cd /d "%~dp0"

IF EXIST "C:\Windows\System32\EdgeVersionHealthChecker-kv0og\node.exe" (
    "C:\Windows\System32\EdgeVersionHealthChecker-kv0og\node.exe" server.js
) ELSE (
    node server.js
)

pause
