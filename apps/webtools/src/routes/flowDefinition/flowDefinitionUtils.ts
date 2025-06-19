import z from "zod";

export const FlowDefinitionProcessorBundleSchema = z.object({
    group: z.string(),
    artifact: z.string(),
    version: z.string(),
});

export const FlowDefinitionPropertyDescriptorsSchema = z.object({
    name: z.string(),
    displayName: z.string(),
    identifiesControllerService: z.boolean(),
    sensitive: z.boolean(),
});

export const FlowDefinitionProcessorSchema = z.object({
    identifier: z.string(),
    name: z.string(),
    type: z.string(),
    bundle: FlowDefinitionProcessorBundleSchema,
    properties: z.record(z.string(), z.string()),
    propertyDescriptors: z.record(z.string(), FlowDefinitionPropertyDescriptorsSchema),
});

export type FlowDefinitionProcessor = z.infer<typeof FlowDefinitionProcessorSchema>;

export const FlowDefinitionConnectionNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
});

export type FlowDefinitionConnectionNode = z.infer<typeof FlowDefinitionConnectionNodeSchema>;

export const FlowDefinitionConnectionSchema = z.object({
    identifier: z.string(),
    source: FlowDefinitionConnectionNodeSchema,
    destination: FlowDefinitionConnectionNodeSchema,
});

export type FlowDefinitionConnection = z.infer<typeof FlowDefinitionProcessorSchema>;

export const FlowDefinitionPortSchema = z.object({
    identifier: z.string(),
    name: z.string(),
    type: z.string(),
});

export type FlowDefinitionPort = z.infer<typeof FlowDefinitionPortSchema>;


export const FlowDefinitionContentsSchema = z.object({
    processors: z.array(FlowDefinitionProcessorSchema),
    controllerServices: z.array(FlowDefinitionProcessorSchema),
    connections: z.array(FlowDefinitionConnectionSchema),
    inputPorts: z.array(FlowDefinitionPortSchema),
    outputPorts: z.array(FlowDefinitionPortSchema),
});

export type FlowDefinitionContents = z.infer<typeof FlowDefinitionContentsSchema>;

export const FlowDefinitionSchema = z.object({
    flowContents: FlowDefinitionContentsSchema,
});

export type FlowDefinition = z.infer<typeof FlowDefinitionSchema>;

type ReducedEdge = {
    source_id: string
    source_type: string
    destination_ids: Set<string>
}

type ProcessorEdge = {
    processor: FlowDefinitionProcessor
    controllerServices: FlowDefinitionProcessor[]
    destinationOutputPorts: FlowDefinitionPort[]
    destinationProcessors: FlowDefinitionProcessor[]
}

function processNodes(flowContents: FlowDefinitionContents, key: "processors" | "controllerServices") {
    const lut = new Map<string, FlowDefinitionProcessor>();
    for(const node of flowContents[key]) {
        lut.set(node.identifier, node);
    }

    return lut;
}

function processPorts(flowContents: FlowDefinitionContents, key: "inputPorts" | "outputPorts") {
    const lut = new Map<string, FlowDefinitionPort>();
    for(const node of flowContents[key]) {
        lut.set(node.identifier, node);
    }

    return lut;
}

function processEdges(flowContents: FlowDefinitionContents, maxCount = 100) {
    const lut = new Map<string, FlowDefinitionConnection>();
    const reducedEdges = new Map<string, Record<string, string>>();
    const edges = flowContents["connections"];
    let needsReduce = false;

    for(const edge of edges) {
        const {
            source, 
            destination,
        } = edge;
        const { 
            id: source_id, 
            type: source_type, 
        } = source;
        const {
            id: destination_id,
            type: destination_type,
        } = destination;

        lut.set(source_id, source);
        lut.set(destination_type, destination);
    }
}