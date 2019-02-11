// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem, ipcMain} = require('electron');
const {appMenuTemplate} = require('./src/appmenu');
const {language} = require('./src/languages/selected');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, performanceWindow, keyMappingWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    const mainMenu = Menu.buildFromTemplate(appMenuTemplate);
    mainMenu.items[0].submenu.append(new MenuItem({ //menu.items获取是的主菜单一级菜单的菜单数组，menu.items[0]在这里就是第1个File菜单对象，在其子菜单submenu中添加新的子菜单
        label: language.new,
        click(){
            mainWindow.webContents.send('action', 'new'); //点击后向主页渲染进程发送“新建文件”的命令
        },
        accelerator: 'CmdOrCtrl+N' //快捷键：Ctrl+N
    }));
    //在New菜单后面添加名为Open的同级菜单
    mainMenu.items[0].submenu.append(new MenuItem({
        label: language.open,
        click(){
            mainWindow.webContents.send('action', 'open'); //点击后向主页渲染进程发送“打开文件”的命令
        },
        accelerator: 'CmdOrCtrl+O' //快捷键：Ctrl+O
    }));
    //再添加一个名为Save的同级菜单
    mainMenu.items[0].submenu.append(new MenuItem({
        label: language.save,
        click(){
            mainWindow.webContents.send('action', 'save'); //点击后向主页渲染进程发送“保存文件”的命令
        },
        accelerator: 'CmdOrCtrl+S' //快捷键：Ctrl+S
    }));
    mainMenu.items[0].submenu.append(new MenuItem({
        type: 'separator'
    }));
    mainMenu.items[0].submenu.append(new MenuItem({
        label: language.play,
        accelerator:'CmdOrCtrl+Shift+p',
        click: ()=>{
            mainWindow.webContents.send('action', 'play');
        }
    }));
    mainMenu.items[0].submenu.append(new MenuItem({
        label: language.perform,
        accelerator:'CmdOrCtrl+p',
        click(){
            creatPerformanceWindow(false);
        }
    }));
    mainMenu.items[0].submenu.append(new MenuItem({
        label: language.framelessPerform,
        accelerator:'CmdOrCtrl+Alt+p',
        click(){
            creatPerformanceWindow(true);
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

function creatPerformanceWindow(frameless)
{
    if(frameless)
        performanceWindow = new BrowserWindow({width:600, height: 150, transparent: true, frame: false, alwaysOnTop: true});
    else
        performanceWindow = new BrowserWindow({width:600, height:150});
    performanceWindow.loadFile('performance.html');
    const performanceMenuTemplate = [];
    for(let i=0; i<appMenuTemplate.length; i++)
    {
        if(i===1)
            continue;
        performanceMenuTemplate.push(appMenuTemplate[i]);
    }
    const performanceMenu = Menu.buildFromTemplate(performanceMenuTemplate);
    performanceMenu.items[0].submenu.append(new MenuItem({
        label: language.switchMode,
        accelerator: 'CmdOrCtrl+m',
        click: ()=>{
            performanceWindow.webContents.send('action', 'switchMode');
        }
    }));
    performanceMenu.items[0].submenu.append(new MenuItem({
        type: 'separator'
    }));
    performanceMenu.items[0].submenu.append(new MenuItem({
        label: language.aidPerform,
        accelerator: 'CmdOrCtrl+p',
        click: ()=>{
            mainWindow.webContents.send('action', 'prepareAidPerform');
        }
    }));
    performanceMenu.items[0].submenu.append(new MenuItem({
        label: language.start,
        accelerator: 'CmdOrCtrl+s',
        click: ()=>{
            performanceWindow.webContents.send('action', 'start');
        }
    }));
    performanceMenu.append(new MenuItem({
    label: language.keyMapping,
    click(){
        // keyMappingWindow = new BrowserWindow({width:400, height:300, parent: performanceWindow});
        keyMappingWindow = new BrowserWindow({width:400, height:300});
        keyMappingWindow.loadFile('keyMapping.html');
    },
    accelerator: 'CmdOrCtrl+N' //快捷键：Ctrl+N
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

ipcMain.on('notesPrepared', (event, notes)=>{
    performanceWindow.setBounds({height: 600});
    performanceWindow.center();
    performanceWindow.webContents.send('notes', notes);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
