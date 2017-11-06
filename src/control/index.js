const ipcPlus = require('electron-ipc-plus');

ipcPlus.sendToMain('loaded');

ipcPlus.on('all-loaded', () => {
	console.log('All windows are loaded: getting foobar.');
	ipcPlus.sendToWins('get-foobar', (event, foobar) => {
		console.log('Foobar is', foobar);
	});
});
