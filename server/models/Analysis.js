import { connection } from "../db.js";

export default connection.model("Analysis", {
  actor: String, // actor user id
  interest: String, // the user id the actor is interested in
  summary: String, // summary of the evaluation
  evaluation: String, // evaluation of the relationship
  rating: Number, // 0 to 10 scale of evaluation rating
});
