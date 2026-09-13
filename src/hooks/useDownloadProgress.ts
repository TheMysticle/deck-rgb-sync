import { useEffect, useState } from "react";
import { callable } from "@decky/api";

declare const SteamClient: any;

const pushDownloadProgress = callable<[{percent: number | null}], boolean>("push_download_progress");

export function useDownloadProgress() {
    const [downloadPercent, setDownloadPercent] = useState<number | null>(null);

    useEffect(() => {
        let timer: any;
        
        const pollDownloads = async () => {
            try {
                if (SteamClient && SteamClient.Downloads && SteamClient.Downloads.GetOverview) {
                    const overview = await SteamClient.Downloads.GetOverview();
                    // Some steam client versions use different payload structures.
                    // This attempts to find active downloads.
                    let active = null;
                    if (overview && overview.active_downloads && overview.active_downloads.length > 0) {
                        active = overview.active_downloads[0];
                    } else if (overview && overview.update_network_bytes_total > 0) {
                         // Fallback heuristic if active_downloads isn't present
                         const percent = overview.update_network_bytes_downloaded / overview.update_network_bytes_total;
                         setDownloadPercent(percent);
                         pushDownloadProgress({percent});
                         return;
                    }

                    if (active && active.bytes_downloaded !== undefined && active.bytes_total !== undefined && active.bytes_total > 0) {
                        const percent = active.bytes_downloaded / active.bytes_total;
                        setDownloadPercent(percent);
                        pushDownloadProgress({percent});
                        return;
                    }
                }
            } catch (e) {
                console.error("Error polling downloads", e);
            }
            
            // If we fall through, no active download
            setDownloadPercent(null);
            pushDownloadProgress({percent: null});
        };

        timer = setInterval(pollDownloads, 1000);
        pollDownloads();

        return () => {
            clearInterval(timer);
            pushDownloadProgress({percent: null});
        };
    }, []);

    return downloadPercent;
}
