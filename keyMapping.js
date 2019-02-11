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
function createInputInTableData(note, keyName) {
    let tempInput = document.createElement('input');
    tempInput.setAttribute('id', note);
    tempInput.setAttribute('maxlength', '1');

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
