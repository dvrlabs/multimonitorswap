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

        this._keyFocusUpId = null;
        this._keyFocusDownId = null;
        this._keyFocusRightId = null;
        this._keyFocusLeftId = null;

        this._keySelectUpId = null;
        this._keySelectDownId = null;

        this._timeOut = null;
    }

    focusWindow(direction) {
        const { focusedWindow, 
                currentMonitor, 
                inertWindow,
                nextMonitor } = this._getWindowsAndMonitors(direction);

        if (!inertWindow) return;

        inertWindow.activate(global.get_current_time());
    }

    swapWindow(direction) {
        const { focusedWindow, 
                currentMonitor, 
                inertWindow,
                nextMonitor } = this._getWindowsAndMonitors(direction);

        if (!focusedWindow) {
            return;
        } 

        if (!inertWindow) {

            focusedWindow.move_to_monitor(nextMonitor);

            this._timeOut = setTimeout(function () {
                focusedWindow.activate(global.get_current_time());
            }, 66);

            return;
        } 

        inertWindow.move_to_monitor(currentMonitor); 
        focusedWindow.move_to_monitor(nextMonitor);
    }

    selectWindow(direction) {
        const {focusedWindow, currentWindows} = this._getWindowsForCurrentMonitor();

        if (!focusedWindow) return;
        if (!currentWindows) return;

        let index_adjust = null;
        if (direction === "select-up") index_adjust = 1;
        if (direction === "select-down") index_adjust = -1;

        let numWindows = currentWindows.length; 

        let lastWinIdx = numWindows - 1;
        let firstWinIdx = 0;

        const isCurrentWin = (win) => win.get_id() === focusedWindow.get_id();
        const currWinIdx = currentWindows.findIndex(isCurrentWin)

        let indexNow = currWinIdx + index_adjust;

        if (indexNow > lastWinIdx) indexNow = firstWinIdx;
        if (indexNow < firstWinIdx) indexNow = lastWinIdx;

        currentWindows[indexNow].activate(global.get_current_time());

    }


    _getWindowsAndMonitors(direction) {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();
        let focusedWindow = null;
        let inertWindow = null;

        focusedWindow = windows.filter(w => 
            w.has_focus() === true && 
            w.is_hidden() === false && 
            w.get_wm_class() !== "gjs")
            [0];

        let currentMonitor = focusedWindow.get_monitor();

        let nextMonitor = global.display.get_monitor_neighbor_index(
            currentMonitor, this._getEnumDir(direction)
        );


        let nextWindows = windows.filter(w => 
            w.get_monitor() === nextMonitor && 
            w.is_hidden() === false && 
            w.get_wm_class() !== "gjs");

        inertWindow = global.display.sort_windows_by_stacking(
            nextWindows
        )[nextWindows.length-1];

        return {focusedWindow, currentMonitor, inertWindow, nextMonitor};
    }

    _getWindowsForCurrentMonitor() {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();
        let focusedWindow = null;
        let currentWindows = null;

        focusedWindow = windows.filter(w => 
            w.has_focus() === true && 
            w.is_hidden() === false && 
            w.get_wm_class() !== "gjs")
            [0];

        let currentMonitor = focusedWindow.get_monitor();

        currentWindows = windows.filter(w => 
            w.get_monitor() === currentMonitor && 
            w.is_hidden() === false && 
            w.get_wm_class() !== "gjs");

        return {focusedWindow, currentWindows};
    }

    _getEnumDir(direction){
        //'get_monitor_neighbor_index' expects a DisplayDirection enum.
        if (['swap-up','focus-up'].includes(direction)) direction = Meta.DisplayDirection.UP;
        if (['swap-down','focus-down'].includes(direction)) direction = Meta.DisplayDirection.DOWN;
        if (['swap-right','focus-right'].includes(direction)) direction = Meta.DisplayDirection.RIGHT;
        if (['swap-left', 'focus-left'].includes(direction)) direction = Meta.DisplayDirection.LEFT;

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

        this._keyFocusUpId = 'focus-up';
        this._keyFocusDownId = 'focus-down';
        this._keyFocusRightId = 'focus-right';
        this._keyFocusLeftId = 'focus-left';

        Main.wm.addKeybinding(
            this._keyFocusUpId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.focusWindow(this._keyFocusUpId)
        );
        Main.wm.addKeybinding(
            this._keyFocusDownId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.focusWindow(this._keyFocusDownId)
        );
        Main.wm.addKeybinding(
            this._keyFocusRightId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.focusWindow(this._keyFocusRightId)
        );
        Main.wm.addKeybinding(
            this._keyFocusLeftId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.focusWindow(this._keyFocusLeftId)
        );


        this._keySelectUpId = 'select-up';
        this._keySelectDownId = 'select-down';

        Main.wm.addKeybinding(
            this._keySelectUpId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.selectWindow(this._keySelectUpId)
        );
        Main.wm.addKeybinding(
            this._keySelectDownId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.selectWindow(this._keySelectDownId)
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

        if (this._keyFocusUpId !== null)
            Main.wm.removeKeybinding(this._keyFocusUpId);
        if (this._keyFocusDownId !== null)
            Main.wm.removeKeybinding(this._keyFocusDownId);
        if (this._keyFocusRightId !== null)
            Main.wm.removeKeybinding(this._keyFocusRightId);
        if (this._keyFocusLeftId !== null)
            Main.wm.removeKeybinding(this._keyFocusLeftId);

        if (this._keySelectUpId !== null)
            Main.wm.removeKeybinding(this._keySelectUpId);
        if (this._keySelectDownId !== null)
            Main.wm.removeKeybinding(this._keySelectDownId);

        this._keySwapUpId = null;
        this._keySwapDownId = null;
        this._keySwapRightId = null;
        this._keySwapLeftId = null;

        this._keyFocusUpId = null;
        this._keyFocusDownId = null;
        this._keyFocusRightId = null;
        this._keyFocusLeftId = null;

        this._keySelectUpId = null;
        this._keySelectDownId = null;

    }

    enable() {
        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.multi-monitor-swap');
        this._bindShortcut();
    }

    disable() {
        this._unbindShortcut();
        this._settings = null;
        this._timeOut = null;
    }
}

// eslint-disable-next-line no-unused-vars
function init() {
    return new MultiMonitorSwap();
}
