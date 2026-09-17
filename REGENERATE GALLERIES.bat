@echo off
setlocal

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
    rem PATH sometimes isn't refreshed yet right after installing Node.js
    rem (e.g. if Explorer was already running) - fall back to the default install path.
    if exist "%ProgramFiles%\nodejs\npm.cmd" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)

where npm >nul 2>nul
if errorlevel 1 (
    echo.
    echo ERROR: Node.js was not found.
    echo Install it from https://nodejs.org/ ^(the LTS version^), then run this again.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Setting up for the first time, this may take a minute...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Setup failed. See above for details.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Building photo galleries from _originals\...
echo.
call npm run build-galleries
if errorlevel 1 (
    echo.
    echo Something went wrong. See the messages above for details.
) else (
    echo.
    echo Done! Check the galleries folder, then commit and push when you're happy with it.
)

echo.
pause
