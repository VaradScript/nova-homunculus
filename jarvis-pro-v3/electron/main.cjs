const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let tray;
let pythonProcess;

// Fix for Windows shortcut creation
if (require('electron-squirrel-startup')) app.quit();

// ─── GRANT MIC + MEDIA PERMISSIONS ──────────────────────────────────────────
app.commandLine.appendSwitch('enable-speech-dispatcher');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function grantPermissions() {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        // Grant microphone, audio, video, media permissions automatically
        const allowed = ['media', 'microphone', 'audioCapture', 'geolocation', 'notifications'];
        if (allowed.includes(permission)) {
            console.log(`[PERM] Granted: ${permission}`);
            callback(true);
        } else {
            callback(false);
        }
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        const allowed = ['media', 'microphone', 'audioCapture'];
        return allowed.includes(permission);
    });
}

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
        skipTaskbar: true,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
            // Required for speech recognition in Electron
            webSecurity: false,
            allowRunningInsecureContent: true,
        },
        icon: path.join(__dirname, '../public/vite.svg')
    });

    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
    mainWindow.loadURL(startUrl);

    // Open DevTools so user can see console errors (remove later)
    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    // Click-through by default
    mainWindow.setIgnoreMouseEvents(true, { forward: true });

    // IPC: toggle click-through
    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.setIgnoreMouseEvents(ignore, { forward: true });
    });

    // IPC: open DevTools for debugging
    ipcMain.on('open-devtools', () => {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    });

    mainWindow.on('closed', () => mainWindow = null);

    // Log renderer errors to main process console
    mainWindow.webContents.on('console-message', (event, level, message) => {
        if (level >= 2) console.error('[RENDERER]', message); // errors only
    });
}

function createTray() {
    const iconPath = path.join(__dirname, '../public/vite.svg');
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16 });

    tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Nova Homunculus', enabled: false },
        { type: 'separator' },
        { label: 'Show/Hide', click: () => mainWindow?.isVisible() ? mainWindow.hide() : mainWindow.show() },
        { label: 'Open DevTools', click: () => mainWindow?.webContents.openDevTools({ mode: 'detach' }) },
        { label: 'Restart Core', click: startNovaServer },
        { type: 'separator' },
        { label: 'Exit', click: () => { app.isQuiting = true; cleanup(); app.quit(); } }
    ]);

    tray.setToolTip('Nova - Living Desktop');
    tray.setContextMenu(contextMenu);
}

function startNovaServer() {
    if (pythonProcess) pythonProcess.kill();

    const pythonPath = path.join(__dirname, '../../nova_server/venv/Scripts/python.exe');
    const scriptPath = path.join(__dirname, '../../nova_server/main.py');

    console.log('[NOVA] Igniting Nova Core...');

    try {
        pythonProcess = spawn(pythonPath, [scriptPath], {
            cwd: path.join(__dirname, '../../nova_server')
        });

        pythonProcess.stdout.on('data', (data) => console.log(`[CORE]: ${data}`));
        pythonProcess.stderr.on('data', (data) => console.error(`[CORE ERR]: ${data}`));
        pythonProcess.on('exit', (code) => console.log(`[CORE] Exited with code ${code}`));
    } catch (e) {
        console.error('[NOVA] Failed to spawn Python Core:', e);
    }
}

function cleanup() {
    if (pythonProcess) pythonProcess.kill();
}

app.whenReady().then(() => {
    grantPermissions();   // ← MUST be before createWindow
    startNovaServer();
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', cleanup);
