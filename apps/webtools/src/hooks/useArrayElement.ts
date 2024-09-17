import { useCallback } from "react";

export type UseArrayElementsParams<T> = {
    values: T[],
    setValues: React.Dispatch<React.SetStateAction<T[]>>,
    index?: number,
}

export type UseArrayElementsResult<T> = {
    value: T | null,
    setValue: (newValue: T) => void,
}

export function useArrayElements<T>({index, values, setValues}: UseArrayElementsParams<T>): UseArrayElementsResult<T> {    
    const value = index == undefined ? values[0] : values[index];

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