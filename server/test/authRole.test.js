import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { loginUser, registerUser } from "../controllers/userController.js";
import { createReviewer } from "../controllers/adminController.js";

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  cookieValue: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  cookie(_name, value) {
    this.cookieValue = value;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const withLoginUser = (t, user) => {
  const originalFindOne = User.findOne;
  User.findOne = async () => user;
  t.after(() => { User.findOne = originalFindOne; });
};

test("login rejects a selected role that does not match the account", async (t) => {
  const password = "Valid-reviewer-password";
  withLoginUser(t, {
    _id: "64b000000000000000000001",
    email: "reviewer@example.org",
    role: "reviewer",
    password: await bcrypt.hash(password, 10),
  });

  const response = makeResponse();
  await loginUser({ body: { email: "reviewer@example.org", password, role: "researcher" } }, response);

  assert.equal(response.statusCode, 403);
  assert.match(response.body.message, /registered as reviewer/i);
  assert.equal(response.cookieValue, null);
});

test("reviewer can sign in when the selected role matches", async (t) => {
  const password = "Valid-reviewer-password";
  withLoginUser(t, {
    _id: "64b000000000000000000001",
    name: "Reviewer One",
    email: "reviewer@example.org",
    role: "reviewer",
    password: await bcrypt.hash(password, 10),
  });
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousRefreshSecret = process.env.JWT_REFRESH_SECRET;
  process.env.JWT_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  t.after(() => {
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
    if (previousRefreshSecret === undefined) delete process.env.JWT_REFRESH_SECRET;
    else process.env.JWT_REFRESH_SECRET = previousRefreshSecret;
  });

  const response = makeResponse();
  await loginUser({ body: { email: " REVIEWER@Example.ORG ", password, role: "reviewer" } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.user.role, "reviewer");
  assert.equal(jwt.decode(response.body.accessToken).role, "reviewer");
  assert.ok(response.cookieValue);
});

test("admin provisioning creates reviewer accounts with a hashed password", async (t) => {
  const previousFindOne = User.findOne;
  const previousCountDocuments = User.countDocuments;
  const previousCreate = User.create;
  User.findOne = async () => null;
  User.countDocuments = async () => 4;
  let createdUser;
  User.create = async (data) => {
    createdUser = { ...data, _id: "64b000000000000000000005" };
    return createdUser;
  };
  t.after(() => {
    User.findOne = previousFindOne;
    User.countDocuments = previousCountDocuments;
    User.create = previousCreate;
  });

  const response = makeResponse();
  await createReviewer({
    body: {
      name: "Reviewer One",
      designation: "Consultant",
      qualification: "MD",
      department: "Medicine",
      institution: "Example Institute",
      email: "REVIEWER@example.org",
      password: "Valid-reviewer-password",
    },
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(createdUser.role, "reviewer");
  assert.equal(createdUser.shortCode, "REV005");
  assert.notEqual(createdUser.password, "Valid-reviewer-password");
  assert.equal(response.body.reviewer.role, "reviewer");
  assert.equal(Object.hasOwn(response.body.reviewer, "password"), false);
});

test("public signup normalizes email and ignores privileged role requests", async (t) => {
  const previousFindOne = User.findOne;
  const previousCountDocuments = User.countDocuments;
  const previousSave = User.prototype.save;
  let savedUser;
  User.findOne = async () => null;
  User.countDocuments = async () => 0;
  User.prototype.save = async function saveUser() {
    savedUser = this;
    return this;
  };
  t.after(() => {
    User.findOne = previousFindOne;
    User.countDocuments = previousCountDocuments;
    User.prototype.save = previousSave;
  });

  const response = makeResponse();
  await registerUser({
    body: {
      name: "Researcher One",
      designation: "Investigator",
      qualification: "MD",
      department: "Medicine",
      institution: "Example Institute",
      email: "  RESEARCHER@Example.ORG ",
      password: "Valid-researcher-password",
      role: "admin",
    },
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(savedUser.role, "researcher");
  assert.equal(savedUser.email, "researcher@example.org");
  assert.notEqual(savedUser.password, "Valid-researcher-password");
});
