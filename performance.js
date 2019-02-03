var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

function connecthandler(e) {
    controllers[e.gamepad.index] = e.gamepad;
    requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
    delete controllers[e.gamepad.index];
}


// 各个琴键在窗口里对应的对象(DOM)
const lowKey    = document.getElementById('low');
const flatKey   = document.getElementById('flat');
const doKey     = document.getElementById('do');
const reKey     = document.getElementById('re');
const miKey     = document.getElementById('mi');
const faKey     = document.getElementById('fa');
const soKey     = document.getElementById('so');
const laKey     = document.getElementById('la');
const siKey     = document.getElementById('si');
const ddKey     = document.getElementById('dd');
const sharpKey  = document.getElementById('sharp');
const highKey   = document.getElementById('high');
const SIDEKEY = 'sideKey';
const PRESS = ' press';
const MAINKEY = 'mainKey';

// 上一次刷新各个按键的状态。true：按下状态，false：松开状态
// let LT=false, RT=false, LB=false, RB=false;
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

        // 设置钢琴琴键被按住时的变化
        lowKey.className = cLT? SIDEKEY+PRESS : SIDEKEY;
        highKey.className = cRT? SIDEKEY+PRESS : SIDEKEY;
        flatKey.className = cLB? SIDEKEY+PRESS : SIDEKEY;
        sharpKey.className = cRB? SIDEKEY+PRESS : SIDEKEY;
        doKey.className = cL? MAINKEY+PRESS : MAINKEY;
        reKey.className = cU? MAINKEY+PRESS : MAINKEY;
        miKey.className = cR? MAINKEY+PRESS : MAINKEY;
        faKey.className = cD? MAINKEY+PRESS : MAINKEY;
        soKey.className = cX? MAINKEY+PRESS : MAINKEY;
        laKey.className = cY? MAINKEY+PRESS : MAINKEY;
        siKey.className = cB? MAINKEY+PRESS : MAINKEY;
        ddKey.className = cA? MAINKEY+PRESS : MAINKEY;

        let step=0, height=0;
        if((cLT&&cRT) || (!cLT&&!cRT))
            height = 0;
        else if(cLT)
            height = -12;
        else // cRT
            height = 12;
        if((cLB&&cRB) || (!cLB&&!cRB))
            step = 0;
        else if(cLB)
            step = -1;
        else // RB
            step = 1;

        let indexBase = 12+step+height;
        let toneBase = do1+step+height;
        if(cL && !L) performable[indexBase   ]=player.play(toneBase);
        if(cU && !U) performable[indexBase+2 ]=player.play(toneBase+2);
        if(cR && !R) performable[indexBase+4 ]=player.play(toneBase+4);
        if(cD && !D) performable[indexBase+5 ]=player.play(toneBase+5);
        if(cX && !X) performable[indexBase+7 ]=player.play(toneBase+7);
        if(cY && !Y) performable[indexBase+9 ]=player.play(toneBase+9);
        if(cB && !B) performable[indexBase+11]=player.play(toneBase+11);
        if(cA && !A) performable[indexBase+12]=player.play(toneBase+12);
        // if(!cL && L) performable[indexBase   ].stop();
        // if(!cU && U) performable[indexBase+2 ].stop();
        // if(!cR && R) performable[indexBase+4 ].stop();
        // if(!cD && D) performable[indexBase+5 ].stop();
        // if(!cX && X) performable[indexBase+7 ].stop();
        // if(!cY && Y) performable[indexBase+9 ].stop();
        // if(!cB && B) performable[indexBase+11].stop();
        // if(!cA && A) performable[indexBase+12].stop();

        L=cL; U=cU; R=cR; D=cD; X=cX; Y=cY; B=cB; A=cA;
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

const performable = new Array(36); // 对应midi-number 48~83
let do1 = 60; // do对应的midi-number

let player;
const audioContext = new AudioContext();
Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(function (p) {player=p;});

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
    setInterval(scangamepads, 500);
}
