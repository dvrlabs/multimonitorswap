'use strict';

const { Shell, Meta } = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

class MultiMonitorSwap {
    constructor() {
        this._keySwapUpId = null;
        this._keySwapDownId = null;
        this._keySwapRightId = null;
        this._keySwapLeftId = null;
    }

    swapWindow(direction) {
        const { focusedWindow, 
                currentMonitor, 
                inertWindow,
                nextMonitor } = this._getWindowsAndMonitors(direction);

        if (!focusedWindow) return;
        if (!inertWindow) return;

        inertWindow.move_to_monitor(currentMonitor); 
        focusedWindow.move_to_monitor(nextMonitor);
    }

    _getWindowsAndMonitors(direction) {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();
        let focusedWindow = null;
        let inertWindow = null;

        focusedWindow = windows.filter(w => 
            w.has_focus() && 
            !w.is_hidden() && 
            w.get_wm_class() != "gjs")[0];

        let currentMonitor = focusedWindow.get_monitor();

        let nextMonitor = global.display.get_monitor_neighbor_index(
            currentMonitor, this._getEnumDir(direction));

        inertWindow = windows.filter(w => 
            w.get_monitor() === nextMonitor && 
            w.is_hidden() === false && 
            w.get_wm_class() != "gjs")[0];

        return {focusedWindow, currentMonitor, inertWindow, nextMonitor};
    }

    _getEnumDir(direction){
        //'get_monitor_neighbor_index' expects a DisplayDirection enum.
        if (direction == 'swap-up') direction = Meta.DisplayDirection.UP;
        if (direction == 'swap-down') direction = Meta.DisplayDirection.DOWN;
        if (direction == 'swap-right') direction = Meta.DisplayDirection.RIGHT;
        if (direction == 'swap-left') direction = Meta.DisplayDirection.LEFT;

        return direction
    }

    _bindShortcut() {
        this._keySwapUpId = 'swap-up';
        this._keySwapDownId = 'swap-down';
        this._keySwapRightId = 'swap-right';
        this._keySwapLeftId = 'swap-left';

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
