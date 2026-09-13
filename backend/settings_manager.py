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
