let player;
const audioContext = new AudioContext();
Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(function (p) {player=p;});
let controllerModeOrKeyboardMode = true; // true: controllerMode, false: keyboardMode
const SIDEKEY = 'sideKey'; const PRESS = ' press'; const MAINKEY = 'mainKey';
let quiteMode = false; // true：松开按键时音会停掉（笛子小提琴等），false：松开按键时音会一直延续（钢琴等）
let do1 = 60; // do对应的midi-number
// const performable = new Array(38); // 1+12+12+12+1

// ControllerModeTemplate是KeyboardModeTemplate的子集
const ControllerModeTemplate = {
    low: null, flat: null,
    do: 0, re: 2, mi: 4, fa: 5, so: 7, la: 9, si: 11, dd: 12,
    sharp: null, high: null
};
const KeyboardModeOnlyTemplate = {
    low: null, flat: null,
    _do: 0, _doS: 1, _re: 2, _reS:3, _mi: 4, _fa: 5, _faS: 6, _so: 7, _soS: 8, _la: 9, _laS: 10, _si: 11, _dd: 12,
    doS: 1, reS:3, faS: 6, soS: 8, laS: 10,
    do_: 0, doS_: 1, re_: 2, reS_:3, mi_: 4, fa_: 5, faS_: 6, so_: 7, soS_: 8, la_: 9, laS_: 10, si_: 11, dd_: 12,
    sharp: null, high: null
};
const KeyboardModeTemplate = {};
for(let key in ControllerModeTemplate)
    KeyboardModeTemplate[key] = ControllerModeTemplate[key];
for(let key in KeyboardModeOnlyTemplate)
    KeyboardModeTemplate[key] = KeyboardModeOnlyTemplate[key];

// 各个琴键在窗口里对应的对象(DOM)
const Keys = {};
for(let key in ControllerModeTemplate)
    Keys[key] = document.getElementById(key);

// 标志表示对应的琴键是否被按下
const KeyFlags = {};
for(let key in ControllerModeTemplate)
    KeyFlags[key] = false;
const FuncPress = {}; // 对应按键被按下时的动作
const FuncRelease = {}; // 对应按键被松开时的动作
// 因为ControllerModeTemplate是KeyboardModeTemplate的子集，所以对KeyboardMode包含的按键进行初始即包含了ControllerMode的按键
for(let key in KeyboardModeTemplate)
{
    if(key==='low' || key==='flat' || key==='sharp' || key==='high')
    {
        FuncPress[key] = ()=>{
            Keys[key].className = SIDEKEY+PRESS;
            KeyFlags[key] = true;
        };
        FuncRelease[key] = ()=>{
            Keys[key].className = SIDEKEY;
            KeyFlags[key] = false;
        };
    }
    else
    {
        FuncPress[key] = ()=>{
            let midi = do1;
            if(KeyFlags['low']) midi -= 12;
            if(KeyFlags['high']) midi += 12;
            if(KeyFlags['flat']) midi--;
            if(KeyFlags['sharp']) midi++;
            midi += ControllerModeTemplate[key];
            if(!KeyFlags[key])
                player.play(midi);
            Keys[key].className = MAINKEY+PRESS;
            KeyFlags[key] = true;
        };
        FuncRelease[key] = ()=>{
            Keys[key].className = MAINKEY;
            KeyFlags[key] = false;
        };
    }
}

// 以下鼠标相关
for(let key in ControllerModeTemplate)
{
    Keys[key].onmousedown = FuncPress[key];
    Keys[key].onmouseup = FuncRelease[key];
}
