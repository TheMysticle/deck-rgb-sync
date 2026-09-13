import { useState, useEffect } from "react";
import { DropdownItem, ButtonItem } from "@decky/ui";
import { callable } from "@decky/api";
import { useSetting } from "../hooks/useSetting";

const getDevices = callable<[], any[]>("get_devices");

export function ZonePicker() {
    const [devices, setDevices] = useState<any[]>([]);
    const [activeDeviceId, setActiveDeviceId, deviceLoaded] = useSetting<number>("active_device_id", -1);
    const [activeZoneId, setActiveZoneId, zoneLoaded] = useSetting<number>("active_zone_id", -1);
    
    const fetchDevices = () => {
        getDevices().then(res => {
            if (res) setDevices(res);
        }).catch(e => console.error(e));
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    if (!deviceLoaded || !zoneLoaded) return null;

    const deviceOptions = devices.map((d, index) => ({
        data: index,
        label: d.name
    }));

    deviceOptions.unshift({ data: -1, label: "None selected" });

    const activeDevice = devices[activeDeviceId];
    const zoneOptions = activeDevice && activeDevice.zones ? activeDevice.zones.map((z: any, index: number) => ({
        data: index,
        label: `${z.name} (${z.led_count} LEDs)`
    })) : [];

    zoneOptions.unshift({ data: -1, label: "None selected" });

    return (
        <>
            <DropdownItem
                label="Device"
                menuLabel="Select Device"
                rgOptions={deviceOptions}
                selectedOption={activeDeviceId}
                onChange={(opt) => {
                    setActiveDeviceId(opt.data);
                    setActiveZoneId(-1); // reset zone when device changes
                }}
            />
            {activeDeviceId !== -1 && (
                <DropdownItem
                    label="Zone"
                    menuLabel="Select Zone"
                    rgOptions={zoneOptions}
                    selectedOption={activeZoneId}
                    onChange={(opt) => setActiveZoneId(opt.data)}
                />
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
