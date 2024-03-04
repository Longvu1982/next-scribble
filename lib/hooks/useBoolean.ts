import { useState } from "react";

const useBoolean = (initValue = false): [boolean, () => void, () => void, () => void] => {
    const [value, setValue] = useState<boolean>(initValue);
    const setTrue = () => {
        setValue(true);
    };
    const setFalse = () => {
        setValue(false);
    };
    const toggle = () => {
        setValue((prev) => !prev);
    };
    return [value, setTrue, setFalse, toggle];
};

export { useBoolean };
