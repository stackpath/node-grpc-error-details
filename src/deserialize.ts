import { Metadata } from "grpc";
import { Status } from "./generated/status_pb";
import {
  RetryInfo,
  DebugInfo,
  QuotaFailure,
  PreconditionFailure,
  BadRequest,
  RequestInfo,
  ResourceInfo,
  Help,
  LocalizedMessage,
  ErrorInfo
} from "./generated/error_details_pb";

export const googleDeserializeMap = {
  "google.rpc.RetryInfo": RetryInfo.deserializeBinary,
  "google.rpc.DebugInfo": DebugInfo.deserializeBinary,
  "google.rpc.QuotaFailure": QuotaFailure.deserializeBinary,
  "google.rpc.PreconditionFailure": PreconditionFailure.deserializeBinary,
  "google.rpc.BadRequest": BadRequest.deserializeBinary,
  "google.rpc.RequestInfo": RequestInfo.deserializeBinary,
  "google.rpc.ResourceInfo": ResourceInfo.deserializeBinary,
  "google.rpc.Help": Help.deserializeBinary,
  "google.rpc.LocalizedMessage": LocalizedMessage.deserializeBinary,
  "google.rpc.ErrorInfo": ErrorInfo.deserializeBinary
};

interface ServiceError {
  metadata?: Metadata;
}

export function deserializeGrpcStatusDetails<
  TMap extends Record<string, (bytes: Uint8Array) => any>
>(
  error: ServiceError,
  deserializeMap: TMap
): {
  status: Status;
  details: Array<ReturnType<TMap[keyof TMap]>>;
} | null {
  if (!error.metadata) {
    return null;
  }

  const buffer = error.metadata.get("grpc-status-details-bin")[0];

  if (!buffer || typeof buffer === "string") {
    return null;
  }

  let status: Status | undefined;

  status = Status.deserializeBinary(buffer);

  const details: Array<ReturnType<TMap[keyof TMap]>> = status
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

export function deserializeGoogleGrpcStatusDetails(error: ServiceError) {
  return deserializeGrpcStatusDetails(error, googleDeserializeMap);
}

const notEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  return value !== null && value !== undefined;
};
