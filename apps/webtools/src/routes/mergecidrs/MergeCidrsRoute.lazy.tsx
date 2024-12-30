import Nf2tHeader from "../../components/Nf2tHeader";
import { createLazyRoute } from "@tanstack/react-router";
import { TextareaAutosize } from '@mui/material';
import { useMemo, useState } from "react";

export const Route = createLazyRoute("/mergecidrs")({
    component: Nf2tHome,
})

function convertIpv4MaskIntToBinary(value: number) {
    return '1'.repeat(value) + '0'.repeat(32 - value);
}

function convertIpv4StringToBinary(value: string) {
    const octets = value.split(".").map(octet => parseInt(octet, 10).toString(2).padStart(8, '0'));
    if(octets.length != 4) {
        return null;
    }
    return octets.join("");
}

function parseCidrRaw(cidrSet: Set<string>, row: string) {
    try {
        const [ipRaw, maskRaw] = row.split("\/");
        if(maskRaw == undefined) {
            return;
        }

        const maskInt = parseInt(maskRaw, 10);
        if(maskInt == undefined) {
            return null;
        }

        const maskBinary = convertIpv4MaskIntToBinary(maskInt);
        if(maskBinary == undefined) {
            return;
        }
    
        const ipBinary = convertIpv4StringToBinary(ipRaw);
        if(ipBinary == undefined) {
            return;
        }
    
        const cidrBinary = ipBinary + maskBinary;
        cidrSet.add(cidrBinary);
    } catch(e) {

    }
}

function parseCidrsRaw(value: string) {
    const cidrSet = new Set<string>();
    value.split("\n").forEach(x => parseCidrRaw(cidrSet, x));
    return [...cidrSet].sort();
}

function convertIpv4MaskBinaryToMaskInt(value: string) {
    let result = 0;

    for(let c of value) {
        if(c !== "1") {
            break;
        }
        result+=1;
    }

    return result;
}

// function applyMask(value: string, mask:string) {
//     let result = "";
//     for(let i = 0; mask.length; i++) {
//         if(mask[i] === "1") {
//             result+=value[i];
//         } else {
//             result+="0";
//         }
//     }

//     return result;
// }

function convertIpv4BinaryToString(value: string) {
    const octets = [
        parseInt(value.substring(0, 8), 2),
        parseInt(value.substring(8, 16), 2),
        parseInt(value.substring(16, 24), 2),
        parseInt(value.substring(24, 32), 2),
    ];

    return octets.join(".");
}

function convertCidrBinaryToCidrString(value: string) {
    const maskInt = convertIpv4MaskBinaryToMaskInt(value.substring(32, 64));
    const ipString = convertIpv4BinaryToString(value.substring(0, 32));

    return ipString + "/" + maskInt;
}

type IpRange = { min: number, max: number };

function convertIpv4CidrToIpRange(value: string) {
    const mask = convertIpv4MaskBinaryToMaskInt(value.substring(32, 64));
    const min = parseInt(value.substring(0, 32), 2);
    const max = min + Math.pow(2, 32 - mask) - 1;

    return {
        min, max, mask,
    };
}

function convertIpv4RangeToCidr(value: IpRange) {
    const min = value.min.toString(2).padStart(32, "0");
    const max = value.max.toString(2).padStart(32, "0");
    console.log(value, min, max);
    let mask = 0;
    while(mask < 32 && min[mask] === max[mask]) {
        mask++;
    }
    return convertIpv4BinaryToString(min) + "/" + mask;
}

function test(inputArea: string) {
    const sortedCidrs = parseCidrsRaw(inputArea);
    console.log(sortedCidrs);
    const ipRanges = sortedCidrs.map(convertIpv4CidrToIpRange);
    const results: IpRange[] = [];
    let prev: IpRange = ipRanges[0];
    for(let i = 1; i < sortedCidrs.length; i++) {
        const curr = ipRanges[i];
        if(((prev.min <= curr.max) || Math.abs(curr.max - prev.min) === 1) && ((curr.min <= prev.max) || Math.abs(prev.max - curr.min) === 1)) {
            const min = Math.min(curr.min, prev.min);
            const max = Math.min(curr.max, prev.max);
            prev = {
                min, max,
            }
        } else {
            results.push(prev);
            prev = curr;
        }

        if(prev != undefined) {
            results.push(prev);
        }
    }

    console.log(results);

    return results.map(convertIpv4RangeToCidr);
}

export default function Nf2tHome() {
    const [inputArea, setInputArea] = useState<string>("1.1.0.0/24\n1.1.0.0/16\n");
    const cidrs = useMemo(() => {
        return test(inputArea);
    }, [inputArea]);

    return (
        <>
            <Nf2tHeader to="/mergecidrs" />
            <TextareaAutosize onChange={(e) => {
                setInputArea(e.target.value);
            }}/>
            <ul>
                {cidrs.map((x, index) => <li key={index}>{convertCidrBinaryToCidrString(x)}</li>)}
            </ul>
        </>
    )
}