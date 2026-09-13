import { useState, useEffect } from "react";
import { ToggleField, ButtonItem } from "@decky/ui";
import { callable } from "@decky/api";
import { useSetting } from "../hooks/useSetting";

const getDevices = callable<[], any[]>("get_devices");

export function DeviceList() {
    const [devices, setDevices] = useState<any[]>([]);
    const [enabledDevices, setEnabledDevices, loaded] = useSetting<string[]>("enabled_devices", []);
    
    const fetchDevices = () => {
        getDevices().then(res => {
            if (res) setDevices(res);
        }).catch(e => console.error(e));
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    if (!loaded) return null;

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
                <ToggleField
                    key={index}
                    label={device.name}
                    checked={enabledDevices.includes(device.name)}
                    onChange={(val) => toggleDevice(device.name, val)}
                />
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
