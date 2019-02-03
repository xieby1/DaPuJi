const TITLE = /title\s*=\s*"(?:[^\\]|\\.)*?"/;
const COMPOSER = /composer\s*=\s*"(?:[^\\]|\\.)*?"/;
const COMPILER = /compiler\s*=\s*"(?:[^\\]|\\.)*?"/;
const BPM = /bpm\s*=\s*\+?[1-9][0-9]*/;
const BEATINFO = /beatInfo\s*=\s*\{[2354678]\s*\/\s*(1|2|4|8|(16)|(32)|(64))\}/;
const POSTIVENUMBER = /\+?[1-9][0-9]*/;
module.exports.parseHead = function (content) {
    let headEnd = 0;

    function getBPM() {
        let pos = content.search(BPM);
        if(pos<0)
            return null;
        let start = content.slice(pos).search(POSTIVENUMBER) + pos;
        let end = content.slice(start).search(/\s/) + start;
        if(end>headEnd)
            headEnd = end;
        return +content.slice(start, end);
    }

    function getBeatInfo() {
        let beatInfo = {};
        let pos = content.search(BEATINFO);
        if(pos<0)
            return null;
        let start = content.slice(pos).search(POSTIVENUMBER) + pos;
        let end = content.slice(start).search(/\s|\//) + start;
        beatInfo.beatsNumber = +content.slice(start, end);
        start = content.slice(end).search(POSTIVENUMBER) + end;
        end = content.slice(start).search(/[\}\s]/) + start;
        beatInfo.baseBeat = +content.slice(start, end) / 4;
        if(end>headEnd)
            headEnd = end;
        return beatInfo;
    }

    function getString(regex) {
        let start = 0, end = 0, pos = content.search(regex);
        if(pos>=0)
        {
            while(content[pos]!=='\"')
                pos++;
            start = ++pos;
            while(content[pos]!=='\"')
                pos++;
            end = pos;
        }
        else
            return '';
        if(end>headEnd)
            headEnd = end;
        return content.slice(start, end);
    }

    let headInfo = {
        title: getString(TITLE),
        composer: getString(COMPOSER),
        compiler: getString(COMPILER),
        bpm: getBPM() || 80,
        beatInfo: getBeatInfo() || {beatsNumber: 4, baseBeat: 1},
        headEnd: headEnd
    };
    return headInfo;
};


