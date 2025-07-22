@echo off
SETLOCAL ENABLEEXTENSIONS

REM === Get PC IP Address ===
FOR /F "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address"') do set IP=%%a
set IP=%IP: =%

echo Your PC IP Address: %IP%
echo Access the app from your phone at: http://%IP%:5173

REM === Step 1: Activate virtual environment if not already activated ===
IF NOT DEFINED VIRTUAL_ENV (
    CALL env\Scripts\activate.bat
)

REM === Step 2: Run python app.py in server\api ===
cd /d "%~dp0server\api"
start "" cmd /k "CALL ..\..\env\Scripts\activate.bat && python app.py"

REM === Step 3: Open new terminal and run npm run dev in frontend ===
cd /d "%~dp0frontend"
start "" cmd /k "npm run dev"

REM === Step 4: Open another terminal for object detection script ===
cd /d "%~dp0backend\occypancy_detection"
start "" cmd /k "CALL ..\..\env\Scripts\activate.bat && python object_detection_model.py"

ENDLOCAL
pause