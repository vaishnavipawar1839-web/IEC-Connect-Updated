import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { uploadProposalSingle } from "../middleware/upload.js";

const privateUploadDirectory = new URL("../private_uploads/proposals/", import.meta.url);

test("proposal upload middleware writes a PDF to private disk storage", async (t) => {
  const app = express();
  app.post("/upload", uploadProposalSingle(), (req, res) => {
    res.json({ filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size });
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  const form = new FormData();
  form.append("file", new Blob(["%PDF-1.4 test"], { type: "application/pdf" }), "protocol.pdf");
  const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
    method: "POST",
    body: form,
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.mimetype, "application/pdf");
  assert.ok(result.size > 0);
  assert.match(result.filename, /^[0-9a-f-]{36}$/i);

  await unlink(new URL(result.filename, privateUploadDirectory));
});
