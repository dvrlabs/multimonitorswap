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
        this._keySwapUpId = null;
        this._keySwapDownId = null;
        this._keySwapRightId = null;
        this._keySwapLeftId = null;
    }

    swapWindow(direction) {
        // Acquire required window and monitor variables to swap.
        const { focusedWindow, 
                currentMonitor, 
                inertWindow,
                nextMonitor } = this._getWindowsAndMonitors(direction);

        // If either window was not found, do nothing
        if (!focusedWindow) return;
        if (!inertWindow) return;

        //Swap the windows to each others monitors. 
        inertWindow.move_to_monitor(currentMonitor); 
        focusedWindow.move_to_monitor(nextMonitor);

        //Keep focus on the original monitor...
        focusedWindow.activate(global.get_current_time());
    }


    _getWindowsAndMonitors(direction) {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();

        let focusedWindow = null;
        for (let window of windows) {
            if (window.has_focus()) {
                focusedWindow = window;
                break;
            }
        }

        if (direction == 'swap-up') direction = Meta.DisplayDirection.UP;
        if (direction == 'swap-down') direction = Meta.DisplayDirection.DOWN;
        if (direction == 'swap-right') direction = Meta.DisplayDirection.RIGHT;
        if (direction == 'swap-left') direction = Meta.DisplayDirection.LEFT;

        let inertWindow = null;
        let currentMonitor = focusedWindow.get_monitor();
        let nextMonitor = global.display.get_monitor_neighbor_index(currentMonitor, direction);
        const nextWindows = windows.filter(w => w.get_monitor() === nextMonitor && w.is_hidden() === false);
        inertWindow = nextWindows[0]; 

        return {focusedWindow, currentMonitor, inertWindow, nextMonitor};
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
