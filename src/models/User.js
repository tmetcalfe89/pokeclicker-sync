import mongoose from "mongoose";

const { Schema } = mongoose;

const syncDataSchema = new Schema(
  {
    values: {
      type: Map,
      of: Schema.Types.Mixed,
      default: () => ({})
    },
    updatedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3
    },
    passwordHash: {
      type: String,
      required: true
    },
    syncData: {
      type: syncDataSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    username: this.username,
    syncUpdatedAt: this.syncData?.updatedAt || null
  };
};

export const User = mongoose.model("User", userSchema);
