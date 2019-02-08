let player;
const audioContext = new AudioContext();
Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(function (p) {player=p;});
const KeyTemplate = {
    low: null, flat: null, sharp: null, high: null,
    do: 0, re: 2, mi: 4, fa: 5, so: 7, la: 9, si: 11, dd: 12};

// 标志表示对应的琴键是否被按下
const KeyFlags = {};
for(let key in KeyTemplate)
    KeyFlags[key] = false;
// 各个琴键在窗口里对应的对象(DOM)
const Keys = {}; const SIDEKEY = 'sideKey'; const PRESS = ' press'; const MAINKEY = 'mainKey';
for(let key in KeyTemplate)
    Keys[key] = document.getElementById(key);
let do1 = 60; // do对应的midi-number
let quiteMode = false; // true：松开按键时音会停掉（笛子小提琴等），false：松开按键时音会一直延续（钢琴等）
// const performable = new Array(38); // 1+12+12+12+1
const FuncPress = {}; // 对应按键被按下时的动作
const FuncRelease = {}; // 对应按键被松开时的动作
for(let key in KeyTemplate)
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
            midi += KeyTemplate[key];
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
for(let key in KeyTemplate)
{
    Keys[key].onmousedown = FuncPress[key];
    Keys[key].onmouseup = FuncRelease[key];
}
