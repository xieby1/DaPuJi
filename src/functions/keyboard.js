let player;
const audioContext = new AudioContext();
Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(function (p) {player=p;});

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

// counters
// 数字表示有几个地方在按它，可能来源鼠标、键盘和手臂
let cLow=0, cFlat=0, cSharp=0, cHigh=0;
let cDo=0, cRe=0, cMi=0, cFa=0, cSo=0, cLa=0, cSi=0, cDD=0;
let do1 = 60; // do对应的midi-number
let quiteMode = false; // true：松开按键时音会停掉（笛子小提琴等），false：松开按键时音会一直延续（钢琴等）
// const performable = new Array(38); // 1+12+12+12+1
function getMIDINum() {
    let midi = do1;
    if(cLow>0) midi -= 12;
    if(cHigh>0) midi += 12;
    if(cFlat>0) midi--;
    if(cSharp>0) midi++;
    return midi;
}

function pressLow() { if(cLow===0)lowKey.className=SIDEKEY+PRESS; cLow++;}
function pressFlat() { if(cFlat===0)flatKey.className=SIDEKEY+PRESS; cFlat++;}
function pressSharp() { if(cSharp===0)sharpKey.className=SIDEKEY+PRESS; cSharp++;}
function pressHigh() { if(cHigh===0)highKey.className=SIDEKEY+PRESS; cHigh++;}
function pressDo() {
    if(cDo===0) {
        player.play(getMIDINum());
        doKey.className = MAINKEY+PRESS;
    }
    cDo++;
}
function pressRe() {
    if(cRe===0) {
        player.play(getMIDINum()+2);
        reKey.className = MAINKEY+PRESS;
    }
    cRe++;
}
function pressMi() {
    if(cMi===0) {
        player.play(getMIDINum()+4);
        miKey.className = MAINKEY+PRESS;
    }
    cMi++;
}
function pressFa() {
    if(cFa===0) {
        player.play(getMIDINum()+5);
        faKey.className = MAINKEY+PRESS;
    }
    cFa++;
}
function pressSo() {
    if(cSo===0) {
        player.play(getMIDINum()+7);
        soKey.className = MAINKEY+PRESS;
    }
    cSo++;
}
function pressLa() {
    if(cLa===0) {
        player.play(getMIDINum()+9);
        laKey.className = MAINKEY+PRESS;
    }
    cLa++;
}
function pressSi() {
    if(cSi===0) {
        player.play(getMIDINum()+11);
        siKey.className = MAINKEY+PRESS;
    }
    cSi++;
}
function pressDD() {
    if(cDD===0) {
        player.play(getMIDINum()+12);
        ddKey.className = MAINKEY+PRESS;
    }
    cDD++;
}
function releaseLow() {cLow--; if(cLow===0)lowKey.className=SIDEKEY;}
function releaseFlat() {cFlat--; if(cFlat===0)flatKey.className=SIDEKEY;}
function releaseSharp() {cSharp--; if(cSharp===0)sharpKey.className=SIDEKEY;}
function releaseHigh() {cHigh--; if(cHigh===0)highKey.className=SIDEKEY;}
function releaseDo() {
    cDo--;
    if(cDo===0) {
        doKey.className = MAINKEY;
    }
}
function releaseRe() {
    cRe--;
    if(cRe===0) {
        reKey.className = MAINKEY;
    }
}
function releaseMi() {
    cMi--;
    if(cMi===0) {
        miKey.className = MAINKEY;
    }
}
function releaseFa() {
    cFa--;
    if(cFa===0) {
        faKey.className = MAINKEY;
    }
}
function releaseSo() {
    cSo--;
    if(cSo===0) {
        soKey.className = MAINKEY;
    }
}
function releaseLa() {
    cLa--;
    if(cLa===0) {
        laKey.className = MAINKEY;
    }
}
function releaseSi() {
    cSi--;
    if(cSi===0) {
        siKey.className = MAINKEY;
    }
}
function releaseDD() {
    cDD--;
    if(cDD===0) {
        ddKey.className = MAINKEY;
    }
}
// 以下鼠标相关
lowKey.onmousedown = pressLow;
flatKey.onmousedown = pressFlat;
doKey.onmousedown = pressDo;
reKey.onmousedown = pressRe;
miKey.onmousedown = pressMi;
faKey.onmousedown = pressFa;
soKey.onmousedown = pressSo;
laKey.onmousedown = pressLa;
siKey.onmousedown = pressSi;
ddKey.onmousedown = pressDD;
sharpKey.onmousedown = pressSharp;
highKey.onmousedown = pressHigh;
lowKey.onmouseup = releaseLow;
flatKey.onmouseup = releaseFlat;
doKey.onmouseup = releaseDo;
reKey.onmouseup = releaseRe;
miKey.onmouseup = releaseMi;
faKey.onmouseup = releaseFa;
soKey.onmouseup = releaseSo;
laKey.onmouseup = releaseLa;
siKey.onmouseup = releaseSi;
ddKey.onmouseup = releaseDD;
sharpKey.onmouseup = releaseSharp;
highKey.onmouseup = releaseHigh;
// 以上为键盘相关
