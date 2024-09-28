import { Schema } from "mongoose";
import { connection } from "../db.js";

export default connection.model("User", new Schema({
  userid: String,
  hash: String, // password hash
  sid: String, // session id

  username: String,
  createdAt: Date,
  profilePicture: String, // base64 of the profile picture

  age: Number,
  gender: String,
  nationality: String,
  description: String,

  hobbies: [String],
  animals: [String],
  foods: [String],
}));
