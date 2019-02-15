const { ipcRenderer, remote} = require('electron');
const { Menu, MenuItem, dialog } = remote;
const Katex = require('katex');
const path = require('path');
const {replaceWithLatex} = require('./src/functions/preprocessNotes');
const {getPlayEvents} = require('./src/functions/SoundfontEventsProvider');
const {parseHead} = require('./src/functions/header');
const {language} = require('./src/languages/selected');
const {parseContent} = require('./src/functions/parseContent');

const editArea = document.getElementById('editArea');
const title = document.getElementById('title');
const composer = document.getElementById('composer');
const compiler = document.getElementById('compiler');
const bpm_beatInfo = document.getElementById('bpm_beatInfo');
const katexDisplayArea = document.getElementById('katexDisplayArea');

let currentFile = null;
let isSaved = true;

let parsedContent = {};

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

function drawDisplayArea()
{
    // TODO:
    let headInfo = parsedContent.headInfo;
    title.innerText = headInfo.title;
    composer.innerText = headInfo.composer;
    bpm_beatInfo.innerText = 'bpm='+headInfo.bpm + ' '
        + headInfo.beatInfo.beatsNumber + '/' + headInfo.beatInfo.baseBeat*4;


    katexDisplayArea.innerText = '';
    for(let latexLine of parsedContent.getLatexBody())
    {
        let newDiv = document.createElement('div');
        katexDisplayArea.appendChild(newDiv);
        Katex.render(latexLine, newDiv);
    }
    // 重新对latex代码进行排版
    let katex_htmls = document.getElementsByClassName('katex-html');
    for(let katex_html of katex_htmls)
    {
        let newKatex_htmlContent = '';
        for(let base of katex_html.children)
            newKatex_htmlContent += base.innerHTML;
        katex_html.innerHTML = newKatex_htmlContent;
    }
}

parsedContent = parseContent(editor);
drawDisplayArea();

editor.on('change', ()=>{
    if(isSaved)
        document.title += ' *';
    isSaved = false;
    parsedContent = parseContent(editor);
    drawDisplayArea();
});

document.title = language.appName + ' - ' + language.untitled; // 设置文档标题，影响窗口标题栏名称

// 给文本框增加右键菜单
const contextMenuTemplate = [
    { label: language.undo, role: 'undo' },
    { label: language.cut, role: 'cut' },
    { label: language.copy, role: 'copy' },
    { label: language.paste, role: 'paste' },
    { label: language.selectall, role: 'selectall' }
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
                // TODO:
                // let headInfo = parseHead(editor.getValue());
                // player.schedule(audioContext.currentTime, getPlayEvents(editor.getValue(), headInfo));
            }
            break;
        case 'prepareAidPerform':
            ipcRenderer.send('notesPrepared', editor.getValue());
            break;
        case 'new': // 新建文件
            askSaveIfNeed();
            currentFile = null;
            editor.setValue('');
            document.title = language.appName + ' - ' + language.untitled;
            // remote.getCurrentWindow().setTitle(language.appName + ' - ' + language.untitled + ' *');
            isSaved = true;
            break;
        case 'open': // 打开文件
            askSaveIfNeed();
            const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                filters: [
                    { name: 'Text Files', extensions: ['pu'] },
                    { name: 'All Files', extensions: ['*'] }],
                properties: ['openFile'],
            });
            if (files) {
                currentFile = files[0];
                const txtRead = readText(currentFile);
                editor.setValue(txtRead);
                document.title = `${language.appName} - ${currentFile}`;
                isSaved = true;
            }
            break;
        case 'save': // 保存文件
            saveCurrentDoc();
            break;
        case 'closing':
            askSaveIfNeed();
            ipcRenderer.send('mainWindowAction', 'destroy');
            break;
        default:
    }
});

// 读取文本文件
function readText(file) {
    const fs = require('fs');
    return fs.readFileSync(file, 'utf8');
}
// 保存文本内容到文件
function saveText(text, file) {
    const fs = require('fs');
    fs.writeFileSync(file, text);
}

// 保存当前文档
function saveCurrentDoc() {
    if (!currentFile) {
        const file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
            filters: [
                { name: 'Text Files', extensions: ['pu'] },
                { name: 'All Files', extensions: ['*'] }],
        });
        if (file) currentFile = file;
    }
    if (currentFile) {
        const txtSave = editor.getValue();
        saveText(txtSave, currentFile);
        isSaved = true;
        document.title = `${language.appName} - ${currentFile}`;
    }
}

// 如果需要保存，弹出保存对话框询问用户是否保存当前文档
function askSaveIfNeed() {
    if (isSaved) return;
    const response = dialog.showMessageBox(remote.getCurrentWindow(), {
        message: language.saveAlert,
        type: 'question',
        buttons: [language.yes, language.no],
    });
    if (response === 0) saveCurrentDoc(); // 点击Yes按钮后保存当前文档
}
