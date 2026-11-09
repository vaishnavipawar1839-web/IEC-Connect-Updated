import { z } from "zod";

export const investigatorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  qualification: z.string().min(1, "Qualification is required"),
  department: z.string().min(1, "Department is required"),
  institution: z.string().min(1, "Institution is required"),
  contact: z.string().min(1, "Contact is required"),
  cvFile: z.string().optional().or(z.literal("")),
});

export const siteDetailSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Site name required"),
  piName: z.string().min(1, "PI name required"),
  expectedParticipants: z.number().min(0, "Invalid number"),
});

export const fundingDetailSchema = z.object({
  sponsorName: z.string().min(1, "Sponsor name required"),
  amount: z.number().min(0, "Invalid amount"),
  duration: z.string().min(1, "Duration required"),
});

export const biologicalSampleSchema = z.object({
  type: z.string().min(1, "Type required"),
  storageLocation: z.string().min(1, "Location required"),
  duration: z.number().min(1, "Duration required"),
  disposalMethod: z.string().min(1, "Method required"),
});



export const sectionLocationSchema = z.object({
  location: z.string().min(1, "Location is required"),
  details: z.string().optional(),
});

const naWaivableChecklistDocuments = [1, 2, 14, 16, 18];
const alwaysRequiredChecklistDocuments = [20];

export const proposalSchema = z.object({
  administrative: z.any().optional(),
  research: z.any().optional(),
  participant: z.any().optional(),
  consentData: z.any().optional(),
  declaration: z.any().optional(),

  sectionA: z.object({
    nameOfOrganization: z.string().min(1, "Name of Organization is required"),
    nameOfEthicsCommittee: z.string().min(1, "Name of Ethics Committee is required"),
    nameOfPrincipalInvestigator: z.string().min(1, "Name of Principal Investigator is required"),
    departmentDivision: z.string().min(1, "Department / Division is required"),
    dateOfSubmission: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    typeOfResearch: z.array(z.string()).min(1, "Select at least one type of research"),
    typeOfReviewRequested: z.string().min(1, "Select type of review requested"),
    titleOfTheStudy: z.string().min(1, "Title of the Study is required"),
    acronymShortTitle: z.string().optional(),
    protocolNumber: z.string().optional(),
    versionNumber: z.string().optional(),
    piStudiesCount: z.union([z.string(), z.number()]).optional(),
    coPiStudiesCount: z.union([z.string(), z.number()]).optional(),
    durationOfStudy: z.string().min(1, "Duration of the Study is required"),
  }),
  sectionB: z.any().optional(),
  sectionC: z.any().optional(),
  sectionD: z.any().optional(),
  sectionE: z.any().optional(),
  sectionBR: z.any().optional(),
  sectionIC: z.any().optional(),
  sectionSC: z.any().optional(),
  sectionPub: z.any().optional(),
  sectionDecl: z.any().optional(),
  sectionF: z.any().optional(),
  checklist: z.object({
    yn_1: z.string({ required_error: "Please select Yes/No/NA", invalid_type_error: "Please select Yes/No/NA" }).min(1, "Please select Yes/No/NA"),
    yn_2: z.string({ required_error: "Please select Yes/No/NA", invalid_type_error: "Please select Yes/No/NA" }).min(1, "Please select Yes/No/NA"),
    yn_20: z.enum(["Yes", "No"], { error: "The Plagiarism Report is mandatory" }),
    yn_14: z.string({ required_error: "Please select Yes/No/NA", invalid_type_error: "Please select Yes/No/NA" }).min(1, "Please select Yes/No/NA"),
    yn_16: z.string({ required_error: "Please select Yes/No/NA", invalid_type_error: "Please select Yes/No/NA" }).min(1, "Please select Yes/No/NA"),
    yn_18: z.string({ required_error: "Please select Yes/No/NA", invalid_type_error: "Please select Yes/No/NA" }).min(1, "Please select Yes/No/NA"),
  }).passthrough().default({}),
  checklistFiles: z.object({}).passthrough().default({}),
  sectionG: z.object({
    researchType: z.string().optional(),
    feeAmount: z.number().optional(),
    paymentStatus: z.string().optional(),
    paymentMethod: z.enum(["Razorpay", "Manual", "None"]).optional(),
    transactionId: z.string().optional(),
    receiptUrl: z.string().optional(),
    isVerified: z.boolean().optional(),
  }).optional(),
}).superRefine((proposal, context) => {
  for (const itemNo of naWaivableChecklistDocuments) {
    const answer = proposal.checklist?.[`yn_${itemNo}`];
    const file = proposal.checklistFiles?.[`item_${itemNo}`];
    if (answer !== "NA" && (typeof file !== "string" || !file.trim())) {
      context.addIssue({
        code: "custom",
        path: ["checklistFiles", `item_${itemNo}`],
        message: "Required document not uploaded (select NA if it does not apply)",
      });
    }
  }
  for (const itemNo of alwaysRequiredChecklistDocuments) {
    const file = proposal.checklistFiles?.[`item_${itemNo}`];
    if (typeof file !== "string" || !file.trim()) {
      context.addIssue({
        code: "custom",
        path: ["checklistFiles", `item_${itemNo}`],
        message: "Plagiarism Report must be uploaded",
      });
    }
  }
});