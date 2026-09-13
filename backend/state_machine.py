import asyncio
import decky
from .rgb_controller import RGBController
from .ram_monitor import RAMMonitor

class StateMachine:
    def __init__(self, settings_manager):
        self.settings = settings_manager
        self.rgb = RGBController()
        self.ram = RAMMonitor()
        
        self.running = False
        self.active_download_percent = None
        self.last_download_update = 0
        
        self.last_render_state = None  # To avoid unnecessary updates
        
    def set_download_progress(self, percent: float):
        self.active_download_percent = percent
        self.last_download_update = asyncio.get_event_loop().time()

    def get_ram_color(self, percent: float) -> str:
        # Default colors
        low_color = self.settings.getSetting("ram_color_low", "#00ff00")
        med_color = self.settings.getSetting("ram_color_med", "#ffff00")
        high_color = self.settings.getSetting("ram_color_high", "#ff0000")
        
        thresh_low = self.settings.getSetting("ram_thresh_low", 0.6)
        thresh_high = self.settings.getSetting("ram_thresh_high", 0.85)
        
        if percent < thresh_low:
            return low_color
        elif percent < thresh_high:
            return med_color
        else:
            return high_color

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
                
                device_id = self.settings.getSetting("active_device_id", -1)
                zone_id = self.settings.getSetting("active_zone_id", -1)
                
                if device_id == -1 or zone_id == -1:
                    await asyncio.sleep(1)
                    continue

                mode = self.settings.getSetting("mode", "auto") # "auto", "solid"

                if mode == "solid":
                    color = self.settings.getSetting("solid_color", "#ffffff")
                    state_key = f"solid_{color}"
                    if self.last_render_state != state_key:
                        self.rgb.set_solid_color(device_id, zone_id, color)
                        self.last_render_state = state_key
                    await asyncio.sleep(1)
                    continue
                
                # Check download timeout (5 seconds)
                now = asyncio.get_event_loop().time()
                if self.active_download_percent is not None and (now - self.last_download_update) > 5.0:
                    self.active_download_percent = None
                
                if self.active_download_percent is not None:
                    # Download Mode
                    dl_color = self.settings.getSetting("download_color", "#0088ff")
                    percent = self.active_download_percent
                    self.rgb.set_zone_fill(device_id, zone_id, percent, dl_color)
                    self.last_render_state = "download"
                    await asyncio.sleep(0.1) # Smooth updates for download
                else:
                    # RAM Mode
                    self.ram.sample()
                    percent = self.ram.get_smoothed_percent()
                    color = self.get_ram_color(percent)
                    self.rgb.set_zone_fill(device_id, zone_id, percent, color)
                    self.last_render_state = "ram"
                    await asyncio.sleep(1)
                    
            except Exception as e:
                decky.logger.error(f"State machine error: {e}")
                await asyncio.sleep(5)

    def stop(self):
        self.running = False
        if self.rgb.connected:
            self.rgb.blank_all()
            self.rgb.disconnect()
