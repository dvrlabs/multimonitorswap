'use strict';

const { Shell, Meta } = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const SCHEMA_SWAP_UP = 'swap-up';
const SCHEMA_SWAP_DOWN = 'swap-down';
const SCHEMA_SWAP_RIGHT = 'swap-right';
const SCHEMA_SWAP_LEFT = 'swap-left';

class MultiMonitorSwap {
    constructor() {
        this._workspaceManager = global.workspace_manager;
        this._keySwapUpId = null;
        this._keySwapDownId = null;
        this._keySwapRightId = null;
        this._keySwapLeftId = null;
        this._activeWindow = null;
    }

    swapWindow(id) {
        const { activeWindow, activeRect } = this._getActiveWindow();
        if (!activeWindow) {
            this._activeWindow = null;
            return;
        }

        this._activeWindow = activeWindow;
        const bestCandidate = this._getBestCandidate(id, activeWindow.get_monitor(), activeRect);


        if (bestCandidate) {
            let currentMonitorIndex = this._activeWindow.get_monitor();
            let nextMonitorIndex = bestCandidate.get_monitor();

            bestCandidate.move_to_monitor(currentMonitorIndex);
            this._activeWindow.move_to_monitor(nextMonitorIndex) 

            //bestCandidate.activate(global.get_current_time());
            this._activeWindow.activate(global.get_current_time());
        }
    }

    _getMonitorByDirection(id, activeMonitorId) {
        const numberOfMonitors = this._activeWindow.get_display().get_n_monitors();

        let activeMonitor = null;
        const monitors = [];
        for (let i = 0; i < numberOfMonitors; i++) {
            if (i === activeMonitorId)
                activeMonitor = this._activeWindow.get_display().get_monitor_geometry(i);
            else
                monitors.push({ id: i, rect: this._activeWindow.get_display().get_monitor_geometry(i) });
        }

        if (!activeMonitor || !monitors.length)
            return null;

        let bestMonitorCandidate = null;
        switch (id) {
        case SCHEMA_SWAP_UP:
            for (let m of monitors) {
                if (m.rect.y < activeMonitor.y) {
                    if (!bestMonitorCandidate)
                        bestMonitorCandidate = m;
                    else if (
                        Math.abs(activeMonitor.x - m.rect.x) <
              Math.abs(activeMonitor.x - bestMonitorCandidate.rect.x)
                    )
                        bestMonitorCandidate = m;
                }
            }
            break;
        case SCHEMA_SWAP_DOWN:
            for (let m of monitors) {
                if (m.rect.y > activeMonitor.y) {
                    if (!bestMonitorCandidate)
                        bestMonitorCandidate = m;
                    else if (
                        Math.abs(activeMonitor.x - m.rect.x) <
              Math.abs(activeMonitor.x - bestMonitorCandidate.rect.x)
                    )
                        bestMonitorCandidate = m;
                }
            }
            break;
        case SCHEMA_SWAP_RIGHT:
            for (let m of monitors) {
                if (m.rect.x > activeMonitor.x) {
                    if (!bestMonitorCandidate)
                        bestMonitorCandidate = m;
                    else if (
                        Math.abs(activeMonitor.y - m.rect.y) <
              Math.abs(activeMonitor.y - bestMonitorCandidate.rect.y)
                    )
                        bestMonitorCandidate = m;
                }
            }
            break;
        case SCHEMA_SWAP_LEFT:
            for (let m of monitors) {
                if (m.rect.x < activeMonitor.x) {
                    if (!bestMonitorCandidate)
                        bestMonitorCandidate = m;
                    else if (
                        Math.abs(activeMonitor.y - m.rect.y) <
              Math.abs(activeMonitor.y - bestMonitorCandidate.rect.y)
                    )
                        bestMonitorCandidate = m;
                }
            }
            break;
        }

        if (bestMonitorCandidate)
            return bestMonitorCandidate.id;

        return null;
    }

    _getBestCandidate(id, monitor, activeRect) {
        const windows = this._getAllWindows(monitor);
        const { x, y } = activeRect;
        let bestCandidate = null;
        switch (id) {
        case SCHEMA_SWAP_UP:
            windows.forEach(w => {
                const rect = w.get_frame_rect();
                if (rect.y < y) {
                    if (!bestCandidate) {
                        bestCandidate = w;
                    } else {
                        const bestRect = bestCandidate.get_frame_rect();
                        if (rect.x === bestRect.x && rect.y > bestRect.y)
                            bestCandidate = w;
                        else if (
                            rect.x !== bestRect.x &&
                Math.abs(activeRect.x - rect.x) < Math.abs(activeRect.x - bestRect.x)
                        )
                            bestCandidate = w;
                    }
                }
            });
            break;
        case SCHEMA_SWAP_DOWN:
            windows.forEach(w => {
                const rect = w.get_frame_rect();
                if (rect.y > y) {
                    if (!bestCandidate) {
                        bestCandidate = w;
                    } else {
                        const bestRect = bestCandidate.get_frame_rect();
                        if (rect.x === bestRect.x && rect.y < bestRect.y)
                            bestCandidate = w;
                        else if (
                            rect.x !== bestRect.x &&
                Math.abs(activeRect.x - rect.x) < Math.abs(activeRect.x - bestRect.x)
                        )
                            bestCandidate = w;
                    }
                }
            });
            break;
        case SCHEMA_SWAP_RIGHT:
            windows.forEach(w => {
                const rect = w.get_frame_rect();
                if (rect.x > x) {
                    if (!bestCandidate) {
                        bestCandidate = w;
                    } else {
                        const bestRect = bestCandidate.get_frame_rect();
                        if (rect.y === bestRect.y && rect.x < bestRect.x)
                            bestCandidate = w;
                        else if (
                            rect.y !== bestRect.y &&
                Math.abs(activeRect.y - rect.y) < Math.abs(activeRect.y - bestRect.y)
                        )
                            bestCandidate = w;
                    }
                }
            });
            break;
        case SCHEMA_SWAP_LEFT:
            windows.forEach(w => {
                const rect = w.get_frame_rect();
                if (rect.x < x) {
                    if (!bestCandidate) {
                        bestCandidate = w;
                    } else {
                        const bestRect = bestCandidate.get_frame_rect();
                        if (rect.y === bestRect.y && rect.x > bestRect.x)
                            bestCandidate = w;
                        else if (
                            rect.y !== bestRect.y &&
                Math.abs(activeRect.y - rect.y) < Math.abs(activeRect.y - bestRect.y)
                        )
                            bestCandidate = w;
                    }
                }
            });
            break;
        }

        if (!bestCandidate) {
            const newMonitor = this._getMonitorByDirection(id, monitor);
            if (newMonitor !== null) {
                return this._getBestCandidate(
                    id,
                    newMonitor,
                    this._activeWindow.get_display().get_monitor_geometry(monitor)
                );
            }
        }

        return bestCandidate;
    }

    _getAllWindows(monitor) {
        const workspace = this._workspaceManager.get_active_workspace();
        const windows = workspace.list_windows();
        return windows.filter(w => w.get_monitor() === monitor && w.is_hidden() === false);
    }

    _getActiveWindow() {
        const workspace = this._workspaceManager.get_active_workspace();
        const windows = workspace.list_windows();

        let focusedWindow = null;
        let focusedWindowRect = null;

        for (let window of windows) {
            if (window.has_focus()) {
                focusedWindow = window;
                focusedWindowRect = window.get_frame_rect();
                break;
            }
        }

        return { activeWindow: focusedWindow, activeRect: focusedWindowRect };
    }

    _bindShortcut() {
        this._keySwapUpId = SCHEMA_SWAP_UP;
        this._keySwapDownId = SCHEMA_SWAP_DOWN;
        this._keySwapRightId = SCHEMA_SWAP_RIGHT;
        this._keySwapLeftId = SCHEMA_SWAP_LEFT;

        Main.wm.addKeybinding(
            this._keySwapUpId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.swapWindow(this._keySwapUpId)
        );
        Main.wm.addKeybinding(
            this._keySwapDownId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.swapWindow(this._keySwapDownId)
        );
        Main.wm.addKeybinding(
            this._keySwapRightId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.swapWindow(this._keySwapRightId)
        );
        Main.wm.addKeybinding(
            this._keySwapLeftId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.swapWindow(this._keySwapLeftId)
        );
    }

    _unbindShortcut() {
        if (this._keySwapUpId !== null)
            Main.wm.removeKeybinding(this._keySwapUpId);
        if (this._keySwapDownId !== null)
            Main.wm.removeKeybinding(this._keySwapDownId);
        if (this._keySwapRightId !== null)
            Main.wm.removeKeybinding(this._keySwapRightId);
        if (this._keySwapLeftId !== null)
            Main.wm.removeKeybinding(this._keySwapLeftId);

        this._keySwapUpId = null;
        this._keySwapDownId = null;
        this._keySwapRightId = null;
        this._keySwapLeftId = null;
    }

    enable() {
        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.multi-monitor-swap');
        this._bindShortcut();
    }

    disable() {
        this._unbindShortcut();
        this._settings = null;
    }
}

// eslint-disable-next-line no-unused-vars
function init() {
    return new MultiMonitorSwap();
}
