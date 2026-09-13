import asyncio
import decky
from .rgb_controller import RGBController

class StateMachine:
    def __init__(self, settings_manager):
        self.settings = settings_manager
        self.rgb = RGBController()
        
        self.running = False
        self.active_download_percent = None
        self.last_download_update = 0
        
        self.last_render_state = None  # To avoid unnecessary updates
        
    def set_download_progress(self, percent: float):
        self.active_download_percent = percent
        self.last_download_update = asyncio.get_event_loop().time()

    async def loop(self):
        self.running = True
        
        while self.running:
            try:
                if not self.rgb.connected:
                    host = self.settings.getSetting("openrgb_host", "localhost")
                    port = int(self.settings.getSetting("openrgb_port", 6742))
                    self.rgb.host = host
                    self.rgb.port = port
                    self.rgb.connect()
                    
                if not self.rgb.connected:
                    await asyncio.sleep(5)
                    continue

                master_enabled = self.settings.getSetting("master_enabled", False)
                
                if not master_enabled:
                    if self.last_render_state != "off":
                        self.rgb.blank_all()
                        self.last_render_state = "off"
                    await asyncio.sleep(1)
                    continue
                
                device_list = self.settings.getSetting("enabled_devices", [])
                
                # Check download timeout (5 seconds)
                now = asyncio.get_event_loop().time()
                if self.active_download_percent is not None and (now - self.last_download_update) > 5.0:
                    self.active_download_percent = None
                
                mode = self.settings.getSetting("mode", "auto")
                
                if self.active_download_percent is not None and mode == "auto":
                    # Download Mode
                    dl_color = self.settings.getSetting("download_color", "#0088ff")
                    percent = self.active_download_percent
                    self.rgb.set_zone_fill(device_list, percent, dl_color)
                    self.last_render_state = "download"
                    await asyncio.sleep(0.1) # Smooth updates for download
                else:
                    # Solid Mode (fallback when auto but no download, or explicitly solid)
                    color = self.settings.getSetting("solid_color", "#ffffff")
                    state_key = f"solid_{color}_{str(device_list)}"
                    if self.last_render_state != state_key:
                        self.rgb.set_solid_color(device_list, color)
                        self.last_render_state = state_key
                    await asyncio.sleep(1)
                    
            except Exception as e:
                decky.logger.error(f"State machine error: {e}")
                await asyncio.sleep(5)

    def stop(self):
        self.running = False
        if self.rgb.connected:
            self.rgb.blank_all()
            self.rgb.disconnect()
