const LATEXBLANK = '\\ \\ ';

class BeatInfo
{
    constructor(beatsNumber, baseBeat)
    {
        this.beatsNumber = beatsNumber;
        this.baseBeat = baseBeat;// 表示四分音符为baseLength拍
    }
}

class MusicalNote
{
    constructor(tone, step, length, height, fromCh, toCh)
    {
        this.tone = tone;
        this.step = step;
        this.length = length;
        this.height = height;
        this.fromCh = fromCh;
        this.toCh = toCh;
    }
}

const LETTERNOTATION = [null, 60, 62, 64, 65, 67, 69, 71];
class ParsedContent
{
    constructor(headInfo, bodyInfo)
    {
        this.headInfo = headInfo;
        this.bodyInfo = bodyInfo;
    }

    getPlayEvents(){
        let events = [];
        let bpm = this.headInfo.bpm; // 每分钟拍数
        let baseBeat = this.headInfo.beatInfo.baseBeat; // 表示四分音符为baseBeat拍
        let timeAcc = 0; //累计时间

        for(let lineInfo of this.bodyInfo)
        {
            for(let musicalNote of lineInfo)
            {
                let tone = musicalNote.tone;
                let step = musicalNote.step;
                let height = musicalNote.height;
                let length = musicalNote.length;

                events.push({time: timeAcc, note: LETTERNOTATION[tone]+height*12+step});
                timeAcc += length*baseBeat/bpm*60;
            }
        }
        return events;
    }

    getLatexBody(){
        if(this.bodyInfo.length === 0)
            return '';
        let latexBody = [];
        let filledLength = 0;

        for(let lineInfo of this.bodyInfo)
        {
            let latexLine = '';
            for(let musicalNote of lineInfo)
            {
                latexLine += addLatexChar(musicalNote, this.headInfo.beatInfo);
            }
            latexBody.push(latexLine);
        }

        function addLatexChar(musicalNote, beatInfo) {
            let latexAppend = '';
            let tone = musicalNote.tone;
            let step = musicalNote.step;
            let height = musicalNote.height;
            let length = musicalNote.length;
            let baseBeat = beatInfo.baseBeat;
            let beatsNumber = beatInfo.beatsNumber;
            if(filledLength+length*baseBeat < beatsNumber)
            {
                latexAppend += LATEXBLANK + creatLatexChar(tone, step, height, length);
                filledLength = filledLength+length*baseBeat;
            }
            else if(filledLength+length*baseBeat === beatsNumber)
            {
                latexAppend += LATEXBLANK + creatLatexChar(tone, step, height, length) + LATEXBLANK+ '|';
                filledLength = 0;
            }
            else
            {
                latexAppend += LATEXBLANK
                    + creatLatexChar(tone, step, height, beatsNumber/baseBeat - filledLength, 'left')
                    + LATEXBLANK + '|';
                length = length + filledLength - beatsNumber/baseBeat ;
                filledLength = 0;
                while(length*baseBeat > beatsNumber)
                {
                    latexAppend += LATEXBLANK
                        + creatLatexChar(tone, step, height, beatsNumber/baseBeat)
                        + LATEXBLANK + '|';
                    length -= beatsNumber/baseBeat;
                }
                latexAppend += LATEXBLANK + creatLatexChar(tone, step, height, length, 'right');
                filledLength = length;
                if(length*baseBeat===beatsNumber)
                {
                    filledLength = 0;
                    latexAppend += LATEXBLANK + '|';
                }
            }
            return latexAppend;
        }
        return latexBody;
    }
}

creatLatexChar = function(char, step, height, length, link) {
    let newLatexChar = char;
    if(height<0)
    {
        for(let i=0; i>height; i--)
            newLatexChar = '\\check{'+newLatexChar+'}';
    }
    else if(height>0)
    {
        for(let i=0; i<height; i++)
            newLatexChar = '\\dot{'+newLatexChar+'}';
    }
    if(link==='left')
        newLatexChar = '\\overgroup{' + newLatexChar;
    else if(link==='right')
        newLatexChar = newLatexChar + '}';
    if(length<1)
    {
        for(let i=1; i>length; i/=2)
            newLatexChar = '\\underline{'+newLatexChar+"}";
    }
    else if(length>1)
    {
        for(let i=1; i<length; i++)
            newLatexChar = newLatexChar+'-';
    }
    if(step<0)
    {
        for(let i=0; i>step; i--)
            newLatexChar = '\\flat '+newLatexChar;
    }
    else if(step>0)
    {
        for(let i=0; i<step; i++)
            newLatexChar = '\\sharp '+newLatexChar;
    }
    return newLatexChar;
};

module.exports.parseContent = function (editor) {
    const lineCount = editor.lineCount();

    // parse head
    let headInfo = {
        title: '',
        composer: '',
        compiler: '',
        bpm: 80,
        beatInfo: new BeatInfo(4, 1),
        headEndAtLine: 0
    };
    let stage = 1;
    let property = ''; // stage 1
    // operator // stage 2
    let value = null; // stage 3
    outerFor: for(let i=0; i<lineCount; i++)
    {
        const tokens = editor.getLineTokens(i);
        for(let token of tokens)
        {
            if(token.type === 'tone' || token.type === 'note')
            {
                headInfo.headEndAtLine = i-1;
                break outerFor;
            }
            switch (stage) {
                case 1:
                    if(token.type === 'keyword')
                    {
                        stage = 2;
                        property = token.string;
                    }
                    break;
                case 2:
                    if(token.type === 'operator')
                        stage = 3;
                    else
                        stage = 1;
                    break;
                case 3:
                    switch (property) {
                        case 'title':
                        case 'composer':
                        case 'compiler':
                            if(token.type === 'string')
                                value = token.string.slice(1, token.string.length-1);
                            break;
                        case 'bpm':
                            if(token.type === 'number')
                                value = +token.string;
                            break;
                        case 'beatInfo':
                            if(token.type === 'beatInfo')
                                value = new BeatInfo(+token.string.slice(1,2),
                                    +token.string.slice(3, token.string.length-1)/4);
                            break;
                    }
                    break;
                default:
                    break;
            }
            if(value != null)
            {
                headInfo[property] = value;
                property = '';
                value = null;
                stage = 1;
            }
        }
    }

    // parse body
    let bodyInfo = [];
    for(let i=headInfo.headEndAtLine+1; i<lineCount; i++)
    {
        let lineInfo = [];
        const tokens = editor.getLineTokens(i);
        for(let i=0; i<tokens.length; i++)
        {
            if(tokens[i].type === 'tone')
            {
                let fromCh = tokens[i].start;
                let toCh = tokens[i].end;
                let tone = +tokens[i].string;
                let step=0, height=0, length=1;
                // 查看后面是否紧跟着一个note
                if(i+1<tokens.length && tokens[i+1].type==='note')
                {// 后面紧跟着一个note
                    let notes = tokens[i+1].string;
                    for(let note of notes)
                    {
                        switch (note) {
                            case 'b': step--;break;
                            case '#': step++;break;
                            case '/': length/=2;break;
                            case '*': length*=2;break;
                            case '.': length++;break;
                            case '-': height--;break;
                            case '+': height++;break;
                        }
                    }
                    toCh = tokens[i+1].end;
                }
                lineInfo.push(new MusicalNote(tone, step, length, height, fromCh, toCh));
            }
        }
        bodyInfo.push(lineInfo);
    }

    return new ParsedContent(headInfo, bodyInfo);
};


