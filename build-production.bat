@echo off
REM TorqueNinja Production Build Script for cPanel Deployment (Windows)
REM Target: cms.torquesticker.com

echo ========================================================================
echo Building TorqueNinja for Production (cms.torquesticker.com)
echo ========================================================================
echo.

REM Step 1: Clean previous builds
echo Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist torqueninja-production.zip del torqueninja-production.zip

REM Step 2: Copy production environment
echo.
echo Setting up production environment...
copy /y deployments\cpanel\.env.production .env

REM Step 3: Install dependencies
echo.
echo Installing dependencies...
call npm install

REM Step 4: Run production build
echo.
echo Building application...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed! Please fix errors and try again.
    exit /b 1
)

REM Step 5: Copy deployment files to dist
echo.
echo Copying deployment files...
copy /y deployments\cpanel\.htaccess dist\.htaccess
if exist public\logo.png copy /y public\logo.png dist\logo.png
if exist public\favicon.ico copy /y public\favicon.ico dist\favicon.ico

REM Step 6: Instructions for creating ZIP (Windows doesn't have built-in zip command)
echo.
echo ========================================================================
echo Build complete! Now create the ZIP file:
echo ========================================================================
echo.
echo Option 1: Using Windows Explorer
echo   1. Open the 'dist' folder
echo   2. Select ALL files and folders inside (Ctrl+A)
echo   3. Right-click and select "Send to" ^> "Compressed (zipped) folder"
echo   4. Name it: torqueninja-production.zip
echo   5. Move it to the project root folder
echo.
echo Option 2: Using PowerShell
echo   Run this command in PowerShell:
echo   Compress-Archive -Path .\dist\* -DestinationPath .\torqueninja-production.zip -Force
echo.
echo ========================================================================
echo Deployment Information
echo ========================================================================
echo.
echo Package Name: torqueninja-production.zip
echo Target Domain: cms.torquesticker.com
echo cPanel Path: /public_html/cms/
echo.
echo Next Steps:
echo 1. Login to your cPanel
echo 2. Go to File Manager - /public_html/cms/
echo 3. Backup existing files (if any)
echo 4. Upload torqueninja-production.zip
echo 5. Extract the ZIP file
echo 6. Set permissions (755 for folders, 644 for files)
echo 7. Visit https://cms.torquesticker.com to test
echo.
echo Full guide: deployments\cpanel\DEPLOYMENT-GUIDE.md
echo Security fixes: SECURITY-FIXES.md
echo.
pause
