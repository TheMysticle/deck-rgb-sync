import asyncio
import time
import decky
from .rgb_controller import RGBController
from .animations import AnimationEngine

class StateMachine:
    def __init__(self, settings_manager):
        self.settings = settings_manager
        self.rgb = RGBController()
        
        self.running = False
        
        self.state = "IDLE"
        self.active_download_percent = 0.0
        self.last_update_time = time.time()
        
        # State-specific timing variables
        self.state_start_time = 0.0
        self.paused_blink_count = 0
        self.paused_last_toggle = 0.0
        self.paused_is_on = True
        
        self.last_render_hash = None
        
    def set_download_state(self, state: str, percent: float):
        if percent is not None and percent >= 0:
            self.active_download_percent = percent
            
        self.last_update_time = time.time()
        
        if state != self.state:
            # Prevent IDLE from interrupting ephemeral states
            if state == "IDLE" and self.state in ["PAUSED", "COMPLETE", "FAILED"]:
                return
                
            # We only transition to PAUSED if we were actually DOWNLOADING
            if state == "PAUSED" and self.state != "DOWNLOADING":
                return
                
            self.state = state
            self.state_start_time = time.time()
            if state == "PAUSED":
                self.paused_blink_count = 0
                self.paused_last_toggle = time.time()
                self.paused_is_on = True

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
                    if self.last_render_hash != "off":
                        self.rgb.blank_all()
                        self.last_render_hash = "off"
                    await asyncio.sleep(1)
                    continue
                
                device_list = self.settings.getSetting("enabled_devices", [])
                device_settings = self.settings.getSetting("device_settings", {})
                mode = self.settings.getSetting("mode", "auto")
                
                now = time.time()
                
                # Check timeout for downloading (if Steam crashes or stops sending events)
                if self.state == "DOWNLOADING" and (now - self.last_update_time) > 10.0:
                    self.state = "IDLE"

                # Automatically return to IDLE after 10 seconds of COMPLETE or FAILED
                if self.state in ["COMPLETE", "FAILED"]:
                    if now - self.state_start_time > 10.0:
                        self.state = "IDLE"

                if mode == "auto":
                    if self.state == "DOWNLOADING":
                        dl_color = self.settings.getSetting("download_color", "#0088ff")
                        self.rgb.set_zone_fill(device_list, self.active_download_percent, dl_color, "#000000", device_settings)
                        self.last_render_hash = "download"
                        await asyncio.sleep(0.05) # 20fps for smooth progress bar
                        continue
                        
                    elif self.state == "PAUSED":
                        # Blink yellow twice at current progress
                        pause_color = "#ffff00" # Yellow
                        
                        if now - self.paused_last_toggle > 0.5:
                            self.paused_last_toggle = now
                            self.paused_is_on = not self.paused_is_on
                            if self.paused_is_on:
                                self.paused_blink_count += 1
                                
                        if self.paused_blink_count >= 2:
                            self.state = "IDLE"
                            continue
                            
                        if self.paused_is_on:
                            self.rgb.set_zone_fill(device_list, self.active_download_percent, pause_color, "#000000", device_settings)
                        else:
                            self.rgb.set_zone_fill(device_list, self.active_download_percent, "#000000", "#000000", device_settings)
                            
                        self.last_render_hash = "paused_blink"
                        await asyncio.sleep(0.05)
                        continue
                        
                    elif self.state == "COMPLETE":
                        comp_color = self.settings.getSetting("complete_color", "#00ff00")
                        comp_anim = self.settings.getSetting("complete_anim", "Solid")
                        c_obj = self.rgb.hex_to_rgb(comp_color)
                        c_tuple = (c_obj.red, c_obj.green, c_obj.blue)
                        frame_color = AnimationEngine.get_frame(comp_anim, c_tuple, (0,0,0), now - self.state_start_time)
                        hex_frame = "#{:02x}{:02x}{:02x}".format(*frame_color)
                        self.rgb.set_solid_color(device_list, hex_frame)
                        self.last_render_hash = "complete_anim"
                        await asyncio.sleep(0.05)
                        continue
                        
                    elif self.state == "FAILED":
                        fail_color = self.settings.getSetting("failed_color", "#ff0000")
                        fail_anim = self.settings.getSetting("failed_anim", "Blink")
                        c_obj = self.rgb.hex_to_rgb(fail_color)
                        c_tuple = (c_obj.red, c_obj.green, c_obj.blue)
                        frame_color = AnimationEngine.get_frame(fail_anim, c_tuple, (0,0,0), now - self.state_start_time)
                        hex_frame = "#{:02x}{:02x}{:02x}".format(*frame_color)
                        self.rgb.set_solid_color(device_list, hex_frame)
                        self.last_render_hash = "failed_anim"
                        await asyncio.sleep(0.05)
                        continue
                        
                    elif self.state == "SYS_UPDATE":
                        sys_color = self.settings.getSetting("sysupdate_color", "#0000ff")
                        sys_anim = self.settings.getSetting("sysupdate_anim", "Pulse")
                        c_obj = self.rgb.hex_to_rgb(sys_color)
                        c_tuple = (c_obj.red, c_obj.green, c_obj.blue)
                        frame_color = AnimationEngine.get_frame(sys_anim, c_tuple, (0,0,0), now - self.state_start_time)
                        hex_frame = "#{:02x}{:02x}{:02x}".format(*frame_color)
                        self.rgb.set_solid_color(device_list, hex_frame)
                        self.last_render_hash = "sysupdate_anim"
                        await asyncio.sleep(0.05)
                        continue

                # IDLE state or manual Solid Mode
                color = self.settings.getSetting("solid_color", "#ffffff")
                state_key = f"solid_{color}_{str(device_list)}"
                if self.last_render_hash != state_key:
                    self.rgb.set_solid_color(device_list, color)
                    self.last_render_hash = state_key
                await asyncio.sleep(1)
                    
            except Exception as e:
                decky.logger.error(f"State machine error: {e}")
                await asyncio.sleep(5)

    def stop(self):
        self.running = False
        if self.rgb.connected:
            self.rgb.blank_all()
            self.rgb.disconnect()
