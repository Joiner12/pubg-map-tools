const { app, BrowserWindow } = require('electron')
const path = require('path')
const { Menu } = require('electron')
function createWindow() {
    const mainWindow = new BrowserWindow({
        width:440,
        height: 694,
        // width: 1200,
        // height: 800,
        webPreferences: {
            nodeIntegration: true, // 允许 Node.js 环境
        },
    })

    Menu.setApplicationMenu(null)
    // 加载 vite dist 目录下的 index.html
    if (app.isPackaged) {
        // 打包后使用 file:// 协议加载
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    } else {
        // 开发环境下使用 vite dev server
        mainWindow.loadURL('http://localhost:5173') // 5173 是 Vite 默认端口
    }
}
app.whenReady().then(createWindow)
// MacOS 特殊处理
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
// 关闭所有窗口后退出
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})