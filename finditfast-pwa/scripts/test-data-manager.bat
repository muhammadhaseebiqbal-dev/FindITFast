@echo off
echo.
echo ==========================================
echo    FindItFast PWA - Test Data Manager
echo ==========================================
echo.

:MENU
echo Please choose an option:
echo.
echo 1. Populate test data
echo 2. Check test data status  
echo 3. Clean test data
echo 4. Clean ALL data (DANGER!)
echo 5. Show help
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto POPULATE
if "%choice%"=="2" goto STATUS
if "%choice%"=="3" goto CLEAN
if "%choice%"=="4" goto NUCLEAR
if "%choice%"=="5" goto HELP
if "%choice%"=="6" goto EXIT

echo Invalid choice. Please try again.
echo.
goto MENU

:POPULATE
echo.
echo Populating test data...
call npm run test:populate
echo.
pause
goto MENU

:STATUS
echo.
echo Checking test data status...
call npm run test:status
echo.
pause
goto MENU

:CLEAN
echo.
echo Cleaning test data...
call npm run test:clean
echo.
pause
goto MENU

:NUCLEAR
echo.
echo ⚠️  WARNING: NUCLEAR OPTION - THIS WILL DELETE ALL DATA!
echo.
set /p confirm="Are you absolutely sure? (yes/no): "
if not "%confirm%"=="yes" (
    echo Operation cancelled.
    echo.
    pause
    goto MENU
)
call npm run test:clean:all
echo.
pause
goto MENU

:HELP
echo.
echo ==========================================
echo                HELP
echo ==========================================
echo.
echo This tool helps you manage test data for the FindItFast PWA.
echo.
echo Options:
echo   1. Populate - Adds test stores, items, and owner accounts
echo   2. Status   - Shows current test data in database
echo   3. Clean    - Safely removes only test data
echo   4. Nuclear  - Removes ALL data (very dangerous!)
echo   5. Help     - Shows this help message
echo.
echo Test Owner Credentials:
echo   Email: owner1@test.com Password: TestPassword123!
echo   Email: owner2@test.com Password: TestPassword123!
echo.
echo For more information, see scripts/README.md
echo.
pause
goto MENU

:EXIT
echo.
echo Goodbye!
exit /b 0
