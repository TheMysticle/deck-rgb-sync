import {
    PanelSection,
    PanelSectionRow,
    staticClasses,
} from "@decky/ui";
import { definePlugin } from "@decky/api";
import { FaMemory } from "react-icons/fa";

import { MasterToggle } from "./components/MasterToggle";
import { ModeSettings } from "./components/ModeSettings";
import { ZonePicker } from "./components/ZonePicker";
import { ColorPicker } from "./components/ColorPicker";
import { useDownloadProgress } from "./hooks/useDownloadProgress";

function Content() {
    // This hook will start polling for download progress and pushing to the backend
    const downloadPercent = useDownloadProgress();

    return (
        <PanelSection title="General">
            <PanelSectionRow>
                <MasterToggle />
            </PanelSectionRow>
            <PanelSectionRow>
                <ZonePicker />
            </PanelSectionRow>
            <PanelSectionRow>
                <ModeSettings />
            </PanelSectionRow>
        </PanelSection>
    );
}

function ColorsContent() {
    return (
        <PanelSection title="Colors">
            <PanelSectionRow>
                <ColorPicker label="Solid Color" settingKey="solid_color" defaultValue="#ffffff" />
            </PanelSectionRow>
            <PanelSectionRow>
                <ColorPicker label="Download Color" settingKey="download_color" defaultValue="#0088ff" />
            </PanelSectionRow>
            <PanelSectionRow>
                <ColorPicker label="RAM Low Color" settingKey="ram_color_low" defaultValue="#00ff00" />
            </PanelSectionRow>
            <PanelSectionRow>
                <ColorPicker label="RAM Medium Color" settingKey="ram_color_med" defaultValue="#ffff00" />
            </PanelSectionRow>
            <PanelSectionRow>
                <ColorPicker label="RAM High Color" settingKey="ram_color_high" defaultValue="#ff0000" />
            </PanelSectionRow>
        </PanelSection>
    );
}

export default definePlugin(() => {
    return {
        name: "Deck RGB Sync",
        titleView: <div className={staticClasses.Title}>Deck RGB Sync</div>,
        content: (
            <>
                <Content />
                <ColorsContent />
            </>
        ),
        icon: <FaMemory />,
        onDismount() {
            console.log("Deck RGB Sync unmounted");
        },
    };
});
