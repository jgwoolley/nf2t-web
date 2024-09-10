
export type SpacingProps = {
    height?: React.CSSProperties["height"],
}

export function Spacing({ height }: SpacingProps){
    return <div style={{height: height || "20px"}}/>
}

export default Spacing;