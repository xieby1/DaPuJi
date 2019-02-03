const LATEXBLANK = '\\ \\ ';

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

module.exports.replaceWithLatex = function(content, headInfo)
{
    if(content==='')
        return '';
    let latexContent = '|';
    let tone='', step=0, height=0, length=1;
    let baseBeat = headInfo.beatInfo.baseBeat; // 表示四分音符为baseLength拍
    let beatsNumber = headInfo.beatInfo.beatsNumber;
    let filledLength = 0;

    function addLatexChar() {
        if(filledLength+length*baseBeat < beatsNumber)
        {
            latexContent += LATEXBLANK + creatLatexChar(tone, step, height, length);
            filledLength = filledLength+length*baseBeat;
        }
        else if(filledLength+length*baseBeat === beatsNumber)
        {
            latexContent += LATEXBLANK + creatLatexChar(tone, step, height, length) + LATEXBLANK+ '|';
            filledLength = 0;
        }
        else
        {
            latexContent += LATEXBLANK
                + creatLatexChar(tone, step, height, beatsNumber/baseBeat - filledLength, 'left')
                + LATEXBLANK + '|';
            length = length + filledLength - beatsNumber/baseBeat ;
            filledLength = 0;
            while(length*baseBeat > beatsNumber)
            {
                latexContent += LATEXBLANK
                    + creatLatexChar(tone, step, height, beatsNumber/baseBeat)
                    + LATEXBLANK + '|';
                length -= beatsNumber/baseBeat;
            }
            latexContent += LATEXBLANK + creatLatexChar(tone, step, height, length, 'right');
            filledLength = length;
            if(length*baseBeat===beatsNumber)
            {
                filledLength = 0;
                latexContent += LATEXBLANK + '|';
            }
        }

        step=0; height=0; length=1;
    }

    for(let char of content.slice(headInfo.headEnd))
    {
        switch (char) {
            case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7':
                if(tone!=='')
                    addLatexChar();
                tone = char;
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
    addLatexChar();
    return latexContent;
}

