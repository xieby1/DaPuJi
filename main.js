// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem, ipcMain} = require('electron');
const {appMenuTemplate} = require('./src/appmenu');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, performanceWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600})

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    const mainMenu = Menu.buildFromTemplate(appMenuTemplate);
    mainMenu.items[0].submenu.append(new MenuItem({
        label: 'Play',
        accelerator:'CmdOrCtrl+Shift+p',
        click: ()=>{
            mainWindow.webContents.send('action', 'play');
        }
    }));
    mainMenu.items[0].submenu.append(new MenuItem({
        label: 'Perform',
        accelerator:'CmdOrCtrl+p',
        click(){
            creatPerformanceWindow();
        }
    }));
    mainWindow.setMenu(mainMenu);

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

function creatPerformanceWindow(menu)
{
    performanceWindow = new BrowserWindow({width:600, height:300});
    performanceWindow.loadFile('performance.html');
    const performanceMenu = Menu.buildFromTemplate(appMenuTemplate);
    performanceMenu.items[0].submenu.append(new MenuItem({
        label: 'Switch Mode',
        accelerator: 'CmdOrCtrl+s',
        click: ()=>{
            performanceWindow.webContents.send('action', 'switchMode');
        }
    }));
    performanceWindow.setMenu(performanceMenu);
    performanceWindow.on('closed', function () {
        performanceWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

ipcMain.on('performanceAction', (event, arg)=>{
    switch (arg) {
        case 'resizeFull':
            performanceWindow.setBounds({width: 1200});
            performanceWindow.center();
            break;
        case 'resizeFolded':
            performanceWindow.setBounds({width: 600});
            performanceWindow.center();
            break;
        default:
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
