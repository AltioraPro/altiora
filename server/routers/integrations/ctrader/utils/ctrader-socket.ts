import { Root } from "protobufjs";
import WebSocket from "ws";
import { PROTO_JSON_V8 } from "./proto-definitions";

export class CTraderSocket {
    private socket: WebSocket | null = null;
    private readonly root: Root;
    private readonly host: string;
    private readonly resolvers = new Map<
        string,
        { resolve: (value: any) => void; reject: (reason?: any) => void }
    >();
    private isConnected = false;
    private readonly port = 5035;

    constructor(isLive = true) {
        this.root = Root.fromJSON(PROTO_JSON_V8);
        this.host = isLive ? "live.ctraderapi.com" : "demo.ctraderapi.com";

        // Debug loaded types
        try {
            const json = this.root.toJSON();
            // @ts-expect-error
            const _types = Object.keys(json.nested?.OpenApi?.nested || {});
        } catch (e) {
            console.error("[CTraderSocket] Error inspecting types", e);
        }
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (
                this.isConnected &&
                this.socket?.readyState === WebSocket.OPEN
            ) {
                resolve();
                return;
            }

            this.socket = new WebSocket(`wss://${this.host}:${this.port}`);

            this.socket.on("open", () => {
                this.isConnected = true;
                resolve();
            });

            this.socket.on("error", (err) => {
                console.error("[CTraderSocket] WebSocket Error:", err);
                reject(err);
            });

            this.socket.on("close", (code, reason) => {
                this.isConnected = false;
                // Reject all pending promises
                for (const [_, { reject }] of this.resolvers) {
                    reject(new Error(`Socket closed: ${code} ${reason}`));
                }
                this.resolvers.clear();
            });

            this.socket.on("message", (data) => {
                this.handleMessage(data as Buffer);
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    private handleMessage(data: Buffer) {
        try {
            const ProtoMessage = this.root.lookupType("OpenApi.ProtoMessage");
            const message = ProtoMessage.decode(data) as any;

            // Handle Heartbeat
            if (message.payloadType === 51) {
                // HEARTBEAT_EVENT
                // Usually we don't need to respond if it's an event, but if it's a request we might?
                // cTrader doc says: "If no message is sent for 30 seconds, server sends HeartbeatEvent. Client doesn't need to respond."
                // But we should send heartbeats to keep connection alive if we are idle.
                return;
            }

            // Handle Error
            if (message.payloadType === 50) {
                const clientMsgId = message.clientMsgId;

                try {
                    const ProtoOAErrorRes = this.root.lookupType(
                        "OpenApi.ProtoOAErrorRes"
                    );
                    const errorPayload = ProtoOAErrorRes.decode(
                        message.payload
                    ) as any;
                    console.error(
                        `[CTraderSocket] Received Error Res for ${clientMsgId}: ${errorPayload.errorCode} - ${errorPayload.description}`
                    );

                    if (clientMsgId && this.resolvers.has(clientMsgId)) {
                        this.resolvers
                            .get(clientMsgId)
                            ?.reject(
                                new Error(
                                    `cTrader API Error: ${errorPayload.errorCode} - ${errorPayload.description}`
                                )
                            );
                        this.resolvers.delete(clientMsgId);
                    }
                } catch (err) {
                    console.error(
                        "[CTraderSocket] Failed to decode error response",
                        err
                    );
                    if (clientMsgId && this.resolvers.has(clientMsgId)) {
                        this.resolvers
                            .get(clientMsgId)
                            ?.reject(new Error("cTrader API Error (Unknown)"));
                        this.resolvers.delete(clientMsgId);
                    }
                }
                return;
            }

            if (
                message.clientMsgId &&
                this.resolvers.has(message.clientMsgId)
            ) {
                const resolver = this.resolvers.get(message.clientMsgId);
                if (resolver) {
                    const { resolve } = resolver;
                    this.resolvers.delete(message.clientMsgId);

                    // Decode specific payload based on payloadType
                    const decodedPayload = this.decodePayload(
                        message.payloadType,
                        message.payload
                    );
                    resolve(decodedPayload);
                }
            }
        } catch (error) {
            console.error("[CTraderSocket] Error handling message:", error);
        }
    }

    private decodePayload(payloadType: number, payload: Uint8Array) {
        const mapping: Record<number, string> = {
            2101: "OpenApi.ProtoOAApplicationAuthRes",
            2103: "OpenApi.ProtoOAAccountAuthRes",
            2125: "OpenApi.ProtoOAReconcileRes",
            2134: "OpenApi.ProtoOADealListRes",
            2150: "OpenApi.ProtoOAGetAccountListByAccessTokenRes",
            2138: "OpenApi.ProtoOAGetTrendbarsRes",
            2122: "OpenApi.ProtoOATraderRes",
        };

        const typeName = mapping[payloadType];
        if (!typeName) {
            return payload; // Return raw if unknown
        }

        const Type = this.root.lookupType(typeName);
        return Type.decode(payload);
    }

    async request<T>(
        payloadType: number,
        payload: any,
        responseTypeStr: string
    ): Promise<T> {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error("Socket not connected");
        }

        const ProtoMessage = this.root.lookupType("OpenApi.ProtoMessage");
        // Hacky but works for naming convention, EXCEPT for Trendbars which maps 2137 -> 2138 (Req->Res)
        // We pass the RESPONSE type string, so we derive Request type?
        // No, usually we pass "OpenApi.ProtoXXXRes" and derive "OpenApi.ProtoXXXReq".
        // But for Trendbars, the names should match "ProtoOAGetTrendbarsReq".

        let requestTypeName = responseTypeStr.replace("Res", "Req");

        const reqMapping: Record<number, string> = {
            2100: "OpenApi.ProtoOAApplicationAuthReq",
            2102: "OpenApi.ProtoOAAccountAuthReq",
            2124: "OpenApi.ProtoOAReconcileReq",
            2133: "OpenApi.ProtoOADealListReq",
            2149: "OpenApi.ProtoOAGetAccountListByAccessTokenReq",
            2137: "OpenApi.ProtoOAGetTrendbarsReq",
            2121: "OpenApi.ProtoOATraderReq",
        };

        if (reqMapping[payloadType]) {
            requestTypeName = reqMapping[payloadType];
        }

        const ReqType = this.root.lookupType(requestTypeName);
        const err = ReqType.verify(payload);
        if (err) {
            throw new Error(err);
        }

        const payloadBuffer = ReqType.encode(ReqType.create(payload)).finish();
        const clientMsgId = Math.random().toString(36).substring(7);

        const wrapper = ProtoMessage.create({
            payloadType,
            payload: payloadBuffer,
            clientMsgId,
        });

        const buffer = ProtoMessage.encode(wrapper).finish();

        return new Promise((resolve, reject) => {
            this.resolvers.set(clientMsgId, { resolve, reject });
            this.socket?.send(buffer);

            // Timeout
            setTimeout(() => {
                if (this.resolvers.has(clientMsgId)) {
                    this.resolvers
                        .get(clientMsgId)
                        ?.reject(
                            new Error("Timeout waiting for cTrader response")
                        );
                    this.resolvers.delete(clientMsgId);
                }
            }, 30_000); // 30s timeout
        });
    }
}
