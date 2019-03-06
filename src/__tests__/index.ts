import { Metadata } from "grpc";
import { Any } from "google-protobuf/google/protobuf/any_pb";
import {
  BadRequest,
  ResourceInfo,
  Status,
  deserializeGrpcStatusDetails,
  deserializeGoogleGrpcStatusDetails
} from "../index";

function createServiceError() {
  const fieldViolation1 = new BadRequest.FieldViolation();
  fieldViolation1.setField("field1");
  fieldViolation1.setDescription("field1 is not valid");
  const fieldViolation2 = new BadRequest.FieldViolation();
  fieldViolation2.setField("field2");
  fieldViolation2.setDescription("field2 is not valid");

  const badRequest = new BadRequest();
  badRequest.setFieldViolationsList([fieldViolation1, fieldViolation2]);

  const anyBadRequest = new Any();
  anyBadRequest.pack(badRequest.serializeBinary(), "google.rpc.BadRequest");

  const resourceInfo = new ResourceInfo();
  resourceInfo.setResourceName("resourceName");
  resourceInfo.setResourceType("resourceType");
  resourceInfo.setOwner("Owner");
  resourceInfo.setDescription("Resource Info Description");

  const anyResourceInfo = new Any();
  anyResourceInfo.pack(
    resourceInfo.serializeBinary(),
    "google.rpc.ResourceInfo"
  );

  const status = new Status();
  status.setCode(3);
  status.setMessage("INVALID_ARGUMENT: value is invalid");
  status.setDetailsList([anyBadRequest, anyResourceInfo]);

  const statusSerialized = status.serializeBinary();
  const buffer = Buffer.from(statusSerialized);
  const metadata = new Metadata();
  metadata.set("grpc-status-details-bin", buffer);

  return {
    name: "Error",
    message: "Error Message",
    metadata
  };
}

describe("deserialize", () => {
  describe("deserializeGoogleGrpcStatusDetails", () => {
    it("deserializes grpc-status-details-bin with default google rpc error details", () => {
      const serviceError = createServiceError();

      const deserialized = deserializeGoogleGrpcStatusDetails(serviceError);

      expect(deserialized).not.toEqual(null);

      expect(Object.keys(deserialized!)).toMatchInlineSnapshot(`
Array [
  "status",
  "details",
]
`);

      const deserializedObj = {
        status: deserialized!.status.toObject(),
        details: deserialized!.details.map(d => d.toObject())
      };

      expect(deserializedObj).toMatchInlineSnapshot(`
Object {
  "details": Array [
    Object {
      "fieldViolationsList": Array [
        Object {
          "description": "field1 is not valid",
          "field": "field1",
        },
        Object {
          "description": "field2 is not valid",
          "field": "field2",
        },
      ],
    },
    Object {
      "description": "Resource Info Description",
      "owner": "Owner",
      "resourceName": "resourceName",
      "resourceType": "resourceType",
    },
  ],
  "status": Object {
    "code": 3,
    "detailsList": Array [
      Object {
        "typeUrl": "type.googleapis.com/google.rpc.BadRequest",
        "value": "Ch0KBmZpZWxkMRITZmllbGQxIGlzIG5vdCB2YWxpZAodCgZmaWVsZDISE2ZpZWxkMiBpcyBub3QgdmFsaWQ=",
      },
      Object {
        "typeUrl": "type.googleapis.com/google.rpc.ResourceInfo",
        "value": "CgxyZXNvdXJjZVR5cGUSDHJlc291cmNlTmFtZRoFT3duZXIiGVJlc291cmNlIEluZm8gRGVzY3JpcHRpb24=",
      },
    ],
    "message": "INVALID_ARGUMENT: value is invalid",
  },
}
`);
    });
  });

  describe("deserializeGrpcStatusDetails", () => {
    it("deserializes grpc-status-details-bin with custom rpc error details", () => {
      const serviceError = createServiceError();
      const deserialized = deserializeGrpcStatusDetails(serviceError, {
        "google.rpc.ResourceInfo": ResourceInfo.deserializeBinary,
        "google.rpc.BadRequest": BadRequest.deserializeBinary
      });

      expect(deserialized).not.toEqual(null);

      expect(Object.keys(deserialized!)).toMatchInlineSnapshot(`
Array [
  "status",
  "details",
]
`);

      const deserializedObj = {
        status: deserialized!.status.toObject(),
        details: deserialized!.details.map(d => d.toObject())
      };

      expect(deserializedObj).toMatchInlineSnapshot(`
Object {
  "details": Array [
    Object {
      "fieldViolationsList": Array [
        Object {
          "description": "field1 is not valid",
          "field": "field1",
        },
        Object {
          "description": "field2 is not valid",
          "field": "field2",
        },
      ],
    },
    Object {
      "description": "Resource Info Description",
      "owner": "Owner",
      "resourceName": "resourceName",
      "resourceType": "resourceType",
    },
  ],
  "status": Object {
    "code": 3,
    "detailsList": Array [
      Object {
        "typeUrl": "type.googleapis.com/google.rpc.BadRequest",
        "value": "Ch0KBmZpZWxkMRITZmllbGQxIGlzIG5vdCB2YWxpZAodCgZmaWVsZDISE2ZpZWxkMiBpcyBub3QgdmFsaWQ=",
      },
      Object {
        "typeUrl": "type.googleapis.com/google.rpc.ResourceInfo",
        "value": "CgxyZXNvdXJjZVR5cGUSDHJlc291cmNlTmFtZRoFT3duZXIiGVJlc291cmNlIEluZm8gRGVzY3JpcHRpb24=",
      },
    ],
    "message": "INVALID_ARGUMENT: value is invalid",
  },
}
`);
    });
  });
});
