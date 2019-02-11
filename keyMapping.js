const { ipcRenderer, remote} = require('electron');
const { dialog } = remote;
const {language} = require('./src/languages/selected');

let isSaved = true;
const ControllerModeTemplate = require('./src/settings/template').ControllerMode;
const KeyboardBlackTemplate = require('./src/settings/template').KeyboardBlack;
const KeyboardWhiteTemplate = require('./src/settings/template').KeyboardWhite;

const keyboardSettingDOM = document.getElementById('keyboardSetting');
const controllerSettingDOM = document.getElementById('controllerSetting');

const KeyboardMapping = require('./src/settings/keyMappingSetting').keyMapping.keyboard;
const ControllerMapping = require('./src/settings/keyMappingSetting').keyMapping.controller;

const noneNote = {low: null, flat: null, sharp:null, high:null};

// keyboard
let whichInputDOMIsWaitingAKey = null;
let whichNote = null;
// actually it is a button
function createInputInTableData(note, defaultKey) {
    let tempInput = document.createElement('input');
    tempInput.setAttribute('id', note);
    tempInput.setAttribute('type', 'button');
    tempInput.setAttribute('value', defaultKey);
    function tempOncePressKeyboard(event){
        // 交换可能存在的冲突键和本次修改的按键之前的值
        // 寻找是否存在冲突按键
        let conflictNote;
        let conflictInputDOM;
        for(let note in KeyboardMapping)
        {
            if(event.code === KeyboardMapping[note].code)
            {
                conflictNote = note;
                conflictInputDOM = document.getElementById(note);
                break;
            }
        }
        // 如果存在冲突按键
        if(conflictInputDOM!=null)
        {
            // 交换冲突键和当前按键原来的值
            KeyboardMapping[conflictNote].key = KeyboardMapping[whichNote].key;
            KeyboardMapping[conflictNote].code = KeyboardMapping[whichNote].code;
            conflictInputDOM.setAttribute('value', KeyboardMapping[whichNote].key);
        }

        KeyboardMapping[whichNote].key = event.key;
        KeyboardMapping[whichNote].code = event.code;
        whichInputDOMIsWaitingAKey.setAttribute('value', event.key);

        let titleAreaDOM = document.getElementById('titleArea');
        titleAreaDOM.innerText = language.keyMapping;

        document.removeEventListener('keydown', tempOncePressKeyboard);
        whichInputDOMIsWaitingAKey = null;
        whichNote = null;
    }
    tempInput.addEventListener('click', (event)=>{
        if(whichInputDOMIsWaitingAKey!=null)
            return;
        let titleAreaDOM = document.getElementById('titleArea');
        titleAreaDOM.innerText = language.pressYourKey;
        document.addEventListener('keydown', tempOncePressKeyboard);
        whichInputDOMIsWaitingAKey = event.target;
        whichNote = whichInputDOMIsWaitingAKey.getAttribute('id');
    });
    let inputWithName = document.createElement('td');
    inputWithName.innerText = note + ':';
    inputWithName.appendChild(tempInput);

    return inputWithName;
}

// white keys
let tempLength = [9, 8, 9];
let tempRow = 0;
let tempCol = 0;
let keyboardTableRow;
for(let note in KeyboardWhiteTemplate)
{
    if(tempRow===0)
        keyboardTableRow = document.createElement('tr');

    keyboardTableRow.appendChild(createInputInTableData(note, KeyboardMapping[note].key));

    tempRow++;
    if(tempLength[tempCol]===tempRow)
    {
        keyboardSettingDOM.appendChild(keyboardTableRow);
        tempRow = 0;
        tempCol++;
    }
}
// black keys
tempLength = [5, 5, 5];
tempRow = 0;
tempCol = 0;
for(let note in KeyboardBlackTemplate)
{
    if(tempRow===0)
        keyboardTableRow = document.createElement('tr');

    keyboardTableRow.appendChild(createInputInTableData(note, KeyboardMapping[note].key));

    tempRow++;
    if(tempLength[tempCol]===tempRow)
    {
        keyboardSettingDOM.appendChild(keyboardTableRow);
        tempRow = 0;
        tempCol++;
    }
}
// end of keyboard


// controller
function createSelectInTableData(button, defaultSelectedKey) {
    let tempSelect = document.createElement('select');
    tempSelect.setAttribute('id', button);
    for(let key in ControllerModeTemplate)
    {
        if(key in noneNote && defaultSelectedKey in noneNote ||
            !(key in noneNote) && !(defaultSelectedKey in noneNote))
        {
            let option = document.createElement('option');
            option.innerText = key;
            tempSelect.appendChild(option);
            if(defaultSelectedKey!=null && defaultSelectedKey===key)
                option.setAttribute('selected', 'selected');
        }
    }
    // tempSelect.setAttribute('onchange', 'alert(this.selectedIndex);');
    tempSelect.addEventListener('change', (event)=>{
        // 与映射相同的按键进行交换
        let selectDOM = event.target;
        let selectIndex = selectDOM.selectedIndex;
        let selectKey = selectDOM.options[selectIndex].text;
        let thisButton = selectDOM.id;
        // 找到映射相同的按键
        let anotherSelectDOM;
        let anotherButton;
        for(let button in ControllerMapping)
        {
            if(ControllerMapping[button] === selectKey)
            {
                anotherSelectDOM = document.getElementById(button);
                anotherButton = button;
                break;
            }
        }
        // 交换改变了的按键映射之前的映射和与其相同的按键映射
        ControllerMapping[anotherButton] = ControllerMapping[thisButton];
        for(let option of anotherSelectDOM.options)
        {
            if(option.text === ControllerMapping[anotherButton])
            {
                option.selected = true;
                break;
            }
        }
        ControllerMapping[thisButton] = selectKey;
    });

    let selectWithName = document.createElement('td');
    selectWithName.innerText = button+':';
    selectWithName.appendChild(tempSelect);
    return selectWithName;
}

let tempCounter = 0;
let controllerTableRow;
for(let button in ControllerMapping)
{
    if(tempCounter%4 === 0)
        controllerTableRow = document.createElement('tr');
    let key = ControllerMapping[button];
    controllerTableRow.appendChild(createSelectInTableData(button, key));
    if(tempCounter%4 === 3)
        controllerSettingDOM.appendChild(controllerTableRow);
    tempCounter++;
}
// end of controller

ipcRenderer.on('action', (event, arg)=>{
    switch (arg) {
        case 'closing':
            const response = dialog.showMessageBox(remote.getCurrentWindow(), {
                message: language.saveAlert,
                type: 'question',
                buttons: [language.yes, language.no],
            });
            if (response === 0)
            {
                let fileAddress = './src/settings/keyMappingSetting.js';
                let keyMappingText = 'module.exports.keyMapping = {\n controller: ';
                keyMappingText += ControllerMappingToString() + ',\n';
                keyMappingText += 'keyboard: ';
                keyMappingText += KeyboardMappingToString() + '};';
                const fs = require('fs');
                fs.writeFileSync(fileAddress, keyMappingText);
            }
            ipcRenderer.send('keyMappingAction', 'destroy');
            break;
        default:
    }
});


function ControllerMappingToString() {
    let result = '{\n';
    for(let key in ControllerMapping)
    {
        let note = ControllerMapping[key];
        result += key + ': "' + note + '",\n'
    }
    result += '}';
    return result;
}

function KeyboardMappingToString() {
    let result = '{\n';
    for(let note in KeyboardMapping)
    {
        let obj = KeyboardMapping[note];
        result += note + ': {key: "' + obj.key + '", code: "' + obj.code + '"},\n';
    }
    result += '}';
    return result;
}
