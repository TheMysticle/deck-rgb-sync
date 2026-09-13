import { TextField } from "@decky/ui";
import { useSetting } from "../hooks/useSetting";

export function ConnectionSettings() {
    const [host, setHost, loadedHost] = useSetting<string>("openrgb_host", "localhost");
    const [portStr, setPort, loadedPort] = useSetting<string>("openrgb_port", "6742");

    if (!loadedHost || !loadedPort) return null;

    return (
        <>
            <TextField
                label="OpenRGB Host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                description="Default is localhost"
            />
            <TextField
                label="OpenRGB Port"
                value={portStr}
                onChange={(e) => setPort(e.target.value)}
                description="Default is 6742"
            />
        </>
    );
}
