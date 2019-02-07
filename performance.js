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

const controllerPress = {
    LT: pressLow,
    RT: pressHigh,
    LB: pressFlat,
    RB: pressSharp,
    L:  pressDo,
    U:  pressRe,
    R:  pressMi,
    D:  pressFa,
    X:  pressSo,
    Y:  pressLa,
    B:  pressSi,
    A:  pressDD
};
const controllerRelease = {
    LT: releaseLow,
    RT: releaseHigh,
    LB: releaseFlat,
    RB: releaseSharp,
    L:  releaseDo,
    U:  releaseRe,
    R:  releaseMi,
    D:  releaseFa,
    X:  releaseSo,
    Y:  releaseLa,
    B:  releaseSi,
    A:  releaseDD
};

// 上一次刷新各个按键的状态。true：按下状态，false：松开状态
// let LT=false, RT=false, LB=false, RB=false;
let LT=false, RT=false, LB=false, RB=false;
let L=false, U=false, R=false, D=false;
let X=false, Y=false, B=false, A=false;
function updateStatus() {
    if (!haveEvents) {
        scangamepads();
    }

    for (let j in controllers) {
        var controller = controllers[j];
        let bs = controller.buttons;
        // 当前各个按键的状态
        let cLT=bs[6].pressed, cRT=bs[7].pressed, cLB=bs[4].pressed, cRB=bs[5].pressed;
        let cL=bs[14].pressed, cU=bs[12].pressed, cR=bs[15].pressed, cD=bs[13].pressed;
        let cX=bs[2].pressed, cY=bs[3].pressed, cB=bs[1].pressed, cA=bs[0].pressed;

        if(cLT && !LT) controllerPress.LT();
        if(cRT && !RT) controllerPress.RT();
        if(cLB && !LB) controllerPress.LB();
        if(cRB && !RB) controllerPress.RB();
        if(cL && !L) controllerPress.L();
        if(cU && !U) controllerPress.U();
        if(cR && !R) controllerPress.R();
        if(cD && !D) controllerPress.D();
        if(cX && !X) controllerPress.X();
        if(cY && !Y) controllerPress.Y();
        if(cB && !B) controllerPress.B();
        if(cA && !A) controllerPress.A();
        if(!cLT && LT) controllerRelease.LT();
        if(!cRT && RT) controllerRelease.RT();
        if(!cLB && LB) controllerRelease.LB();
        if(!cRB && RB) controllerRelease.RB();
        if(!cL && L) controllerRelease.L();
        if(!cU && U) controllerRelease.U();
        if(!cR && R) controllerRelease.R();
        if(!cD && D) controllerRelease.D();
        if(!cX && X) controllerRelease.X();
        if(!cY && Y) controllerRelease.Y();
        if(!cB && B) controllerRelease.B();
        if(!cA && A) controllerRelease.A();

        LT=cLT; RT=cRT; LB=cLB; RB=cRB; L=cL; U=cU; R=cR; D=cD; X=cX; Y=cY; B=cB; A=cA;
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
const keyboardAction = {
    low: 'ShiftLeft',
    flat: 'AltLeft',
    do: 'KeyA',
    re: 'KeyS',
    mi: 'KeyD',
    fa: 'KeyF',
    so: 'KeyJ',
    la: 'KeyK',
    si: 'KeyL',
    dd: 'Semicolon',
    sharp: 'AltRight',
    high: 'ShiftRight'
};
document.addEventListener('keydown', (e)=>{
    switch (e.code) {
        case keyboardAction.low: pressLow(); break;
        case keyboardAction.flat: pressFlat(); break;
        case keyboardAction.do: pressDo(); break;
        case keyboardAction.re: pressRe(); break;
        case keyboardAction.mi: pressMi(); break;
        case keyboardAction.fa: pressFa(); break;
        case keyboardAction.so: pressSo(); break;
        case keyboardAction.la: pressLa(); break;
        case keyboardAction.si: pressSi(); break;
        case keyboardAction.dd: pressDD(); break;
        default:
    }
});
document.addEventListener('keyup', (e)=>{
    switch (e.code) {
        case keyboardAction.low: releaseLow(); break;
        case keyboardAction.flat: releaseFlat(); break;
        case keyboardAction.do: releaseDo(); break;
        case keyboardAction.re: releaseRe(); break;
        case keyboardAction.mi: releaseMi(); break;
        case keyboardAction.fa: releaseFa(); break;
        case keyboardAction.so: releaseSo(); break;
        case keyboardAction.la: releaseLa(); break;
        case keyboardAction.si: releaseSi(); break;
        case keyboardAction.dd: releaseDD(); break;
        default:
    }
});
// 以上为键盘相关
