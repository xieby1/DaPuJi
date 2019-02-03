const LETTERNOTATION = [null, 60, 62, 64, 65, 67, 69, 71];
module.exports.getPlayEvents = function(content, headInfo)
{
    let events = [];
    let tone = '', step=0, height=0, length=1;
    let bpm = headInfo.bpm; // 每分钟拍数
    let baseBeat = headInfo.beatInfo.baseBeat; // 表示四分音符为baseBeat拍
    let timeAcc = 0; //累计时间

    for(let char of content.slice(headInfo.headEnd))
    {
        switch (char) {
            case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7':
                if(tone!=='')
                {
                    if(tone!=='0')
                        events.push({time: timeAcc, note: LETTERNOTATION[+tone]+height*12+step});
                    timeAcc += length*baseBeat/bpm*60;
                }
                tone = char;
                step=0; height=0; length=1;
                break;
            case 'b': step--;break;
            case '#': step++;break;
            case '/': length/=2;break;
            case '*': length*=2;break;
            case '.': length++;break;
            case '-': height--;break;
            case '+': height++;break;
            default:
        }
    }
    if(tone!=='0')
        events.push({time: timeAcc, note: LETTERNOTATION[+tone]+height*12+step});
    return events;
};
