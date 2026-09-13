import { useState, useEffect } from "react";
import { callable } from "@decky/api";

const getSetting = callable<[key: string, defaultValue: any], any>("get_setting");
const setSetting = callable<[key: string, value: any], boolean>("set_setting");

export function useSetting<T>(key: string, defaultValue: T): [T, (val: T) => void, boolean] {
    const [value, setValue] = useState<T>(defaultValue);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getSetting(key, defaultValue).then(res => {
            if (res !== undefined) {
                setValue(res as T);
            }
            setLoaded(true);
        }).catch(e => {
            console.error(`Failed to load setting ${key}`, e);
            setLoaded(true);
        });
    }, [key, defaultValue]);

    const saveValue = (newValue: T) => {
        setValue(newValue);
        setSetting(key, newValue).catch(e => {
            console.error(`Failed to save setting ${key}`, e);
        });
    };

    return [value, saveValue, loaded];
}
