import { useState, useEffect } from "react";
import { ToggleField, ButtonItem } from "@decky/ui";
import { callable } from "@decky/api";
import { useSetting } from "../hooks/useSetting";

const getDevices = callable<[], any[]>("get_devices");

export function DeviceList() {
    const [devices, setDevices] = useState<any[]>([]);
    const [enabledDevices, setEnabledDevices, loadedEnabled] = useSetting<string[]>("enabled_devices", []);
    const [deviceSettings, setDeviceSettings, loadedSettings] = useSetting<Record<string, any>>("device_settings", {});
    const [expanded, setExpanded] = useState<string | null>(null);
    
    const fetchDevices = () => {
        getDevices().then(res => {
            if (res) setDevices(res);
        }).catch(e => console.error(e));
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    if (!loadedEnabled || !loadedSettings) return null;

    const toggleDevice = (deviceName: string, enabled: boolean) => {
        if (enabled) {
            setEnabledDevices([...enabledDevices, deviceName]);
        } else {
            setEnabledDevices(enabledDevices.filter(name => name !== deviceName));
        }
    };

    return (
        <>
            {devices.map((device, index) => (
                <div key={index} style={{ marginBottom: "8px" }}>
                    <ToggleField
                        label={device.name}
                        checked={enabledDevices.includes(device.name)}
                        onChange={(val) => toggleDevice(device.name, val)}
                    />
                    {enabledDevices.includes(device.name) && (
                        <ButtonItem 
                            layout="below" 
                            onClick={() => setExpanded(expanded === device.name ? null : device.name)}
                        >
                            {expanded === device.name ? "Hide Settings" : "Device Settings ⚙️"}
                        </ButtonItem>
                    )}
                    {expanded === device.name && (
                        <div style={{ marginLeft: "20px", marginTop: "8px", borderLeft: "2px solid #444", paddingLeft: "15px" }}>
                            <ToggleField 
                                label="Reverse LEDs" 
                                description="Flips the animation direction"
                                checked={deviceSettings[device.name]?.reverse || false}
                                onChange={(val) => setDeviceSettings({...deviceSettings, [device.name]: {...(deviceSettings[device.name] || {}), reverse: val}})}
                            />
                        </div>
                    )}
                </div>
            ))}
            {devices.length === 0 && (
                <div style={{ padding: "10px", color: "#888" }}>No devices found.</div>
            )}
            <ButtonItem
                layout="below"
                onClick={fetchDevices}
            >
                Refresh Devices
            </ButtonItem>
        </>
    );
}
