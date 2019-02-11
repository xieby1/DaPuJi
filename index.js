const { ipcRenderer, remote} = require('electron');
const { Menu, MenuItem, dialog } = remote;
const Katex = require('katex');
const path = require('path');
const {replaceWithLatex} = require('./src/functions/preprocessNotes');
const {getPlayEvents} = require('./src/functions/SoundfontEventsProvider');
const {parseHead} = require('./src/functions/header');

const editArea = document.getElementById('editArea');
const title = document.getElementById('title');
const composer = document.getElementById('composer');
const compiler = document.getElementById('compiler');
const bpm_beatInfo = document.getElementById('bpm_beatInfo');

const editor = CodeMirror(editArea, {
    // 编辑器的初始内容
    value: 'title = "To Zanarkand - 片段"\n' +
        'bpm = 92 beatInfo={3/4}\n' +
        '\n' +
        '3+/ 3/ 5/ 7/ 3+/ 4#/+ 5+..\n' +
        '2+/ 2/ 4#/ 6/ 2+/ 3+/ 4+#..\n' +
        '7 7 7 7 6/. 2+/ 4#..\n' +
        '3+ 3+ 3+ 3+ 2+ 5+ 1+..',
    mode: 'musicnotes',
    lineWrapping: 'true',
    lineNumbers: 'true',
});

let player;
const audioContext = new AudioContext();
Soundfont.instrument(audioContext, path.join(__dirname, 'lib', 'instruments','acoustic_grand_piano-mp3.js'),{}).then(function (playerReady) {
    player = playerReady;
});

editor.on('change', (cm)=>{
    let content = cm.getValue();
    let headInfo = parseHead(content);
    title.innerText = headInfo.title;
    composer.innerText = headInfo.composer;
    bpm_beatInfo.innerText = 'bpm='+headInfo.bpm + ' '
        + headInfo.beatInfo.beatsNumber + '/' + headInfo.beatInfo.baseBeat*4;
    Katex.render(replaceWithLatex(content, headInfo), document.getElementById('katexDisplayArea'));

    // 重新对latex代码进行排版
    let katex_htmls = document.getElementsByClassName('katex-html');
    for(let katex_html of katex_htmls)
    {
        let newKatex_htmlContent = '';
        for(let base of katex_html.children)
            newKatex_htmlContent += base.innerHTML;
        katex_html.innerHTML = newKatex_htmlContent;
    }
});

document.title = 'Notepad - Untitled'; // 设置文档标题，影响窗口标题栏名称

// 给文本框增加右键菜单
const contextMenuTemplate = [
    { role: 'undo' },       // Undo菜单项
    { role: 'redo' },       // Redo菜单项
    { type: 'separator' },  // 分隔线
    { role: 'cut' },        // Cut菜单项
    { role: 'copy' },       // Copy菜单项
    { role: 'paste' },      // Paste菜单项
    { role: 'delete' },     // Delete菜单项
    { type: 'separator' },  // 分隔线
    { role: 'selectall' },   // Select All菜单项
];
const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
document.getElementById('body').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.popup();
});



// 监听与主进程的通信
ipcRenderer.on('action', (event, arg) => {
    switch (arg) {
        case 'play':
            if(player!=null)
            {
                let headInfo = parseHead(editor.getValue());
                player.schedule(audioContext.currentTime, getPlayEvents(editor.getValue(), headInfo));
            }
            break;
        case 'prepareAidPerform':
            ipcRenderer.send('notesPrepared', editor.getValue());
            break;
        default:
    }
    // switch (arg) {
    //     case 'new': // 新建文件
    //         askSaveIfNeed();
    //         currentFile = null;
    //         txtEditor.value = '';
    //         document.title = 'Notepad - Untitled';
    //         // remote.getCurrentWindow().setTitle("Notepad - Untitled *");
    //         isSaved = true;
    //         break;
    //     case 'open': // 打开文件
    //         askSaveIfNeed();
    //         const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    //             filters: [
    //                 { name: 'Text Files', extensions: ['txt', 'js', 'html', 'md'] },
    //                 { name: 'All Files', extensions: ['*'] }],
    //             properties: ['openFile'],
    //         });
    //         if (files) {
    //             currentFile = files[0];
    //             const txtRead = readText(currentFile);
    //             txtEditor.value = txtRead;
    //             document.title = `Notepad - ${currentFile}`;
    //             isSaved = true;
    //         }
    //         break;
    //     case 'save': // 保存文件
    //         saveCurrentDoc();
    //         break;
    //     case 'exiting':
    //         askSaveIfNeed();
    //         ipcRenderer.sendSync('reqaction', 'exit');
    //         break;
    // }
});

// // 读取文本文件
// function readText(file) {
//     const fs = require('fs');
//     return fs.readFileSync(file, 'utf8');
// }
// // 保存文本内容到文件
// function saveText(text, file) {
//     const fs = require('fs');
//     fs.writeFileSync(file, text);
// }
//
// // 保存当前文档
// function saveCurrentDoc() {
//     if (!currentFile) {
//         const file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
//             filters: [
//                 { name: 'Text Files', extensions: ['txt', 'js', 'html', 'md'] },
//                 { name: 'All Files', extensions: ['*'] }],
//         });
//         if (file) currentFile = file;
//     }
//     if (currentFile) {
//         const txtSave = txtEditor.value;
//         saveText(txtSave, currentFile);
//         isSaved = true;
//         document.title = `Notepad - ${currentFile}`;
//     }
// }
//
// // 如果需要保存，弹出保存对话框询问用户是否保存当前文档
// function askSaveIfNeed() {
//     if (isSaved) return;
//     const response = dialog.showMessageBox(remote.getCurrentWindow(), {
//         message: 'Do you want to save the current document?',
//         type: 'question',
//         buttons: ['Yes', 'No'],
//     });
//     if (response == 0) saveCurrentDoc(); // 点击Yes按钮后保存当前文档
// }
