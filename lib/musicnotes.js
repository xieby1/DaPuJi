const TITLE = /title\s*=\s*"(?:[^\\]|\\.)*?"/;
const COMPOSER = /composer\s*=\s*"(?:[^\\]|\\.)*?"/;
const COMPILER = /compiler\s*=\s*"(?:[^\\]|\\.)*?"/;
const BPM = /bpm\s*=\s*\+?[1-9][0-9]*/;
const BEATINFO = /beatInfo\s*=\s*\{[2354678]\s*\/\s*(1|2|4|8|(16)|(32)|(64))\}/;
const POSTIVENUMBER = /\+?[1-9][0-9]*/;
const NOTE = /[-+\/*b#.]*/;

CodeMirror.defineSimpleMode('musicnotes', {
    start: [
        // 唱名 - tone
        {regex: /title/, token: "keyword", next: 'assignment'},
        {regex: /composer/, token: "keyword", next: 'assignment'},
        {regex: /compiler/, token: "keyword", next: 'assignment'},
        {regex: /bpm/, token: "keyword", next: 'assignment'},
        {regex: /beatInfo/, token: "keyword", next: 'assignment'},

        {regex: /[12345670]/, token: "tone", next: 'note'},
        {regex: /\/\/.*/, token: "comment"},
        // A next property will cause the mode to move to a different state
        {regex: /\/\*/, token: "comment", next: "comment"},
        // indent and dedent properties guide autoindentation
        {regex: /[\{\[\(]/, indent: true},
        {regex: /[\}\]\)]/, dedent: true},
        {regex: /\S/, token: "error"}
    ],
    // The multi-line comment state.
    comment: [
        {regex: /.*?\*\//, token: "comment", next: "start"},
        {regex: /.*/, token: "comment"}
    ],

    note: [
        {regex: NOTE, token: "note", next: "start"}
    ],

    assignment: [
        {regex: /\s*=\s*/, token: 'operator', next: 'value'}
    ],

    value: [
        {regex: /"(?:[^\\]|\\.)*?"/, token: "string", next: "start"},
        {regex: /\+?[1-9][0-9]*/, token: "number", next: "start"},
        {regex: /\{[2354678]\s*\/\s*(1|2|4|8|(16)|(32)|(64))\}/, token: "beatInfo", next: "start"}
    ],
    // The meta property contains global information about the mode. It
    // can contain properties like lineComment, which are supported by
    // all modes, and also directives like dontIndentStates, which are
    // specific to simple modes.
    meta: {
        dontIndentStates: ["comment"],
        lineComment: "//"
    }
});
