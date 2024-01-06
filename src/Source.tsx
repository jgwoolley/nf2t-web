import { useEffect, useState } from "react";

interface BuildInfo {
    git: {
        at: string,
    },
}

export function Source() {
    const [buildinfo, setBuildinfo] = useState<BuildInfo>();
    const [authorDate, setAuthorDate] = useState<Date>();

    useEffect(() =>{
        fetch("./buildinfo.json")
            .then( x => {
                if(x.ok) {
                    return x;
                }

                throw new Error("Did not recieve OK response")
            })
            .then( x => x.json())
            .then( x => x as BuildInfo)
            .then( x => setBuildinfo(x))
            .catch( e => console.error(e));
    }, []);

    useEffect(() =>{
        if(buildinfo == undefined) {
            return;
        }

        setAuthorDate(new Date(parseInt(buildinfo.git.at) * 1000));
    }, [buildinfo]);

    return (
        <>
            <h4>Source Information</h4>
            <p>The source code of this project is stored at <a href="https://github.com/jgwoolley/Nifi-Flow-File-Helper">https://github.com/jgwoolley/Nifi-Flow-File-Helper</a>.</p>
            {authorDate}            
        </>
    )
}

export default Source;