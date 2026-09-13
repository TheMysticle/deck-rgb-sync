from openrgb import OpenRGBClient
from openrgb.utils import RGBColor
import decky
import logging

class RGBController:
    def __init__(self, host='localhost', port=6742):
        self.host = host
        self.port = port
        self.client = None
        self.connected = False

    def connect(self):
        try:
            if self.client:
                self.client.disconnect()
        except:
            pass
            
        try:
            self.client = OpenRGBClient(self.host, self.port, "deck-rgb-sync")
            self.client.update()
            self.connected = True
            decky.logger.info(f"Connected to OpenRGB at {self.host}:{self.port}")
        except Exception as e:
            self.client = None
            self.connected = False
            decky.logger.debug(f"Failed to connect to OpenRGB: {e}")

    def disconnect(self):
        if self.client:
            try:
                self.client.disconnect()
            except:
                pass
            self.client = None
            self.connected = False

    def get_devices(self):
        if not self.connected or not self.client:
            return []
        
        try:
            devices = []
            for d in self.client.devices:
                device_info = {
                    "id": d.id,
                    "name": d.name,
                    "zones": []
                }
                for z in d.zones:
                    device_info["zones"].append({
                        "id": z.id,
                        "name": z.name,
                        "led_count": len(z.leds)
                    })
                devices.append(device_info)
            return devices
        except Exception as e:
            decky.logger.error(f"Error getting devices: {e}")
            self.connected = False
            return []

    def blank_all(self):
        if not self.connected or not self.client:
            return
        try:
            for device in self.client.devices:
                device.clear()
        except Exception as e:
            decky.logger.error(f"Error clearing devices: {e}")
            self.connected = False

    def hex_to_rgb(self, hex_color: str) -> RGBColor:
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 6:
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            return RGBColor(r, g, b)
        return RGBColor(0, 0, 0)

    def set_solid_color(self, device_id: int, zone_id: int, hex_color: str):
        if not self.connected or not self.client:
            return
            
        try:
            if device_id < len(self.client.devices):
                device = self.client.devices[device_id]
                if zone_id < len(device.zones):
                    zone = device.zones[zone_id]
                    color = self.hex_to_rgb(hex_color)
                    colors = [color] * len(zone.leds)
                    zone.set_colors(colors, fast=True)
        except Exception as e:
            decky.logger.error(f"Error setting solid color: {e}")
            self.connected = False

    def set_zone_fill(self, device_id: int, zone_id: int, percent: float, fill_hex: str, bg_hex: str = "#000000"):
        if not self.connected or not self.client:
            return
            
        try:
            if device_id < len(self.client.devices):
                device = self.client.devices[device_id]
                if zone_id < len(device.zones):
                    zone = device.zones[zone_id]
                    num_leds = len(zone.leds)
                    if num_leds == 0:
                        return
                    
                    fill_count = int(num_leds * percent)
                    
                    fill_color = self.hex_to_rgb(fill_hex)
                    bg_color = self.hex_to_rgb(bg_hex)
                    
                    colors = []
                    for i in range(num_leds):
                        if i < fill_count:
                            colors.append(fill_color)
                        else:
                            colors.append(bg_color)
                    
                    zone.set_colors(colors, fast=True)
        except Exception as e:
            decky.logger.error(f"Error setting zone fill: {e}")
            self.connected = False
