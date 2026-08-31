@echo off
echo Starting local web server for dirkgeeroms.be...
cd /d "%~dp0"
npx -y serve -p 3000 .
pause
