const electron = require('electron');
const { app, BrowserWindow } = electron;
const ipcPlus = require('electron-ipc-plus');
const path = require('path');
const url = require('url');

const development = (path.basename(__dirname) === 'src');

let controlWindow;
let controlWindowLoaded = false;

let displayWindow;
let displayWindowLoaded = false;

function onWindowLoaded() {
	if (controlWindowLoaded && displayWindowLoaded) {
		console.log('All windows are loaded: sending signal.');
		controlWindow.webContents.send('all-loaded');
		displayWindow.webContents.send('all-loaded');
	}
}

ipcPlus.on('loaded', (event) => {
	if (controlWindow && event.sender === controlWindow.webContents) {
		controlWindowLoaded = true;
		return onWindowLoaded();
	}

	if (displayWindow && event.sender === displayWindow.webContents) {
		displayWindowLoaded = true;
		return onWindowLoaded();
	}
});

function createControlWindow() {
	const primaryDisplay = electron.screen.getPrimaryDisplay();
	if (development) {
		controlWindow = new BrowserWindow({
			width: primaryDisplay.workAreaSize.width / 2,
			height: primaryDisplay.workAreaSize.height,
			x: 0,
			y: 0,
		});
	} else {
		controlWindow = new BrowserWindow({
			fullscreen: true,
			x: primaryDisplay ? primaryDisplay.bounds.x : 0,
			y: primaryDisplay ? primaryDisplay.bounds.y : 0,
		});
	}

	controlWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'control', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	if (development) {
		controlWindow.webContents.openDevTools();
	}

	controlWindow.on('closed', () => {
		controlWindow = null;
	});

	controlWindow.onbeforeunload = () => {
		controlWindowLoaded = false;
	};
}

function createDisplayWindow() {
	const primaryDisplay = electron.screen.getPrimaryDisplay();
	if (development) {
		displayWindow = new BrowserWindow({
			width: primaryDisplay.workAreaSize.width / 2,
			height: primaryDisplay.workAreaSize.height,
			x: primaryDisplay.workAreaSize.width / 2,
			y: 0,
		});
	} else {
		const displays = electron.screen.getAllDisplays();
		const externalDisplay = displays.find(display => {
			return display.id !== primaryDisplay.id;
		}) || primaryDisplay;

		displayWindow = new BrowserWindow({
			fullscreen: true,
			x: externalDisplay ? externalDisplay.bounds.x : 0,
			y: externalDisplay ? externalDisplay.bounds.y : 0,
		});
	}

	displayWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'display', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	if (development) {
		displayWindow.webContents.openDevTools();
	}

	displayWindow.on('closed', () => {
		displayWindow = null;
	});

	displayWindow.onbeforeunload = () => {
		displayWindowLoaded = false;
	};
}

app.on('ready', () => {
	createControlWindow();
	createDisplayWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (controlWindow === null) {
		createControlWindow();
	}
	if (displayWindow === null) {
		createDisplayWindow();
	}
});
