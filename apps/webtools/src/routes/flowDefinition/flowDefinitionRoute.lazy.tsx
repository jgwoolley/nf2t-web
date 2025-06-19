import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";

export const Route = createLazyRoute("/flowDefinition")({
    component: FlowDefinitionComponent,
})

function FlowDefinitionComponent() {
    return (
        <>
            <Nf2tHeader to="/flowDefinition" />
        
        </>
    )
}