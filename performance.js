// 以下手柄相关
var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

function connecthandler(e) {
    controllers[e.gamepad.index] = e.gamepad;
    requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
    delete controllers[e.gamepad.index];
}
const ControllerTemplate = {
    LT: 'low', LB: 'flat', RB: 'sharp', RT: 'high',
    L: 'do', U: 're', R: 'mi', D: 'fa',
    X: 'so', Y: 'la', B: 'si', A: 'dd'
};
const ControllerPress = {};
const ControllerRelease = {};
for(let key in ControllerTemplate)
{
    ControllerPress[key] = FuncPress[ControllerTemplate[key]];
    ControllerRelease[key] = FuncRelease[ControllerTemplate[key]];
}

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
        scangamepads();
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

function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            if (gamepads[i].index in controllers) {
                controllers[gamepads[i].index] = gamepads[i];
            } else {
                addgamepad(gamepads[i]);
            }
        }
    }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
    setInterval(scangamepads, 500);
}
// 以上为手柄相关
// 以下为键盘相关
const KeyboardAction = {
    low: 'ShiftLeft', flat: 'AltLeft', sharp: 'AltRight', high: 'ShiftRight',
    do: 'KeyA', re: 'KeyS', mi: 'KeyD', fa: 'KeyF',
    so: 'KeyJ', la: 'KeyK', si: 'KeyL', dd: 'Semicolon'
};
document.addEventListener('keydown', (e)=>{
    for(let key in KeyboardAction)
        if(e.code === KeyboardAction[key])
            FuncPress[key]();
});
document.addEventListener('keyup', (e)=>{

    for(let key in KeyboardAction)
        if(e.code === KeyboardAction[key])
            FuncRelease[key]();
});
// 以上为键盘相关
