export const PROTO_JSON_V8 = {
    nested: {
        OpenApi: {
            nested: {
                ProtoPayloadType: {
                    values: {
                        PROTO_MESSAGE: 5,
                        ERROR_RES: 50,
                        HEARTBEAT_EVENT: 51,
                        PROTO_OA_APPLICATION_AUTH_REQ: 2100,
                        PROTO_OA_APPLICATION_AUTH_RES: 2101,
                        PROTO_OA_ACCOUNT_AUTH_REQ: 2102,
                        PROTO_OA_ACCOUNT_AUTH_RES: 2103,
                        PROTO_OA_RECONCILE_REQ: 2124,
                        PROTO_OA_RECONCILE_RES: 2125,
                        PROTO_OA_DEAL_LIST_REQ: 2133,
                        PROTO_OA_DEAL_LIST_RES: 2134,
                        PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ: 2149,
                        PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES: 2150,
                        PROTO_OA_TRADER_REQ: 2121,
                        PROTO_OA_TRADER_RES: 2122,
                        PROTO_OA_GET_TRENDBARS_REQ: 2137,
                        PROTO_OA_GET_TRENDBARS_RES: 2138,
                    },
                },
                ProtoMessage: {
                    fields: {
                        payloadType: { type: "uint32", id: 1 },
                        payload: { type: "bytes", id: 2 },
                        clientMsgId: { type: "string", id: 3 },
                    },
                },
                ProtoOAApplicationAuthReq: {
                    fields: {
                        clientId: { type: "string", id: 2 },
                        clientSecret: { type: "string", id: 3 },
                    },
                },
                ProtoOAApplicationAuthRes: {
                    fields: {},
                },
                ProtoOAAccountAuthReq: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 2 },
                        accessToken: { type: "string", id: 3 },
                    },
                },
                ProtoOAAccountAuthRes: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 2 },
                    },
                },
                ProtoOAErrorRes: {
                    fields: {
                        errorCode: { type: "string", id: 2 },
                        description: { type: "string", id: 3 },
                        maintenanceEndTimestamp: { type: "int64", id: 4 },
                    },
                },
                ProtoOAGetAccountListByAccessTokenReq: {
                    fields: {
                        accessToken: { type: "string", id: 2 },
                    },
                },
                ProtoOAGetAccountListByAccessTokenRes: {
                    fields: {
                        accessToken: { type: "string", id: 2 },
                        permissionScope: {
                            rule: "repeated",
                            type: "ProtoOAPermissionScope",
                            id: 3,
                        },
                        ctidTraderAccount: {
                            rule: "repeated",
                            type: "ProtoOACtidTraderAccount",
                            id: 4,
                        },
                    },
                },
                ProtoOACtidTraderAccount: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 1 },
                        isLive: { type: "bool", id: 2 },
                        traderLogin: { type: "int64", id: 3 },
                        lastClosingDealTimestamp: { type: "int64", id: 4 },
                        lastBalanceTimestamp: { type: "int64", id: 5 },
                    },
                },
                ProtoOAReconcileReq: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 2 },
                    },
                },
                ProtoOAReconcileRes: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 2 },
                        position: {
                            rule: "repeated",
                            type: "ProtoOAPosition",
                            id: 3,
                        },
                        balance: { type: "int64", id: 4 },
                    },
                },
                ProtoOAPosition: {
                    fields: {
                        positionId: { type: "int64", id: 1 },
                        tradeData: { type: "ProtoOATradeData", id: 2 },
                        positionStatus: {
                            type: "ProtoOAPositionStatus",
                            id: 3,
                        },
                        swap: { type: "int64", id: 4 },
                        price: { type: "double", id: 5 },
                        stopLoss: { type: "double", id: 6 },
                        takeProfit: { type: "double", id: 7 },
                        utcLastUpdateTimestamp: { type: "int64", id: 8 },
                        commission: { type: "int64", id: 9 },
                        marginRate: { type: "double", id: 10 },
                        mirroringCommission: { type: "int64", id: 11 },
                        guaranteedStopLoss: { type: "bool", id: 12 },
                        usedMargin: { type: "uint64", id: 13 },
                        stopLossTriggerMethod: {
                            type: "ProtoOAOrderTriggerMethod",
                            id: 14,
                        },
                        moneyDigits: { type: "uint32", id: 15 },
                    },
                },
                ProtoOATradeData: {
                    fields: {
                        symbolId: { type: "int64", id: 1 },
                        volume: { type: "int64", id: 2 },
                        tradeSide: { type: "ProtoOATradeSide", id: 3 },
                        openTimestamp: { type: "int64", id: 4 },
                        label: { type: "string", id: 5 },
                        guaranteedStopLoss: { type: "bool", id: 6 },
                        comment: { type: "string", id: 7 },
                    },
                },
                ProtoOADealListReq: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 2 },
                        fromTimestamp: { type: "int64", id: 3 },
                        toTimestamp: { type: "int64", id: 4 },
                        maxRows: { type: "int32", id: 5 },
                    },
                },
                ProtoOADealListRes: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 2 },
                        deal: { rule: "repeated", type: "ProtoOADeal", id: 3 },
                        hasMore: { type: "bool", id: 4 },
                    },
                },
                ProtoOADeal: {
                    fields: {
                        dealId: { type: "int64", id: 1 },
                        orderId: { type: "int64", id: 2 },
                        positionId: { type: "int64", id: 3 },
                        volume: { type: "int64", id: 4 },
                        filledVolume: { type: "int64", id: 5 },
                        symbolId: { type: "int64", id: 6 },
                        createTimestamp: { type: "int64", id: 7 },
                        executionTimestamp: { type: "int64", id: 8 },
                        utcLastUpdateTimestamp: { type: "int64", id: 9 },
                        executionPrice: { type: "double", id: 10 },
                        tradeSide: { type: "ProtoOATradeSide", id: 11 },
                        dealStatus: { type: "ProtoOADealStatus", id: 12 },
                        marginRate: { type: "double", id: 13 },
                        commission: { type: "int64", id: 14 },
                        baseToUsdConversionRate: { type: "double", id: 15 },
                        closePositionDetail: {
                            type: "ProtoOAClosePositionDetail",
                            id: 16,
                        },
                        moneyDigits: { type: "uint32", id: 17 },
                    },
                },
                ProtoOAClosePositionDetail: {
                    fields: {
                        entryPrice: { type: "double", id: 1 },
                        grossProfit: { type: "int64", id: 2 },
                        swap: { type: "int64", id: 3 },
                        commission: { type: "int64", id: 4 },
                        balance: { type: "int64", id: 5 },
                        quoteToDepositConversionRate: { type: "double", id: 6 },
                        closedVolume: { type: "int64", id: 7 },
                        balanceVersion: { type: "int64", id: 8 },
                        moneyDigits: { type: "uint32", id: 9 },
                        pnl: { type: "int64", id: 10 },
                    },
                },
                ProtoOATraderReq: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 1 },
                        accessToken: { type: "string", id: 2 },
                    },
                },
                ProtoOATraderRes: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 1 },
                        trader: { type: "ProtoOATrader", id: 2 },
                    },
                },
                ProtoOATrader: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 1 },
                        balance: { type: "int64", id: 2 },
                        balanceVersion: { type: "int64", id: 3 },
                        managerBonus: { type: "int64", id: 4 },
                        ibBonus: { type: "int64", id: 5 },
                        nonWithdrawableBonus: { type: "int64", id: 6 },
                        accessRights: { type: "uint32", id: 7 },
                        depositAssetId: { type: "int64", id: 8 },
                        swapFree: { type: "bool", id: 9 },
                        leverageInCents: { type: "uint32", id: 10 },
                        totalMarginCalculationType: { type: "uint32", id: 11 },
                        maxLeverage: { type: "uint32", id: 12 },
                        frenchRisk: { type: "bool", id: 13 },
                        traderLogin: { type: "int64", id: 14 },
                        accountType: { type: "uint32", id: 15 },
                        brokerName: { type: "string", id: 16 },
                        registrationTimestamp: { type: "int64", id: 17 },
                        isLimitedRisk: { type: "bool", id: 18 },
                        moneyDigits: { type: "uint32", id: 19 },
                    },
                },
                ProtoOAGetTrendbarsReq: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 1 },
                        fromTimestamp: { type: "int64", id: 2 },
                        toTimestamp: { type: "int64", id: 3 },
                        period: { type: "uint32", id: 4 },
                        symbolId: { type: "int64", id: 5 },
                        count: { type: "uint32", id: 6 },
                    },
                },
                ProtoOAGetTrendbarsRes: {
                    fields: {
                        ctidTraderAccountId: { type: "int64", id: 1 },
                        period: { type: "uint32", id: 2 },
                        timestamp: { type: "int64", id: 3 },
                        trendbar: {
                            rule: "repeated",
                            type: "ProtoOATrendbar",
                            id: 4,
                        },
                        symbolId: { type: "int64", id: 5 },
                    },
                },
                ProtoOATrendbar: {
                    fields: {
                        volume: { type: "int64", id: 1 },
                        period: { type: "uint32", id: 2 },
                        low: { type: "int64", id: 3 },
                        deltaOpen: { type: "uint64", id: 4 },
                        deltaClose: { type: "uint64", id: 5 },
                        deltaHigh: { type: "uint64", id: 6 },
                        utcTimestampInMinutes: { type: "uint32", id: 7 },
                    },
                },
                ProtoOATrendbarPeriod: {
                    values: {
                        M1: 1,
                        M2: 2,
                        M3: 3,
                        M4: 4,
                        M5: 5,
                        M10: 6,
                        M15: 7,
                        M30: 8,
                        H1: 9,
                        H4: 10,
                        H12: 11,
                        D1: 12,
                        W1: 13,
                        MN1: 14,
                    },
                },
                ProtoOATradeSide: {
                    values: {
                        BUY: 1,
                        SELL: 2,
                    },
                },
                ProtoOAPositionStatus: {
                    values: {
                        POSITION_STATUS_OPEN: 1,
                        POSITION_STATUS_CLOSED: 2,
                        POSITION_STATUS_CREATED: 3,
                        POSITION_STATUS_ERROR: 4,
                    },
                },
                ProtoOADealStatus: {
                    values: {
                        FILLED: 2,
                        PARTIALLY_FILLED: 3,
                        REJECTED: 4,
                        MISSED: 5,
                    },
                },
                ProtoOAPermissionScope: {
                    values: {
                        VIEW: 1,
                        TRADE: 2,
                    },
                },
                ProtoOAOrderTriggerMethod: {
                    values: {
                        TRADE: 1,
                        OPPOSITE: 2,
                        DOUBLE_TRADE: 3,
                        DOUBLE_OPPOSITE: 4,
                    },
                },
            },
        },
    },
};
