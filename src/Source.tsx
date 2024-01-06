import { useEffect, useState } from "react";

export function Source() {
    const [buildinfo, setBuildinfo] = useState<any>();

    useEffect(() =>{
        fetch("./buildinfo.json")
            .then( x => {
                if(x.ok) {
                    return x;
                }

                throw new Error("Did not recieve OK response")
            })
            .then( x => x.json())
            .then( x => setBuildinfo(x))
            .catch( e => console.error(e));
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