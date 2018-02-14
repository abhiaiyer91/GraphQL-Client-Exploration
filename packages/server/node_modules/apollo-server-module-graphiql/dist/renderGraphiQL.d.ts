export declare type GraphiQLData = {
    endpointURL: string;
    subscriptionsEndpoint?: string;
    query?: string;
    variables?: Object;
    operationName?: string;
    result?: Object;
    passHeader?: string;
    editorTheme?: string;
    websocketConnectionParams?: Object;
};
export declare function renderGraphiQL(data: GraphiQLData): string;
