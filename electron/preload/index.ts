import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { IAonsokuAPI, IpcChannels, PlayerStateListenerActions } from './types'

// Returns an unsubscribe function so the renderer can drop the listener on
// unmount instead of stacking a new one on every re-registration.
function subscribe(
  channel: IpcChannels,
  listener: (...args: never[]) => void,
): () => void {
  ipcRenderer.on(channel, listener as never)

  return () => {
    ipcRenderer.removeListener(channel, listener as never)
  }
}

// Custom APIs for renderer
const api: IAonsokuAPI = {
  enterFullScreen: () => ipcRenderer.send(IpcChannels.ToggleFullscreen, true),
  exitFullScreen: () => ipcRenderer.send(IpcChannels.ToggleFullscreen, false),
  isFullScreen: () => ipcRenderer.invoke(IpcChannels.IsFullScreen),
  fullscreenStatusListener: (func) => {
    ipcRenderer.on(IpcChannels.FullscreenStatus, (_, status: boolean) =>
      func(status),
    )
  },
  removeFullscreenStatusListener: () => {
    ipcRenderer.removeAllListeners(IpcChannels.FullscreenStatus)
  },
  isMaximized: () => ipcRenderer.invoke(IpcChannels.IsMaximized),
  maximizedStatusListener: (func) => {
    ipcRenderer.on(IpcChannels.MaximizedStatus, (_, status: boolean) =>
      func(status),
    )
  },
  removeMaximizedStatusListener: () => {
    ipcRenderer.removeAllListeners(IpcChannels.MaximizedStatus)
  },
  toggleMaximize: (isMaximized) =>
    ipcRenderer.send(IpcChannels.ToggleMaximize, isMaximized),
  toggleMinimize: () => ipcRenderer.send(IpcChannels.ToggleMinimize),
  closeWindow: () => ipcRenderer.send(IpcChannels.CloseWindow),
  setTitleBarOverlayColors: (color) =>
    ipcRenderer.send(IpcChannels.ThemeChanged, color),
  setNativeTheme: (isDark) =>
    ipcRenderer.send(IpcChannels.UpdateNativeTheme, isDark),
  downloadFile: (payload) =>
    ipcRenderer.send(IpcChannels.HandleDownloads, payload),
  downloadCompletedListener: (func) => {
    ipcRenderer.once(IpcChannels.DownloadCompleted, (_, fileId: string) =>
      func(fileId),
    )
  },
  downloadFailedListener: (func) => {
    ipcRenderer.once(IpcChannels.DownloadFailed, (_, fileId: string) =>
      func(fileId),
    )
  },
  updatePlayerState: (payload) => {
    ipcRenderer.send(IpcChannels.UpdatePlayerState, payload)
  },
  playerStateListener: (func) => {
    ipcRenderer.on(
      IpcChannels.PlayerStateListener,
      (_, state: PlayerStateListenerActions) => func(state),
    )
  },
  setDiscordRpcActivity: (payload) => {
    ipcRenderer.send(IpcChannels.SetDiscordRpcActivity, payload)
  },
  clearDiscordRpcActivity: () => {
    ipcRenderer.send(IpcChannels.ClearDiscordRpcActivity)
  },
  saveAppSettings: (payload) => {
    ipcRenderer.send(IpcChannels.SaveAppSettings, payload)
  },
  checkForUpdates: () => ipcRenderer.invoke(IpcChannels.CheckForUpdates),
  downloadUpdate: () => ipcRenderer.send(IpcChannels.DownloadUpdate),
  quitAndInstall: () => ipcRenderer.send(IpcChannels.QuitAndInstall),
  onUpdateAvailable: (callback) =>
    subscribe(IpcChannels.UpdateAvailable, (_, info) => callback(info)),
  onUpdateNotAvailable: (callback) =>
    subscribe(IpcChannels.UpdateNotAvailable, () => callback()),
  onUpdateError: (callback) =>
    subscribe(IpcChannels.UpdateError, (_, error) => callback(error)),
  onDownloadProgress: (callback) =>
    subscribe(IpcChannels.DownloadProgress, (_, progress) =>
      callback(progress),
    ),
  onUpdateDownloaded: (callback) =>
    subscribe(IpcChannels.UpdateDownloaded, (_, info) => callback(info)),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('envVars', {
      XDG_CURRENT_DESKTOP: process.env.XDG_CURRENT_DESKTOP,
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
  // @ts-expect-error (define in dts)
  window.envVars = {
    XDG_CURRENT_DESKTOP: process.env.XDG_CURRENT_DESKTOP,
  }
}
