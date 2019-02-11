const electron = require('electron');
const {language} = require('./languages/selected');

module.exports.appMenuTemplate = [
  {
    label: language.file,
    submenu: [],
  },
  {
    label: language.edit,
    submenu: [
      {
        label: language.undo,
        role: 'undo',
      },
      {
        label: language.cut,
        role: 'cut',
      },
      {
        label: language.copy,
        role: 'copy',
      },
      {
        label: language.paste,
        role: 'paste',
      },
      {
        label: language.selectall,
        role: 'selectall',
      },
    ],
  },
  {
    label: language.view,
    submenu: [
      {
        label: language.reload,
        role: 'reload',
      },
      {
        label: language.toggledevtools,
        role: 'toggledevtools',
      },
      {
        type: 'separator',
      },
      {
        label: language.resetzoom,
        role: 'resetzoom',
      },
      {
        label: language.zoomin,
        role: 'zoomin',
      },
      {
      label: language.zoomout,
        role: 'zoomout',
      },
      {
        type: 'separator',
      },
      {
        label: language.togglefullscreen,
        role: 'togglefullscreen',
      },
    ],
  },
  {
    label: language.help,
    role: 'help',
    submenu: [
      {
        label: language.homePage,
        click() { electron.shell.openExternal('https://github.com/xieby1/DaPuJi'); },
      },
    ],
  },
];
