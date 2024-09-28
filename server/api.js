import { Router } from "express";
import multer from "multer";
import User from "./models/User";
import asyncHandler from "express-async-handler";
import { generateSid, hashPassword, validatePassword } from "./crypto";
import Analysis from "./models/Analysis";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "working" });
});

// profile picture upload handler
const uploadProfilePicture = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB

  fileFilter: (req, file, cb) => {
    const fileTypes = /^(jpeg|jpg|png)$/i;

    const extname = fileTypes.match(file.originalname);
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  }
}).single("profilePicture");

function imageToBase64(file, ext) {
  // FIXME
  const base64 = file.toString("base64");

  return `data:image/${ext};base64,${base64}`;
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

  if (!validatePassword(password, user.hash)) return res.status(403).send("Incorrect password");

  // generate new session
  const sid = generateSid();

  setSidCookie(res, sid);

  // redirect them to their user page
  res.redirect("/user");
}));

router.post("/create-user", uploadProfilePicture, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const profilePicture = req.file;

  if (!profilePicture) return res.status(400).send("Missing profile picture");

  // check username clash
  if (await User.findOne({ username }))
    return res.status(400).send("Username already exists");

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

  const sid = generateSid();

  const userObject = {
    username,
    hash: hashPassword(password),
    sid,

    createdAt: Date.now(),
    profilePicture: "", // TODO

    // ... fields
  };

  for (const field of fields) {
    const bodyData = req.body[field];
    if (bodyData === undefined) res.status(400).send(`Missing field: '${field}'`);

    userObject[field] = bodyData;
  }

  // create user object
  const user = await User.create(userObject);

  if (!user) return res.status(500).send("Server error: could not create user");

  setSidCookie(res, sid);

  res.redirect("/user");
}));

router.get("/user-info", asyncHandler(async (req, res) => {
  const { username } = req.query;

  const user = await User.findOne({ username });

  if (!user) return res.status(404).send(`No user exists with username '${username}'`);

  // Got user, return as json

  res.json(user.toJSON());
}));

router.get("/users", asyncHandler(async (req, res) => {
  const limit = 100;

  const count = req.query.count ?? 10;

  if (count > limit) return res.status(400).send(`Request exceeds limit of ${limit} users`);

  const users = await User.aggregate(([{ $sample: { size: count } }]));

  res.json(users.map(u => u.toJSON()));
}));

router.get("/analysis", asyncHandler(async (req, res) => {
  // check for authentication
  const { sid } = req.cookies;
  const authenticated = sid && await User.findOne({ sid });

  const { actor, interest } = req.query;

  const analysis = await Analysis.findOne({
    actor,
    interest,
  });

  if (analysis) return res.json(analysis.toJSON);

  if (!authenticated) return res.status(403).send("retrieving new analysis requires an account");

  // create an analysis

  const newAnalysis = await Analysis.create({
    actor,
    interest,
    // TODO
    summary: "<summary>",
    evaluation: "<evaluation>",
    rating: 5,
  });

  res.json(newAnalysis);
}));

export default router;
