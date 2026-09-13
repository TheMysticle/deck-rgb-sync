import { DropdownItem } from "@decky/ui";
import { useSetting } from "../hooks/useSetting";

export function ModeSettings() {
    const [mode, setMode, loaded] = useSetting<string>("mode", "auto");

    if (!loaded) return null;

    const options = [
        { data: "auto", label: "Auto (Download / Solid)" },
        { data: "solid", label: "Solid Color" },
    ];

    return (
        <DropdownItem
            label="Lighting Mode"
            menuLabel="Lighting Mode"
            rgOptions={options}
            selectedOption={mode}
            onChange={(opt) => setMode(opt.data)}
        />
    );
}
