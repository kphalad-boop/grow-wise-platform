@echo off
chcp 65001 >nul
echo ===================================================
echo   GrowWise Platform - Push to GitHub
echo ===================================================
echo Repository: https://github.com/kphalad-boop/grow-wise-platform
echo.

set GIT_EXE=C:\Users\Asus\AppData\Local\Programs\MinGit\cmd\git.exe

if not exist "%GIT_EXE%" (
    echo [ERROR] ไม่พบ Git ในระบบ
    pause
    exit /b 1
)

echo กำลังส่งข้อมูลไปยัง GitHub main branch...
"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Push โค้ดขึ้น GitHub สำเร็จเรียบร้อยแล้ว!
) else (
    echo.
    echo [NOTICE] หากพบ Error 403 (Permission denied):
    echo สามารถใส่ GitHub Token ของบัญชี kphalad-boop ได้โดยพิมพ์คำสั่ง:
    echo "%GIT_EXE%" push https://<YOUR_GITHUB_TOKEN>@github.com/kphalad-boop/grow-wise-platform.git main
)

echo.
pause
