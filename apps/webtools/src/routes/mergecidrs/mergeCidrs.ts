
type IpRange = {
    originals: string[],
    min: number,
    max: number,
}

export function deduplicateCIDRs(cidrs: string[]) {
    const ranges: IpRange[] = [];

    // Convert CIDRs to an array of ranges
    for(let cidr of cidrs) {
        let [ip, prefix] = cidr.split('/');
        if(prefix == undefined) continue;
        let base = ipToNumber(ip);
        if(base == 0) continue;
        let size = Math.pow(2, 32 - Number(prefix));
        ranges.push({
            originals: [cidr],
            min: base, 
            max: base + size - 1,
        });
    }

    // Sort ranges by the starting IP
    ranges.sort((a, b) => a.min - b.min);

    // Merge overlapping and adjacent ranges
    let mergedRanges = [];
    let currentRange = ranges[0];

    for (let i = 1; i < ranges.length; i++) {
        let nextRange = ranges[i];
        if (currentRange.max >= nextRange.min - 1) {
            // Merge the ranges
            currentRange.max = Math.min(currentRange.max, nextRange.max);
            currentRange.originals.push(...nextRange.originals);
        } else {
            mergedRanges.push(currentRange);
            currentRange = nextRange;
        }
    }
    mergedRanges.push(currentRange);

    // Convert merged ranges back to CIDRs
    let deduplicatedCIDRs = mergedRanges.map(range => {
        let start = range.min;
        let end = range.max;
        let cidrs = [];
        while (start <= end) {
            let size = largestCIDR(start, end);
            let prefix = 32 - Math.log2(size);
            cidrs.push(numberToIP(start) + '/' + prefix);
            start += size;
        }
        return cidrs;
    });

    return deduplicatedCIDRs.flat();
}

function ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function numberToIP(number: number): string {
    return [
        (number >>> 24) & 0xff,
        (number >>> 16) & 0xff,
        (number >>> 8) & 0xff,
        number & 0xff
    ].join('.');
}

function largestCIDR(start: number, end: number) {
    let size = 1;
    while (start % size === 0 && start + size - 1 <= end) {
        size *= 2;
    }
    return size / 2;
}

// // Test the function
// console.log(deduplicateCIDRs([
//     "10.0.0.0/24", "10.0.0.0/8", "198.0.0.0/24", "198.0.1.0/24",
// ])); // Output: [ '10.0.0.0/8', '198.0.0.0/23' ]

// console.log(deduplicateCIDRs([
//     '1.1.0.0/24',
//     '1.1.0.0/16',

//     '10.0.255.0/24',

//     '10.0.0.0/24',
//     '10.0.1.0/24',
//     '10.0.2.0/24',
//     '10.0.3.0/24',

//     '10.1.1.0/31',
//     '10.1.1.2/31',

//     '10.1.2.2/31',
//     '10.1.2.4/31',

//     '127.0.0.1/32',
//     '127.0.0.2/32',
//     '127.0.0.3/32',
//     '127.0.0.4/32',
// ]));

// console.log([
//     '1.1.0.0/24',
//     '10.0.0.0/22',
//     '10.0.255.0/24',
//     '10.1.1.0/30',
//     '10.1.2.2/31',
//     '10.1.2.4/31',
//     '127.0.0.1/32',
//     '127.0.0.2/31',
//     '127.0.0.4/32',
// ])