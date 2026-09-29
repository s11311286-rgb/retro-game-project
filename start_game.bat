@echo off
title DINO RUN 恐龍跳躍 啟動器
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
