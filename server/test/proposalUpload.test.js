import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import Proposal from "../models/Proposal.js";
import { uploadDocument } from "../controllers/proposalController.js";

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("document upload stores a private file reference instead of base64 in the proposal", async (t) => {
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "proposal-upload-test-"));
  const storedPath = path.join(tempDirectory, "private-upload");
  await writeFile(storedPath, "%PDF test content");
  t.after(() => rm(tempDirectory, { recursive: true, force: true }));

  const proposal = {
    _id: "proposal-1",
    researcher: "researcher-1",
    checklistFiles: {},
    documents: [],
    markModified() {},
    save: async () => {},
  };
  const originalFindById = Proposal.findById;
  Proposal.findById = async () => proposal;
  t.after(() => { Proposal.findById = originalFindById; });

  const response = makeResponse();
  await uploadDocument({
    params: { proposalId: proposal._id },
    user: { id: "researcher-1" },
    body: { field: "checklistFiles.item_20" },
    file: {
      path: storedPath,
      filename: "private-random-key",
      originalname: "plagiarism-report.pdf",
      mimetype: "application/pdf",
    },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(proposal.documents.length, 1);
  assert.equal(proposal.documents[0].storageKey, "private-random-key");
  assert.equal(Object.hasOwn(proposal.documents[0], "fileContent"), false);
  assert.equal(
    proposal.checklistFiles.item_20,
    `/api/proposals/${proposal._id}/files/${proposal.documents[0]._id}`
  );
});