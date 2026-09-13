import os
import sys

# Add the plugin directory to path so the backend module can be imported
sys.path.append(os.path.dirname(__file__))
sys.path.append(os.path.join(os.path.dirname(__file__), "py_modules"))

import decky
import asyncio
import logging

from backend.state_machine import StateMachine
from backend.settings_manager import SettingsManager

class Plugin:
    async def get_setting(self, key: str, default=None):
        return self.settings_manager.getSetting(key, default)

    async def set_setting(self, key: str, value):
        self.settings_manager.setSetting(key, value)
        return True

    async def get_devices(self):
        return self.state_machine.rgb.get_devices()

    async def push_download_progress(self, percent: float, debug_payload: str = ""):
        if debug_payload:
            decky.logger.info(f"Steam Download Overview Payload: {debug_payload}")
            
        if percent is None or percent < 0:
            self.state_machine.set_download_progress(None)
        else:
            self.state_machine.set_download_progress(percent)
        return True

    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("Starting Deck RGB Sync Plugin")
        
        self.settings_manager = SettingsManager()
        # Initialize master_enabled to False on first run (off by default)
        if self.settings_manager.getSetting("master_enabled") is None:
            self.settings_manager.setSetting("master_enabled", False)
            
        self.state_machine = StateMachine(self.settings_manager)
        self.sm_task = self.loop.create_task(self.state_machine.loop())

    async def _unload(self):
        decky.logger.info("Unloading Deck RGB Sync")
        if hasattr(self, 'state_machine'):
            self.state_machine.stop()
        if hasattr(self, 'sm_task'):
            self.sm_task.cancel()

    async def _uninstall(self):
        decky.logger.info("Uninstalling Deck RGB Sync")
        pass

    async def _migration(self):
        pass
