import { DropdownItem } from "@decky/ui";
import { useSetting } from "../hooks/useSetting";

const PRESET_COLORS = [
    { data: "#000000", label: "Off (Black)" },
    { data: "#ffffff", label: "White" },
    { data: "#ff0000", label: "Red" },
    { data: "#00ff00", label: "Green" },
    { data: "#0000ff", label: "Blue" },
    { data: "#00ffff", label: "Cyan" },
    { data: "#ff00ff", label: "Magenta" },
    { data: "#ffff00", label: "Yellow" },
    { data: "#ff8800", label: "Orange" }
];

export function ColorPicker({ label, settingKey, defaultValue }: { label: string, settingKey: string, defaultValue: string }) {
    const [color, setColor, loaded] = useSetting<string>(settingKey, defaultValue);

    if (!loaded) return null;

    return (
        <DropdownItem
            label={label}
            menuLabel={label}
            selectedOption={color}
            rgOptions={PRESET_COLORS}
            onChange={(option) => setColor(option.data)}
        />
    );
}
