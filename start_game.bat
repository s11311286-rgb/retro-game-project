@echo off
title 復古五子棋 Gomoku 啟動器
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
