import { Schema } from "mongoose";
import { connection } from "../db.js";

const User = connection.model("User", new Schema({
  username: String,
  hash: String, // password hash
  sid: String, // session id

  createdAt: Date,
  profilePicture: String, // base64 of the profile picture

  name: String,
  age: Number,
  gender: String,
  nationality: String,
  description: String,

  hobbies: String,
  animals: String,
  foods: String,
}));

export default User;

User.method("toJSON", function () {
  const user = this.toObject();

  delete user.sid;
  delete user.hash;

  return user;
});
