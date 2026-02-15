const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let tray;
let pythonProcess;

// Fix for Windows shortcut creation
if (require('electron-squirrel-startup')) app.quit();

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true, // Only show in Tray
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        },
        icon: path.join(__dirname, '../public/vite.svg')
    });

    // In development, load from localhost. In production, load from file.
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
    mainWindow.loadURL(startUrl);

    // Click-through logic: Only accept clicks when the mouse is over interactive elements
    mainWindow.setIgnoreMouseEvents(true, { forward: true });

    // IPC to toggle click-through (Frontend sends 'set-ignore-mouse-events')
    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        win.setIgnoreMouseEvents(ignore, { forward: true });
    });

    mainWindow.on('closed', () => mainWindow = null);
}

function createTray() {
    const iconPath = path.join(__dirname, '../public/vite.svg'); // Placeholder
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16 });

    tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Nova Homunculus', enabled: false },
        { type: 'separator' },
        { label: 'Show/Hide Debug', click: () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show() },
        { label: 'Restart Core', click: startNovaServer },
        { type: 'separator' },
        { label: 'Exit', click: () => { app.isQuiting = true; cleanup(); app.quit(); } }
    ]);

    tray.setToolTip('Nova - Living Desktop');
    tray.setContextMenu(contextMenu);
}

function startNovaServer() {
    if (pythonProcess) pythonProcess.kill();

    // Path to the Nova Server venv python
    const pythonPath = path.join(__dirname, '../../nova_server/venv/Scripts/python.exe');
    const scriptPath = path.join(__dirname, '../../nova_server/main.py');

    console.log("Igniting Nova Core...");

    // Check if venv exists, otherwise fallback to system python
    // For now, we assume the user ran run_hybrid_server.bat once to create venv

    try {
        pythonProcess = spawn(pythonPath, [scriptPath], {
            cwd: path.join(__dirname, '../../nova_server')
        });

        pythonProcess.stdout.on('data', (data) => console.log(`[CORE]: ${data}`));
        pythonProcess.stderr.on('data', (data) => console.error(`[CORE ERR]: ${data}`));
    } catch (e) {
        console.error("Failed to spawn Python Core:", e);
    }
}

function cleanup() {
    if (pythonProcess) pythonProcess.kill();
}

app.whenReady().then(() => {
    // We can interact with the existing running server or spawn a new one.
    // Let's spawn it to ensure it's running.
    startNovaServer();
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', cleanup);
