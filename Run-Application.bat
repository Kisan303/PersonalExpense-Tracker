@echo off
:: Turns off command echoing in the terminal for a cleaner display

echo Starting ExpenseEase Server...
:: Prints a message indicating that the server is starting

:: Change directory to the location of this .bat file
cd /d %~dp0
:: %~dp0 is a built-in variable that gets the drive and path of this batch file's location
:: /d allows changing drive if necessary

:: Check if package.json exists in the current directory (which confirms this is the project folder)
if not exist package.json (
    echo.
    echo ERROR: package.json not found. 
    echo Please make sure this .bat file is saved in your ExpenseEase project folder.
    pause
    exit /b
)

:: Run the npm run dev command to start the development server
npm run dev
:: This will use the "dev" script defined in package.json:
:: "dev": "cross-env NODE_ENV=development tsx server/index.ts"

:: Keep the command window open after the server stops or in case of errors
pause
