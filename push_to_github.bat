@echo off
chcp 65001 >nul
title 上傳遊戲專案至 GitHub
cd /d "%~dp0"

echo ========================================================
echo  正在推送程式碼至 GitHub (s11311286-rgb/retro-game-project)...
echo ========================================================
echo.
echo 若彈出 GitHub 登入小視窗，請點選 [Sign in with your browser] 即可。
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  ★ 推送成功！
    echo  正在為您開啟 GitHub Pages 設定頁面...
    echo ========================================================
    start https://github.com/s11311286-rgb/retro-game-project/settings/pages
) else (
    echo.
    echo ========================================================
    echo  若推送失敗，可能的原因：
    echo  1. 遠端儲存庫尚未建立：請確認在 GitHub 上已建立名為
    echo     retro-game-project 的儲存庫 (https://github.com/new)
    echo  2. 尚未於瀏覽器完成 GitHub 登入授權。
    echo ========================================================
)
echo.
pause
