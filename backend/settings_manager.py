import os
import json
import decky

class SettingsManager:
    def __init__(self):
        self.settings_file = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "settings.json")
        self.settings = self._load()

    def _load(self):
        if os.path.exists(self.settings_file):
            try:
                with open(self.settings_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                decky.logger.error(f"Error loading settings: {e}")
        return {}

    def _save(self):
        try:
            os.makedirs(decky.DECKY_PLUGIN_SETTINGS_DIR, exist_ok=True)
            with open(self.settings_file, "w") as f:
                json.dump(self.settings, f)
        except Exception as e:
            decky.logger.error(f"Error saving settings: {e}")

    def getSetting(self, key, default=None):
        return self.settings.get(key, default)

    def setSetting(self, key, value):
        self.settings[key] = value
        self._save()

    def getDeviceSetting(self, device_name, key, default=None):
        device_settings = self.settings.get("device_settings", {})
        if device_name in device_settings:
            return device_settings[device_name].get(key, default)
        return default
        
    def setDeviceSetting(self, device_name, key, value):
        if "device_settings" not in self.settings:
            self.settings["device_settings"] = {}
        if device_name not in self.settings["device_settings"]:
            self.settings["device_settings"][device_name] = {}
            
        self.settings["device_settings"][device_name][key] = value
        self._save()
