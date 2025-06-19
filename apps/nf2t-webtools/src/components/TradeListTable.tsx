'use client';

import { TradeListElement, TradeListElementList, TraderList, VsServer } from "@/utils/schema";
import { useMemo, useState } from "react";

export type TradeListTableProps = {
    lang: string,
    vsServer: VsServer,
}

type Trade = {
    traderType: string,
    traderName: string,
    traderCode: string,
    type: string,
    code: string,
    name: string,
    min: number,
    max: number,
}

function determineTraderName({ langLut, trader }: {vsServer: VsServer, langLut?: Record<string, string>, trader: TraderList}): string {
     if(langLut == undefined) {
        return trader.traderCode;
    }
    
    let traderLuv: string | null = null;
    if (trader.traderType === "villager") {
        traderLuv = `nametag-${trader.traderCode}`;
    } else if (trader.traderType === "trader") {
        let traderCode = trader.traderCode;
        if (trader.traderCode === "agriculture") {
            traderCode = "foods";
        }
        traderLuv = `item-creature-humanoid-trader-${traderCode}`;
    }

    if(traderLuv == undefined) {
        return trader.traderCode;
    }

    return langLut[traderLuv] || trader.traderCode;
}

function determineItemName({ langLut, trade }: {vsServer: VsServer, langLut?: Record<string, string>, trade: TradeListElement}): string {
    if(langLut == undefined) {
        return trade.code;
    }
    
    const itemLuv = `${trade.type}-${trade.code}`;
    return langLut[itemLuv] || trade.code;
}

export default function TradeListTable({ lang, vsServer }: TradeListTableProps) {
    const { tradelists } = vsServer.assets.survival.config;
    const langLut = vsServer.assets.game.lang.lut.get(lang);

    const [itemNameFilter, setItemNameFilter] = useState<string>("");

    const [trades, itemNames] = useMemo(() => {
        const trades: Trade[] = [];
        const itemNames = new Set<string>();

        tradelists.forEach(trader => {
            function processList(e: TradeListElementList, tradeType: string) {
                e.list.forEach(trade => {
                    const traderName = determineTraderName({
                        vsServer,
                        langLut, 
                        trader,
                    });

                    const itemName = determineItemName({
                        vsServer, 
                        langLut, 
                        trade,
                    });
                    itemNames.add(itemName);
                    trades.push({
                        traderName: traderName,
                        traderType: trader.traderType,
                        traderCode: trader.traderCode,
                        name: itemName,
                        type: tradeType,
                        min: trade.price.avg - trade.price.var,
                        max: trade.price.avg + trade.price.var,
                        code: trade.code,
                    });
                });
            }

            processList(trader.buying, "buying");
            processList(trader.selling, "selling");
        })
        trades.sort((a, b) => a.code.localeCompare(b.code));

        return [trades.filter( x => itemNameFilter.length == 0 ? true : x.name.toLowerCase().startsWith(itemNameFilter.toLowerCase())), Array.from(itemNames)];
    }, [vsServer, langLut, tradelists, itemNameFilter]);

    if (langLut == undefined) {
        return <p>Given Language Code doesn&lsquo;t exist {lang}.</p>
    }

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Trader Type</th>
                        <th>Trader Name</th>
                        <th>Buying / Selling</th>
                        <th>min</th>
                        <th>max</th>
                    </tr>
                    <tr>
                        <th>
                            <input list="browsers" name="browser" value={itemNameFilter} onChange={x => setItemNameFilter(x.target.value)}/>
                            <datalist id="browsers">
                                {itemNames.map((x, index) => (
                                    <option key={index} value={x}>{x}</option>)
                                )}
                            </datalist>
                        </th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map((trade, index) => (
                        <tr key={index}>
                            <td>{trade.name}</td>
                            <td>{trade.traderType}</td>
                            <td>{trade.traderName}</td>
                            <td>{trade.type}</td>
                            <td>{trade.min}</td>
                            <td>{trade.max}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>

    )
}