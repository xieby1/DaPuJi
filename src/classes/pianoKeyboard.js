const FOLDEDKEYWIDTH = 100/12;
const WHITEKEYWIDTH = 100/26;
const BLACKKEYWIDTH = 2;
const SIDEKEY = 'sideKey'; const PRESS = ' press'; const MAINKEY = 'mainKey'; const BLACKKEY  = 'blackKey';
const ControllerModeTemplate = require('../settings/template').ControllerMode;
const KeyboardWhiteTemplate = require('../settings/template').KeyboardWhite;
const KeyboardBlackTemplate = require('../settings/template').KeyboardBlack;
const KeyTags = require('../settings/template').KeyTags;
const KeyboardModeTemplate = require('../settings/template').KeyboardMode;

function Status(do1=60, muted=false, low=false, high=false, flat=false, sharp=false, player=null) {
    this.do1 = do1;
    this.muted = muted;
    this.low = low;
    this.high = high;
    this.flat = flat;
    this.sharp = sharp;
    this.player = player;
    return this;
}

function PianoKey(name, status) {
    let isSideKey = name==='low' || name==='flat' || name==='sharp' || name==='high';

    // 创建琴键在窗口里对应的对象(DOM)
    // <div id='...' class='...Key'> - tempKey
    //     <div class='key'>...</div>  - tempButtonTag
    //     <div class='name'>...</div> - tempTag
    // </div>
    let tempDOM = document.createElement('div');
    tempDOM.setAttribute('id', name);
    if(isSideKey)
        tempDOM.setAttribute('class', SIDEKEY);
    else if(name in KeyboardBlackTemplate)
        tempDOM.setAttribute('class', BLACKKEY);
    else
        tempDOM.setAttribute('class', MAINKEY);
    let tempButtonTag = document.createElement('div');
    tempButtonTag.setAttribute('class', 'key');
    tempDOM.appendChild(tempButtonTag);
    let tempTag = document.createElement('div');
    tempTag.setAttribute('class', 'name');
    if(KeyTags[name]!==undefined)
        tempTag.innerText = KeyTags[name];
    tempDOM.appendChild(tempTag);
    this.DOM = tempDOM;

    this.isPressed = false;

    if(isSideKey)
    {
        this.pressAction = ()=>{
            this.DOM.className = SIDEKEY+PRESS;
            this.isPressed = status[name] = true;
        };
        this.releaseAction = ()=>{
            this.DOM.className = SIDEKEY;
            this.isPressed = status[name] = false;
        };
    }
    else // is not side key
    {
        this.pressAction = ()=>{
            let midi = status.do1;
            if(status.low) midi -= 12;
            if(status.high) midi += 12;
            if(status.flat) midi--;
            if(status.sharp) midi++;
            midi += KeyboardModeTemplate[name];
            if(status.player!=null && !this.isPressed && !status.muted)
                status.player.play(midi);
            if(this.DOM.className===MAINKEY || this.DOM.className===MAINKEY+PRESS)
                this.DOM.className = MAINKEY+PRESS;
            else // black key
                this.DOM.className = BLACKKEY+PRESS;
            this.isPressed = true;
        };
        this.releaseAction = ()=>{
            if(this.DOM.className===MAINKEY || this.DOM.className===MAINKEY+PRESS)
                this.DOM.className = MAINKEY;
            else // black key
                this.DOM.className = BLACKKEY;
            this.isPressed = false;
        };
    }

    // 注册鼠标事件
    this.DOM.onmousedown = this.pressAction;
    this.DOM.onmouseup = this.releaseAction;

    return this;
}

function PianoKeyboard(place) {
    const keys = {};
    this.keys = keys;

    place.setAttribute('id', 'pianoKeyboard');
    let status = new Status();
    const audioContext = new AudioContext();
    Soundfont.instrument(audioContext, './lib/instruments/acoustic_grand_piano-mp3.js',{}).then((p)=>{status.player=p});
    for(let name in KeyboardModeTemplate)
        keys[name] = new PianoKey(name, status);

    this.switchToFoldedMode = ()=>{
        place.innerText = '';
        let left = 0;
        for(let name in ControllerModeTemplate)
        {
            keys[name].DOM.setAttribute('style', 'left: '+left+'%; position: absolute;');
            left += FOLDEDKEYWIDTH;
            place.appendChild(keys[name].DOM);
        }
    };

    this.switchToFullMode = ()=>{
        place.innerText = '';
        let left = 0;
        let step = WHITEKEYWIDTH;
        for(let name in KeyboardWhiteTemplate){
            keys[name].DOM.setAttribute('style', 'left: '+left+'%; position: absolute; width: '+step+'%;');
            left += step;
            place.appendChild(keys[name].DOM);
        }
        left = 3*step - BLACKKEYWIDTH/2;
        let counter = 1;
        for(let name in KeyboardBlackTemplate){
            keys[name].DOM.setAttribute('style', 'left: '+left+'%; position: absolute;' +' width: '+BLACKKEYWIDTH+'%;');
            if(counter%5===2 || counter%5===0)
                left += step;
            left += step;
            counter++;
            place.appendChild(keys[name].DOM);
        }
    };

    this.toggleMute = ()=>{
        status.muted = !status.muted;
    }
}

module.exports.PianoKeyboard = PianoKeyboard;
