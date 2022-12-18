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
        // Acquire the active focused window as a starting point.
        const activeWindow = this._getActiveWindow();
        if (!activeWindow) return;

        // Reassign the directional constants to the required enum for acquring neighbor index.
        if (direction == 'swap-up') direction = Meta.DisplayDirection.UP;
        if (direction == 'swap-down') direction = Meta.DisplayDirection.DOWN;
        if (direction == 'swap-right') direction = Meta.DisplayDirection.RIGHT;
        if (direction == 'swap-left') direction = Meta.DisplayDirection.LEFT;

        // Accordings to active window display & monitor,
        // find the next monitor by given direction. 
        // find the inactive window, on the next monitor
        let currentMonitor = activeWindow.get_monitor();
        let nextMonitor = global.display.get_monitor_neighbor_index(currentMonitor, direction);
        const windows = this._getAllWindows(nextMonitor);
        const inertWindow = windows[0]; 

        //Swap the windows to each others monitors. 
        inertWindow.move_to_monitor(currentMonitor); 
        activeWindow.move_to_monitor(nextMonitor);

        //Keep focus on the original monitor...
        activeWindow.activate(global.get_current_time());

    }

    _getAllWindows(monitor) {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();
        return windows.filter(w => w.get_monitor() === monitor && w.is_hidden() === false);
    }

    _getActiveWindow() {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();

        let focusedWindow = null;

        for (let window of windows) {
            if (window.has_focus()) {
                focusedWindow = window;
                break;
            }
        }

        return focusedWindow;
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
