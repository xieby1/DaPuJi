const { ipcRenderer, remote } = require('electron');
// true-left, false-right
const InstrumentLayoutStatus = {fullOrFolded: false, keyboardOrController: false};

// 以下为滚动区域相关
let notes = '';
let playEvents = [];
let aheadOfTime = 3000; // ms
let startTime = 0;
let refreshFunc = ()=>{};
// 怠速 idling。让scrollArea一直刷新，直到刷新函数为有效时就可显示图像
let isLooping = false;
function startScrollAreaLoop() {
    refreshFunc();
    requestAnimationFrame(startScrollAreaLoop);
}
const scrollArea = document.getElementById('scrollArea');
scrollArea.setAttribute('draggable', 'true');
let scrollAreaMoveX, scrollAreaMoveY;
scrollArea.addEventListener('dragstart', (event)=>{
    scrollAreaMoveX = event.screenX;
    scrollAreaMoveY = event.screenY;
});
scrollArea.addEventListener('dragend', (event)=>{
    scrollAreaMoveX -= event.screenX;
    scrollAreaMoveY -= event.screenY;
    let currentWindow = remote.getCurrentWindow();
    let currentX = currentWindow.getPosition()[0];
    let currentY = currentWindow.getPosition()[1];
    currentWindow.setPosition(currentX-scrollAreaMoveX, currentY-scrollAreaMoveY);
});
function drawScrollArea(relativeTime){
    // 解除loop, 最后一个音的1.1倍时间后解除
    if(relativeTime > 1100*playEvents[playEvents.length-1].time)
        refreshFunc = ()=>{};
    // clean scroll area
    scrollArea.innerText = '';
    let scrollAreaHeight = scrollArea.offsetHeight;
    for(let e of playEvents)
    {
        let deltaTime = e.time*1000 - relativeTime;
        let midi = e.note;
        if(midi-do1<-12 || midi-do1>24)
        {
            // TODO: out of range !!!
        }


        let keyDOM;
        function addAScrollBar(keydom) {
            if(keydom==null)
                return;
            let scrollBarDOM = document.createElement('div');
            let scrollBarWidth = keydom.offsetWidth;
            let scrollBarHeight= scrollBarWidth * 0.314;
            let scrollBarToBottom = deltaTime/aheadOfTime*scrollAreaHeight - scrollBarWidth/2;
            let scrollBarOffsetLeft = keydom.offsetLeft;

            if(scrollBarToBottom + scrollBarHeight > 0 && scrollBarToBottom<scrollAreaHeight)
            {
                scrollBarDOM.setAttribute('style',
                    'position: absolute; ' +
                    'left:' + scrollBarOffsetLeft + 'px;' +
                    'bottom:' + (scrollBarToBottom+120) + 'px;' +
                    'width:' + scrollBarWidth + 'px;' +
                    'height:' + scrollBarHeight + 'px;' +
                    'background-color: red;');
                scrollBarDOM.setAttribute('class', 'scrollBar');
                scrollArea.appendChild(scrollBarDOM);
            }
        }
        if(InstrumentLayoutStatus.fullOrFolded)
        { // full mode
            for(let key in KeyboardModeTemplate)
            {
                if(KeyboardModeTemplate[key]==null)
                    continue;
                if(do1+KeyboardModeTemplate[key]===midi)
                {
                    keyDOM = Keys[key];
                    break;
                }
            }
            addAScrollBar(keyDOM);
        }
        else
        { // folded mode
            let isSharp = false;
            let isHigh = false;
            let isLow = false;
            if(midi-do1<0)
            {
                isLow = true;
                midi += 12;
            }
            else if(midi-do1>12)
            {
                isHigh = true;
                midi -= 12;
            }
            for(let key in ControllerModeTemplate)
            {
                if(ControllerModeTemplate[key]==null)
                    continue;
                if(do1+ControllerModeTemplate[key]===midi)
                {
                    keyDOM = Keys[key];
                    break;
                }
            }
            if(keyDOM==null)
            {
                isSharp = true;

                for(let key in ControllerModeTemplate)
                {
                    if(ControllerModeTemplate[key]==null)
                        continue;
                    if(do1+ControllerModeTemplate[key]+1===midi)
                    {
                        keyDOM = Keys[key];
                        break;
                    }
                }
            }
            addAScrollBar(keyDOM);
            if(isSharp)
                addAScrollBar(Keys['sharp']);
            if(isHigh)
                addAScrollBar(Keys['high']);
            if(isLow)
                addAScrollBar(Keys['low']);
        }
    }
}
// 以上为滚动区域相关

// 以下手柄相关
let haveEvents = 'ongamepadconnected' in window;
let controllers = {};

function connectHandler(e) {
    controllers[e.gamepad.index] = e.gamepad;
    requestAnimationFrame(updateStatus);
}

function disconnectHandler(e) {
    delete controllers[e.gamepad.index];
}
let ControllerTemplate = require('./src/settings/keyMappingSetting').keyMapping.controller;

switchToFoldedMode();
refreshControllerButtonTag();

const ControllerPress = {};
const ControllerRelease = {};

function refreshControllerButtonMapping() {
    for(let key in ControllerTemplate)
    {
        ControllerTemplate = require('./src/settings/keyMappingSetting').keyMapping.controller;
        ControllerPress[key] = ()=>{
            if(InstrumentLayoutStatus.keyboardOrController)
            {
                refreshControllerButtonTag();
                InstrumentLayoutStatus.keyboardOrController = false;
            }
            FuncPress[ControllerTemplate[key]]();
        };
        ControllerRelease[key] = FuncRelease[ControllerTemplate[key]];
    }
    refreshControllerButtonTag();
}
refreshControllerButtonMapping();

const ControllerPreFlags = {}; // 上一次刷新各个按键的状态。true：按下状态，false：松开状态
const ControllerCurFlags = {}; // 本次刷新时各个按键的状态。
for(let key in ControllerTemplate)
    ControllerPreFlags[key] = false;
const ControllerButtonNum = {
    LT: 6, LB: 4, RB: 5, RT: 7,
    L: 14, U: 12, R: 15, D: 13,
    X: 2, Y: 3, B: 1, A: 0
};

function updateStatus() {
    if (!haveEvents) {
        scanGamepads();
    }

    for (let j in controllers) {
        let controller = controllers[j];
        for(let key in ControllerTemplate) // 当前各个按键的状态
            ControllerCurFlags[key] = controller.buttons[ ControllerButtonNum[key] ].pressed;
        for(let key in ControllerTemplate)
        {
            if(ControllerCurFlags[key] && !ControllerPreFlags[key])
                ControllerPress[key]();
            if(!ControllerCurFlags[key] && ControllerPreFlags[key])
                ControllerRelease[key]();
        }
        for(let key in ControllerTemplate) // 本次按键状态变成上一次按键状态
            ControllerPreFlags[key] = ControllerCurFlags[key];
    }

    requestAnimationFrame(updateStatus);
}

function addGamepad(gamepad) {
    controllers[gamepad.index] = gamepad;
}

function scanGamepads() {
    let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            if (gamepads[i].index in controllers) {
                controllers[gamepads[i].index] = gamepads[i];
            } else {
                addGamepad(gamepads[i]);
            }
        }
    }
}

window.addEventListener("gamepadconnected", connectHandler);
window.addEventListener("gamepaddisconnected", disconnectHandler);

if (!haveEvents) {
    setInterval(scanGamepads, 500);
}
// 以上为手柄相关
// 以下为键盘相关
// creatAKeyBoardAction
let KeyboardAction;
function refreshKeyboardMapping()
{
    KeyboardAction = require('./src/settings/keyMappingSetting').keyMapping.keyboard;
}
refreshKeyboardMapping();

document.addEventListener('keydown', (e)=>{
    if(!InstrumentLayoutStatus.keyboardOrController)
    {
        refreshKeyboardButtonTag();
        InstrumentLayoutStatus.keyboardOrController = true;
    }
    for(let key in KeyboardAction)
        if(e.code === KeyboardAction[key].code)
            FuncPress[key]();
});
document.addEventListener('keyup', (e)=>{

    for(let key in KeyboardAction)
        if(e.code === KeyboardAction[key].code)
            FuncRelease[key]();
});
// 以上为键盘相关
function refreshKeyboardButtonTag()
{
    for(let key in KeyboardModeTemplate)
    {
        for(let elem of Keys[key].children)
        {
            if(elem.className==='key')
            {
                elem.innerText = KeyboardAction[key]['key'];
                break;
            }
        }
    }
}
function refreshControllerButtonTag()
{
    for(let button in ControllerTemplate)
    {
        let key = ControllerTemplate[button];
        for(let elem of Keys[key].children)
        {
            if(elem.className==='key')
            {
                elem.innerText = button;
                break;
            }
        }
    }
}

// 监听与主进程的通信
ipcRenderer.on('action', (event, arg) => {
    switch (arg) {
        case 'switchMode':
            if(InstrumentLayoutStatus.fullOrFolded)
            {
                ipcRenderer.send('performanceAction', 'resizeFolded');
                switchToFoldedMode();
                InstrumentLayoutStatus.fullOrFolded = false;
            }
            else
            {
                ipcRenderer.send('performanceAction', 'resizeFull');
                switchToFullMode();
                InstrumentLayoutStatus.fullOrFolded = true;
            }
            break;
        case 'start':
            startTime = (new Date()).getTime();
            refreshFunc = ()=>{
                drawScrollArea((new Date()).getTime()-startTime-aheadOfTime);
            };
            break;
        case 'refreshKeyMapping':
            refreshControllerButtonMapping();
            refreshKeyboardMapping();
            break;
        case 'toggleMute':
            toggleMute();
            break;
        default:
    }
});

ipcRenderer.on('notes', (event, pe)=>{
    playEvents = pe;
    drawScrollArea(-aheadOfTime);
    if(!isLooping)
        startScrollAreaLoop();
    isLooping = true;
});
