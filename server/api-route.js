import path from "node:path";

import { Router } from "express";
import multer from "multer";
import asyncHandler from "express-async-handler";

import { generateSid, hashPassword, validatePassword, sha256 } from "./crypto.js";
import User from "./models/User.js";
import Analysis from "./models/Analysis.js";
import { getCompatibilityAnalysis, getSummary } from "./openai.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "working" });
});

// profile picture upload handler
const uploadProfilePicture = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB

  fileFilter: (req, file, cb) => {
    console.log(`[multer] filter accepting ${file.originalname} of mime type ${file.mimetype}`);

    const fileTypes = /^(jpeg|jpg|png)$/i;

    const extname = path.extname(file.originalname).substring(1).match(fileTypes);
    const mimeType = file.mimetype.replace(/^image\//, "").match(fileTypes);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  }
}).single("profilePicture");

function imageToBase64(file, mime) {
  // FIXME
  const base64 = file.buffer.toString("base64");

  return `data:${mime};base64,${base64}`;
}

function setSidCookie(res, sid) {
  res.cookie("sid", sid, {
    maxAage: 14 * 24 * 60 * 60 * 1000, // two weeks
    httpOnly: true,
  });
}

router.post("/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("bad request, missing username or password");
  }

  const user = await User.findOne({ username });

  if (!user) return res.status(404).send("username does not exist");

  // check for password hash

  if (!await validatePassword(password, user.hash)) return res.status(403).send("Incorrect password");

  // generate new session
  const sid = await generateSid();

  setSidCookie(res, sid);

  user.sid = sid;
  await user.save();

  // redirect them to their user page
  res.redirect("/user?signup-success=1");
}));

router.post("/logout", asyncHandler(async (req, res) => {
  const sid = req.cookies.sid;

  if (sid) {
    await User.updateOne({ sessionId: sid }, { sessionId: null });

    res.clearCookie("sid", { httpOnly: true });
  }

  res.redirect("/logged-out");
}));

router.post("/create-user", uploadProfilePicture, asyncHandler(async (req, res) => {
  let { username, password } = req.body;

  username = username?.trim();

  const { edit } = req.query;

  const profilePicture = req.file;

  if (!profilePicture) return res.status(400).send("Missing profile picture");

  const findByUsername = await User.findOne({ username });

  // check username clash
  if (!edit && findByUsername)
    return res.status(400).send("Username already exists");

  // validate
  if (!username) return res.status(400).send("Username cannnot be empty");

  if (!edit) {
    if (!username.match(/^[_a-zA-Z]\w*$/))
      return res.status(400).send("Invalid characters in username. Must be _, letters, or digits");
  }

  const fields = [
    "name",
    "age",
    "gender",
    "nationality",
    "description",
    "hobbies",
    "animals",
    "foods",
  ];

  const sid = await generateSid();

  const fieldsObject = {};

  for (const field of fields) {
    const bodyData = req.body[field];
    if (bodyData === undefined) res.status(400).send(`Missing field: '${field}'`);

    fieldsObject[field] = bodyData;
  }

  if (edit) {
    // validate session
    if (!req.cookies.sid) return req.status(403).send("Not logged in");
    if (req.cookies.sid !== findByUsername.sid) return req.status(403).send("Not authorized");

    // there is no double fetch here
    await findByUsername.updateOne(userObject);

    return res.send("Successfully updated profile");
  }

  // create user object
  const user = await User.create({
    ...fieldsObject,

    username,
    hash: await hashPassword(password),
    sid,

    createdAt: Date.now(),
    profilePicture: imageToBase64(profilePicture, profilePicture.mimetype), // TODO
  });

  if (!user) return res.status(500).send("Server error: could not create user");

  setSidCookie(res, sid);

  res.redirect("/user");
}));

router.post("/search", asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).send("missing query");

  const result = await User.findOne({
    $or: [
      { username: { $regex: query, $options: "i" } }, // case-insensitive regex search
      { name: { $regex: query, $options: "i" } }
    ]
  });

  return res.redirect("/user?pick=" + result.username);
}));

router.get("/user", asyncHandler(async (req, res) => {
  const { username } = req.query;

  if (!username) return res.status(400).send("missing username");

  const user = await User.findOne({ username });

  res.json(user && user.toJSON());
}));

router.get("/self", asyncHandler(async (req, res) => {
  const { sid } = req.cookies;

  if (!sid) return res.json(null);

  const user = await User.findOne({ sid });

  return res.json(user && user.toJSON());
}));
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
router.get("/users", asyncHandler(async (req, res) => {
  const limit = 100;

  const count = +req.query.count ?? 10;

  if (typeof count !== "number") return res.status(400).send("count must be a number");

  if (count > limit) return res.status(400).send(`Request exceeds limit of ${limit} users`);

  const { sid } = req.cookies;

  const { interest } = req.query;

  interest && console.log("interest regex: " + interest.split(",").map(s => escapeRegExp(s.trim())).join("|"));

  const users = await User.aggregate([
    {
      $match: {
        ...(sid ? { sid: { $ne: sid } } : {}),
        ...(interest ? { description: { $regex: interest.split(",").map(s => escapeRegExp(s.trim())).join("|"), $options: "i" } } : {}),
      }
    },
    {
      $sample: { size: count }
    }
  ]);

  res.json(users.map(u => {
    delete u.sid;
    delete u.hash;
    return u;
  }));
}));


router.get("/analysis", asyncHandler(async (req, res) => {
  // check for authentication
  const { sid } = req.cookies;
  let user;
  const authenticated = sid && (user = await User.findOne({ sid }));

  let { actor, interest } = req.query;

  if (actor) user = await User.findOne({ username: actor });

  if (!user) {
    return res.status(400).send("no user present. either be logged in or specify actor");
  }

  const target = await User.findOne({ username: interest });

  const hash = sha256(user.toJSON() + target.toJSON());

  let analysis = await Analysis.findOne({
    actor,
    interest,
  });

  if (analysis?.hash == hash) {
    // invalidate
    await Analysis.deleteOne({ actor, interest });
    analysis = null;
  }

  if (analysis) return res.json(analysis.toJSON());

  if (!authenticated) return res.status(403).send("retrieving new analysis requires an account");

  // create an analysis
  const compatibilityReport = await getCompatibilityAnalysis(
    user.toJSON(),
    target.toJSON(),
  );

  if (!compatibilityReport) return res.status(500).send("Failed to generate compatibility report");

  const summary = await getSummary(compatibilityReport.analysis, 40);

  const newAnalysis = await Analysis.create({
    actor,
    interest,
    // TODO
    evaluation: compatibilityReport.analysis,
    summary: summary,
    rating: compatibilityReport.rating,
    hash,
  });

  res.json(newAnalysis.toJSON());
}));

export default router;
