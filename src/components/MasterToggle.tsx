import { ToggleField } from "@decky/ui";
import { useSetting } from "../hooks/useSetting";

export function MasterToggle() {
    const [enabled, setEnabled, loaded] = useSetting<boolean>("master_enabled", false);

    if (!loaded) return null;

    return (
        <ToggleField
            label="Enable RGB Sync"
            description="Master toggle to enable or disable OpenRGB integration"
            checked={enabled}
            onChange={(val) => setEnabled(val)}
        />
    );
}
