import test from "node:test";
import assert from "node:assert/strict";
import { proposalSchema } from "../src/schemas/proposalSchema.js";

const validProposalWithChecklist = () => ({
  sectionA: {
    nameOfOrganization: "Example Institute",
    nameOfEthicsCommittee: "Example Ethics Committee",
    nameOfPrincipalInvestigator: "Researcher One",
    departmentDivision: "Medicine",
    dateOfSubmission: "2026-11-10",
    typeOfResearch: ["Observational"],
    typeOfReviewRequested: "Expedited",
    titleOfTheStudy: "A Study",
    durationOfStudy: "12 months",
  },
  checklist: {
    yn_1: "Yes",
    yn_2: "Yes",
    yn_14: "Yes",
    yn_16: "Yes",
    yn_18: "Yes",
    yn_20: "Yes",
  },
  checklistFiles: {
    item_1: "cover-letter.pdf",
    item_2: "investigator-cv.pdf",
    item_14: "protocol.pdf",
    item_16: "consent-form.pdf",
    item_18: "questionnaire.pdf",
    item_20: "plagiarism-report.pdf",
  },
});

test("NA answers waive the corresponding mandatory file upload", () => {
  const proposal = validProposalWithChecklist();
  proposal.checklist.yn_1 = "NA";
  delete proposal.checklistFiles.item_1;

  const result = proposalSchema.safeParse(proposal);
  assert.equal(result.success, true);
});

test("mandatory checklist answers still require their file unless marked NA", () => {
  const proposal = validProposalWithChecklist();
  delete proposal.checklistFiles.item_14;

  const result = proposalSchema.safeParse(proposal);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((issue) =>
    issue.path.join(".") === "checklistFiles.item_14"
  ));
});

test("plagiarism report is mandatory and cannot be marked NA", () => {
  const proposal = validProposalWithChecklist();
  delete proposal.checklistFiles.item_20;

  const missingReport = proposalSchema.safeParse(proposal);
  assert.equal(missingReport.success, false);
  assert.ok(missingReport.error.issues.some((issue) =>
    issue.path.join(".") === "checklistFiles.item_20"
  ));

  proposal.checklist.yn_20 = "NA";
  const notApplicable = proposalSchema.safeParse(proposal);
  assert.equal(notApplicable.success, false);
  assert.ok(notApplicable.error.issues.some((issue) =>
    issue.path.join(".") === "checklist.yn_20"
  ));
});