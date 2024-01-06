import { useMemo } from "react";

export function Source() {
    const buildinfo = useMemo(async () =>{
        const response = await fetch("./buildinfo.json");
        const data = await response.json();
        console.log(data);
        return data;
    }, []);

    return (
        <>
            <h4>Source Information</h4>
            <p>The source code of this project is stored at <a href="https://github.com/jgwoolley/Nifi-Flow-File-Helper">https://github.com/jgwoolley/Nifi-Flow-File-Helper</a>.</p>
            {JSON.stringify(buildinfo)}            
        </>
    )
}

export default Source;