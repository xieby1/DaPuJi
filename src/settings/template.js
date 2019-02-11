// ControllerModeTemplate是KeyboardModeTemplate的子集
module.exports.ControllerMode = {
    low: null, flat: null,
    do: 0, re: 2, mi: 4, fa: 5, so: 7, la: 9, si: 11, dd: 12,
    sharp: null, high: null
};
module.exports.KeyboardWhite = {
    low: null, flat: null,
    _do: -12, _re: -10, _mi: -8, _fa: -7, _so: -5, _la: -3, _si: -1,
    do: 0, re: 2, mi: 4, fa: 5, so: 7, la: 9, si: 11, dd: 12,
    re_: 14, mi_: 16, fa_: 17, so_: 19, la_: 21, si_: 23, dd_: 24,
    sharp: null, high: null
};
module.exports.KeyboardBlack = {
    _doS: -11, _reS:-9, _faS: -6, _soS: -4, _laS: -2,
    doS: 1, reS:3, faS: 6, soS: 8, laS: 10,
    doS_: 13, reS_:15, faS_: 18, soS_: 20, laS_: 22
};
module.exports.KeyName = {
    low: '↓', flat: '♭',
    do: '1', re: '2', mi: '3', fa: '4', so: '5', la: '6', si: '7', dd: 'i',
    sharp: '♯', high: '↑'
};
