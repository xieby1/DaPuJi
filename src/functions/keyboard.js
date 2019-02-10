let player;
const audioContext = new AudioContext();
Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(function (p) {player=p;});
const SIDEKEY = 'sideKey'; const PRESS = ' press'; const MAINKEY = 'mainKey'; const BLACKKEY  = 'blackKey'
let quiteMode = false; // true：松开按键时音会停掉（笛子小提琴等），false：松开按键时音会一直延续（钢琴等）
let do1 = 60; // do对应的midi-number
// const performable = new Array(38); // 1+12+12+12+1

// ControllerModeTemplate是KeyboardModeTemplate的子集
const ControllerModeTemplate = {
    low: null, flat: null,
    do: 0, re: 2, mi: 4, fa: 5, so: 7, la: 9, si: 11, dd: 12,
    sharp: null, high: null
};
const KeyboardWhiteTemplate = {
    low: null, flat: null,
    _do: -12, _re: -10, _mi: -8, _fa: -7, _so: -5, _la: -3, _si: -1,
    do: 0, re: 2, mi: 4, fa: 5, so: 7, la: 9, si: 11, dd: 12,
    re_: 14, mi_: 16, fa_: 17, so_: 19, la_: 21, si_: 23, dd_: 24,
    sharp: null, high: null
};
const KeyboardBlackTemplate = {
    _doS: -11, _reS:-9, _faS: -6, _soS: -4, _laS: -2,
    doS: 1, reS:3, faS: 6, soS: 8, laS: 10,
    doS_: 13, reS_:15, faS_: 18, soS_: 20, laS_: 22
};
const KeyName = {
    low: '↓', flat: '♭',
    do: '1', re: '2', mi: '3', fa: '4', so: '5', la: '6', si: '7', dd: 'i',
    sharp: '♯', high: '↑'
};
const KeyboardModeTemplate = {};
for(let key in KeyboardWhiteTemplate)
    KeyboardModeTemplate[key] = KeyboardWhiteTemplate[key];
for(let key in KeyboardBlackTemplate)
    KeyboardModeTemplate[key] = KeyboardBlackTemplate[key];

// 创建琴键在窗口里对应的对象(DOM)
// <body>
// <div id='...' class='...Key'> - tempKey
//     <div class='key'>...</div>  - tempButtonTag
// <div class='name'>...</div> - tempNameTag
// </div>
// </body>
const keyboard = document.createElement('div');
keyboard.setAttribute('id', 'keyboard');
document.body.appendChild(keyboard);
const Keys = {};
for(let key in KeyboardModeTemplate)
{
    let tempKey = document.createElement('div');
    tempKey.setAttribute('id', key);
    if(key==='low' || key==='flat' || key==='sharp' || key==='high')
        tempKey.setAttribute('class', SIDEKEY);
    else if(key in KeyboardBlackTemplate)
        tempKey.setAttribute('class', BLACKKEY);
    else
        tempKey.setAttribute('class', MAINKEY);
    let tempButtonTag = document.createElement('div');
    tempButtonTag.setAttribute('class', 'key');
    tempKey.appendChild(tempButtonTag);
    let tempNameTag = document.createElement('div');
    tempNameTag.setAttribute('class', 'name');
    if(KeyName[key]!==undefined)
        tempNameTag.innerText = KeyName[key];
    tempKey.appendChild(tempNameTag);
    Keys[key] = tempKey;
}
function switchToFoldedMode() {
    for(let child of keyboard.children)
        keyboard.removeChild(child);
    let left = 0, step = 8.33; // 100/12
    for(let key in ControllerModeTemplate)
    {
        Keys[key].setAttribute('style', 'left: '+left+'%; position: absolute;');
        left += step;
        keyboard.appendChild(Keys[key]);
    }
}
function switchToFullMode() {
    for(let child of keyboard.children)
        keyboard.removeChild(child);
    let left = 0; step = 3.84; //100/26
    for(let key in KeyboardWhiteTemplate)
    {
        Keys[key].setAttribute('style', 'left: '+left+'%; position: absolute; width: '+step+'%;');
        left += step;
        keyboard.appendChild(Keys[key])
    }
    let blackKeyWidth = 3;
    left = 3*step-blackKeyWidth/2;
    let counter = 1;
    for(let key in KeyboardBlackTemplate)
    {
        Keys[key].setAttribute('style', 'left: '+left+'%; position: absolute;' +
            ' width: '+blackKeyWidth+'%;');
        if(counter%5===2 || counter%5===0)
            left += step;
        left += step;
        counter++;
        keyboard.appendChild(Keys[key]);
    }
}

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
            midi += KeyboardModeTemplate[key];
            if(!KeyFlags[key])
                player.play(midi);
            if(Keys[key].className===MAINKEY || Keys[key].className===MAINKEY+PRESS)
                Keys[key].className = MAINKEY+PRESS;
            else // black key
                Keys[key].className = BLACKKEY+PRESS;
            KeyFlags[key] = true;
        };
        FuncRelease[key] = ()=>{
            if(Keys[key].className===MAINKEY || Keys[key].className===MAINKEY+PRESS)
                Keys[key].className = MAINKEY;
            else // black key
                Keys[key].className = BLACKKEY;
            KeyFlags[key] = false;
        };
    }
}

// 以下鼠标相关
for(let key in KeyboardModeTemplate)
{
    Keys[key].onmousedown = FuncPress[key];
    Keys[key].onmouseup = FuncRelease[key];
}
