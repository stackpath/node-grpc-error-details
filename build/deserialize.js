"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeGoogleGrpcStatusDetails = exports.deserializeGrpcStatusDetails = exports.googleDeserializeMap = void 0;
const status_pb_1 = require("./generated/status_pb");
const error_details_pb_1 = require("./generated/error_details_pb");
exports.googleDeserializeMap = {
    "google.rpc.RetryInfo": error_details_pb_1.RetryInfo.deserializeBinary,
    "google.rpc.DebugInfo": error_details_pb_1.DebugInfo.deserializeBinary,
    "google.rpc.QuotaFailure": error_details_pb_1.QuotaFailure.deserializeBinary,
    "google.rpc.PreconditionFailure": error_details_pb_1.PreconditionFailure.deserializeBinary,
    "google.rpc.BadRequest": error_details_pb_1.BadRequest.deserializeBinary,
    "google.rpc.RequestInfo": error_details_pb_1.RequestInfo.deserializeBinary,
    "google.rpc.ResourceInfo": error_details_pb_1.ResourceInfo.deserializeBinary,
    "google.rpc.Help": error_details_pb_1.Help.deserializeBinary,
    "google.rpc.LocalizedMessage": error_details_pb_1.LocalizedMessage.deserializeBinary,
    "google.rpc.ErrorInfo": error_details_pb_1.ErrorInfo.deserializeBinary
};
function deserializeGrpcStatusDetails(error, deserializeMap) {
    if (!error.metadata) {
        return null;
    }
    const buffer = error.metadata.get("grpc-status-details-bin")[0];
    if (!buffer || typeof buffer === "string") {
        return null;
    }
    let status;
    status = status_pb_1.Status.deserializeBinary(buffer);
    const details = status
        .getDetailsList()
        .map(detail => {
        const deserialize = deserializeMap[detail.getTypeName()];
        if (deserialize) {
            const message = detail.unpack(deserialize, detail.getTypeName());
            return message;
        }
        return null;
    })
        .filter(notEmpty);
    return {
        status,
        details
    };
}
exports.deserializeGrpcStatusDetails = deserializeGrpcStatusDetails;
function deserializeGoogleGrpcStatusDetails(error) {
    return deserializeGrpcStatusDetails(error, exports.googleDeserializeMap);
}
exports.deserializeGoogleGrpcStatusDetails = deserializeGoogleGrpcStatusDetails;
const notEmpty = (value) => {
    return value !== null && value !== undefined;
};
