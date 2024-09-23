import { useCallback } from "react";

export type UseArrayElementsParams<T> = {
    values: T[],
    defaultValue: T,
    setValues: React.Dispatch<React.SetStateAction<T[]>>,
    index?: number,
}

export type UseArrayElementsResult<T> = {
    value: T,
    setValue: (newValue: T) => void,
}

export function useArrayElements<T>({index, values, setValues, defaultValue}: UseArrayElementsParams<T>): UseArrayElementsResult<T> {    
    const value = (index == undefined ? values[0] : values[index]) || defaultValue;

    const setValue = useCallback((newValue: T) => {
        if(index == undefined) {
            return;
        }

        values[index] = newValue;

        setValues(values);

    }, [index, values, setValues]);

    return {
        value, 
        setValue,
    }
}

export default useArrayElements;