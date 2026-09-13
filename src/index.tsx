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

const pushDownloadProgress = callable<[percent: number | null, debug_payload: string], boolean>("push_download_progress");

let downloadOverviewRegistration: any = null;

const startDownloadListener = () => {
    try {
        const downloadsApi = (SteamClient as any).Downloads;
        if (downloadsApi && typeof downloadsApi.RegisterForDownloadOverview === 'function') {
            downloadOverviewRegistration = downloadsApi.RegisterForDownloadOverview((overview: any) => {
                const debugPayload = JSON.stringify(overview);
                
                let active = null;
                if (overview) {
                    if (overview.overall_percent_complete !== undefined && overview.update_state && overview.update_state !== "None") {
                        if (overview.update_state === "Complete") {
                            pushDownloadProgress(null, debugPayload);
                            return;
                        }
                        const percent = overview.overall_percent_complete / 100.0;
                        pushDownloadProgress(percent, debugPayload);
                        return;
                    }
                    
                    // Fallback to older Steam payload structures just in case
                    if (overview.active_downloads && overview.active_downloads.length > 0) {
                        active = overview.active_downloads[0];
                    } else if (overview.update_network_bytes_total > 0) {
                         const percent = overview.update_network_bytes_downloaded / overview.update_network_bytes_total;
                         pushDownloadProgress(percent, debugPayload);
                         return;
                    }

                    if (active && active.bytes_downloaded !== undefined && active.bytes_total !== undefined && active.bytes_total > 0) {
                        const percent = active.bytes_downloaded / active.bytes_total;
                        pushDownloadProgress(percent, debugPayload);
                        return;
                    }
                }
                
                // Fallthrough if we got an overview but didn't match the heuristics
                pushDownloadProgress(null, debugPayload);
            });
        } else {
            pushDownloadProgress(null, "RegisterForDownloadOverview is missing");
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
            </>
        ),
        icon: <FaMemory />,
        onDismount() {
            if (downloadOverviewRegistration && typeof downloadOverviewRegistration.unregister === 'function') {
                downloadOverviewRegistration.unregister();
            }
            pushDownloadProgress(null, "Plugin dismounted");
            console.log("Deck RGB Sync unmounted");
        },
    };
});
