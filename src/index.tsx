import {
    PanelSection,
    PanelSectionRow,
    staticClasses,
} from "@decky/ui";
import { definePlugin, callable } from "@decky/api";
import { SteamClient } from "decky-frontend-lib";
import { FaMemory } from "react-icons/fa";

import { MasterToggle } from "./components/MasterToggle";
import { ModeSettings } from "./components/ModeSettings";
import { DeviceList } from "./components/DeviceList";
import { ColorPicker } from "./components/ColorPicker";
import { ConnectionSettings } from "./components/ConnectionSettings";
import { AnimationPicker } from "./components/AnimationPicker";

function Content() {
    return (
        <PanelSection title="General">
            <PanelSectionRow>
                <MasterToggle />
            </PanelSectionRow>
            <PanelSectionRow>
                <ConnectionSettings />
            </PanelSectionRow>
            <PanelSection title="Devices">
                <DeviceList />
            </PanelSection>
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
        </PanelSection>
    );
}

function StatusContent() {
    return (
        <PanelSection title="Download Complete">
            <PanelSectionRow>
                <ColorPicker label="Color" settingKey="complete_color" defaultValue="#00ff00" />
            </PanelSectionRow>
            <PanelSectionRow>
                <AnimationPicker label="Animation" settingKey="complete_anim" defaultAnim="Solid" />
            </PanelSectionRow>
        </PanelSection>
    );
}

function ErrorContent() {
    return (
        <PanelSection title="Download Failed">
            <PanelSectionRow>
                <ColorPicker label="Color" settingKey="failed_color" defaultValue="#ff0000" />
            </PanelSectionRow>
            <PanelSectionRow>
                <AnimationPicker label="Animation" settingKey="failed_anim" defaultAnim="Blink" />
            </PanelSectionRow>
        </PanelSection>
    );
}

function SystemUpdateContent() {
    return (
        <PanelSection title="System Update">
            <PanelSectionRow>
                <ColorPicker label="Color" settingKey="sysupdate_color" defaultValue="#0000ff" />
            </PanelSectionRow>
            <PanelSectionRow>
                <AnimationPicker label="Animation" settingKey="sysupdate_anim" defaultAnim="Pulse" />
            </PanelSectionRow>
        </PanelSection>
    );
}

const pushDownloadProgress = callable<[state: string, percent: number | null, debug_payload: string], boolean>("push_download_progress");

let downloadOverviewRegistration: any = null;
let lastState = "IDLE";
let lastPercent = 0.0;

const startDownloadListener = () => {
    try {
        const downloadsApi = (SteamClient as any).Downloads;
        if (downloadsApi && typeof downloadsApi.RegisterForDownloadOverview === 'function') {
            downloadOverviewRegistration = downloadsApi.RegisterForDownloadOverview((overview: any) => {
                const debugPayload = JSON.stringify(overview);
                
                let active = null;
                if (overview) {
                    const percent = (overview.overall_percent_complete !== undefined) ? overview.overall_percent_complete / 100.0 : null;
                    if (percent !== null) {
                        lastPercent = percent;
                    }
                    
                    if (overview.paused || overview.update_state === "Paused" || overview.update_state === "Suspended") {
                        lastState = "PAUSED";
                        pushDownloadProgress("PAUSED", percent, debugPayload);
                        return;
                    }
                    
                    if (overview.update_state) {
                        if (overview.update_state === "Complete" || overview.update_state === "Completed") {
                            lastState = "COMPLETE";
                            pushDownloadProgress("COMPLETE", percent, debugPayload);
                            return;
                        } else if (overview.update_state === "Failed") {
                            lastState = "FAILED";
                            pushDownloadProgress("FAILED", percent, debugPayload);
                            return;
                        } else if (overview.update_state !== "None") {
                            lastState = "DOWNLOADING";
                            pushDownloadProgress("DOWNLOADING", percent, debugPayload);
                            return;
                        }
                    }
                }
                
                if (lastState === "DOWNLOADING" && lastPercent >= 0.99) {
                    lastState = "COMPLETE";
                    pushDownloadProgress("COMPLETE", 1.0, debugPayload);
                    return;
                }
                
                // Fallthrough
                lastState = "IDLE";
                pushDownloadProgress("IDLE", 0, debugPayload);
            });
        } else {
            pushDownloadProgress("IDLE", null, "RegisterForDownloadOverview is missing");
        }
    } catch (e) {
        console.error("Error registering for downloads", e);
    }
};

export default definePlugin((serverApi: any) => {
    // Start listening to Steam download events when plugin mounts
    startDownloadListener();

    return {
        name: "Deck RGB Sync",
        titleView: <div className={staticClasses.Title}>Deck RGB Sync</div>,
        content: (
            <>
                <Content />
                <ColorsContent />
                <StatusContent />
                <ErrorContent />
                <SystemUpdateContent />
            </>
        ),
        icon: <FaMemory />,
        onDismount() {
            if (downloadOverviewRegistration && typeof downloadOverviewRegistration.unregister === 'function') {
                downloadOverviewRegistration.unregister();
            }
            pushDownloadProgress("IDLE", null, "Plugin dismounted");
            console.log("Deck RGB Sync unmounted");
        },
    };
});
