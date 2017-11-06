const ipcPlus = require('electron-ipc-plus');

ipcPlus.sendToMain('loaded');

ipcPlus.on('get-foobar', event => {
	console.log('Request for foobar received: replying.');
	return event.reply(null, 42);
});
