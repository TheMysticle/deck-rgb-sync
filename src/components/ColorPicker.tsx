import { TextField } from "@decky/ui";
import { useSetting } from "../hooks/useSetting";

export function ColorPicker({ label, settingKey, defaultValue }: { label: string, settingKey: string, defaultValue: string }) {
    const [color, setColor, loaded] = useSetting<string>(settingKey, defaultValue);

    if (!loaded) return null;

    return (
        <TextField
            label={label}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            description="Hex color code (e.g. #ff0000)"
        />
    );
}
