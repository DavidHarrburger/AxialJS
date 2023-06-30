console.log("Hello Electron App");

const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function initWindow()
{
    const mainWindowOptions = 
    {
        width: 600,
        height: 360,
        resizable: false,
        minimizable: true,
        maximizable: false,
        title: "Axial Minifier",
        webPreferences:
        {
            preload: path.join(__dirname, "main-preload.js")
        }

    }
    const mainWindow = new BrowserWindow( mainWindowOptions );
    mainWindow.loadFile("./build/index.html");
}

async function initElectronApp()
{
    try
    {
        await app.whenReady();
        initWindow();

        app.on("activate", electronAppActivateHandler);
        app.on("window-all-closed", electronAppWindowAllClosedHandler);

        //Menu.setApplicationMenu(null);
    }
    catch(err)
    {
        console.log(err);
    }
}

function electronAppActivateHandler()
{
    if( BrowserWindow.getAllWindows().length === 0 )
    {
        initWindow();
    }
}

function electronAppWindowAllClosedHandler()
{
    if( process.platform !== "darwin" )
    {
        app.quit();
    }
}

initElectronApp();