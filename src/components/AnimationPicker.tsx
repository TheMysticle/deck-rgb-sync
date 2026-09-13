import { DropdownItem } from "@decky/ui";
import { useSetting } from "../hooks/useSetting";

interface AnimationPickerProps {
    label: string;
    settingKey: string;
    defaultAnim: string;
}

const ANIMATIONS = [
    { label: "Solid", data: "Solid" },
    { label: "Blink", data: "Blink" },
    { label: "Breathe", data: "Breathe" },
    { label: "Pulse", data: "Pulse" }
];

export function AnimationPicker({ label, settingKey, defaultAnim }: AnimationPickerProps) {
    const [anim, setAnim, loaded] = useSetting<string>(settingKey, defaultAnim);

    if (!loaded) return null;

    return (
        <DropdownItem
            label={label}
            rgOptions={ANIMATIONS}
            selectedOption={anim}
            onChange={(data) => setAnim(data.data)}
        />
    );
}
