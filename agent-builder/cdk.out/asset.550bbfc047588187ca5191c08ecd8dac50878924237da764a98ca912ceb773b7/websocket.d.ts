import { APIGatewayProxyResult, APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
export declare const onConnect: (event: APIGatewayProxyWebsocketEventV2) => Promise<APIGatewayProxyResult>;
export declare const onDisconnect: (event: APIGatewayProxyWebsocketEventV2) => Promise<APIGatewayProxyResult>;
export declare const onMessage: (event: APIGatewayProxyWebsocketEventV2) => Promise<APIGatewayProxyResult>;
export declare const getConnections: (projectId: string) => Promise<string[]>;
//# sourceMappingURL=websocket.d.ts.map