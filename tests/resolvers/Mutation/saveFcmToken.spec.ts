import "dotenv/config";
import { Types } from "mongoose";
import { User } from "../../../src/models";
import { MutationSaveFcmTokenArgs } from "../../../src/types/generatedGraphQLTypes";
import { connect, disconnect } from "../../helpers/db";
import mongoose from "mongoose";
import { saveFcmToken as saveFcmTokenResolver } from "../../../src/resolvers/Mutation/saveFcmToken";
import { USER_NOT_FOUND } from "../../../src/constants";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createTestUserFunc, testUserType } from "../../helpers/user";

let MONGOOSE_INSTANCE: typeof mongoose | null;
let testUser: testUserType;

beforeAll(async () => {
  MONGOOSE_INSTANCE = await connect();
  testUser = await createTestUserFunc();
});

afterAll(async () => {
  await disconnect(MONGOOSE_INSTANCE!);
});

describe("resolvers -> Mutation -> saveFcmToken", () => {
  it(`throws NotFoundError current user with _id === context.userId does not exist`, async () => {
    try {
      const args: MutationSaveFcmTokenArgs = {
        token: "",
      };

      const context = {
        userId: Types.ObjectId().toString(),
      };

      await saveFcmTokenResolver?.({}, args, context);
    } catch (error: any) {
      expect(error.message).toEqual(USER_NOT_FOUND);
    }
  });

  it(`saves the fcm token and returns true`, async () => {
    const args: MutationSaveFcmTokenArgs = {
      token: "fcmToken",
    };

    const context = {
      userId: testUser!.id,
    };

    const saveFcmTokenPayload = await saveFcmTokenResolver?.({}, args, context);

    expect(saveFcmTokenPayload).toEqual(true);

    const testSaveFcmTokenPayload = await User.findOne({
      _id: testUser!._id,
    })
      .select("token")
      .lean();

    expect(testSaveFcmTokenPayload?.token).toEqual("fcmToken");
  });
});
