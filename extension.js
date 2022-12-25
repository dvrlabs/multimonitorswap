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
        // if (direction == 'swap-up') direction = Meta.DisplayDirection.UP;
        // if (direction == 'swap-down') direction = Meta.DisplayDirection.DOWN;
        // if (direction == 'swap-right') direction = Meta.DisplayDirection.RIGHT;
        // if (direction == 'swap-left') direction = Meta.DisplayDirection.LEFT;
        
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

        this._keySwapUpId = null;
        this._keySwapDownId = null;
        this._keySwapRightId = null;
        this._keySwapLeftId = null;

        this._keyFocusUpId = null;
        this._keyFocusDownId = null;
        this._keyFocusRightId = null;
        this._keyFocusLeftId = null;

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
