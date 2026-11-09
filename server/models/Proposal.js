// File: models/Proposal.js
import mongoose from "mongoose";

const investigatorSchema = new mongoose.Schema({
    name: { type: String },
    designation: { type: String },
    qualification: { type: String },
    department: { type: String },
    institution: { type: String },
    contact: { type: String },
    cvFile: { type: String } // path/URL to uploaded CV
});

const siteDetailSchema = new mongoose.Schema({
    name: { type: String },
    piName: { type: String },
    expectedParticipants: { type: Number }
});

const fundingDetailSchema = new mongoose.Schema({
    sponsorName: { type: String },
    amount: { type: Number },
    duration: { type: String }
});

const biologicalSampleSchema = new mongoose.Schema({
    type: { type: String },
    storageLocation: { type: String },
    duration: { type: String },
    disposalMethod: { type: String }
});

const checklistSchema = new mongoose.Schema({
    protocol: { type: Boolean, default: false },
    investigatorCVs: { type: Boolean, default: false },
    pisIcf: { type: Boolean, default: false },
    gcpTraining: { type: Boolean, default: false },
    ecReviewFeeReceipt: { type: Boolean, default: false },
    insuranceCertificate: { type: Boolean, default: false },
    indemnityPolicy: { type: Boolean, default: false },
    cta: { type: Boolean, default: false },
    mta: { type: Boolean, default: false },
    mou: { type: Boolean, default: false },
    budget: { type: Boolean, default: false },
    regulatoryApprovals: { type: Boolean, default: false },
    collaboratorMou: { type: Boolean, default: false },
    ethicalApprovals: { type: Boolean, default: false },
    healthMinistryScreening: { type: Boolean, default: false },
    plagReport: { type: Boolean, default: false },
    otherDocuments: { type: Boolean, default: false }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
    from: { type: String, default: null },
    to: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const reviewRecordSchema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cycle: { type: Number, required: true, default: 1 },
    recommendation: { type: String, enum: ["approve", "request_revision", "reject"], required: true },
    comments: { type: String, trim: true, required: true },
    submittedAt: { type: Date, default: Date.now }
});

const finalDecisionSchema = new mongoose.Schema({
    decision: { type: String, enum: ["approved", "rejected", "returned"], required: true },
    reason: { type: String, trim: true, default: "" },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    decidedAt: { type: Date, default: Date.now }
}, { _id: false });

const proposalSchema = new mongoose.Schema(
    {
        title: { type: String },
        researcher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: [
                "draft",
                "submitted",
                "returned",
                "withdrawn",
                "fees_pending",
                "payment_completed",
                "admin_verified",
                "scrutiny_verified",
                "under_review",
                "admin_decision_pending",
                "revision_required",
                "approved",
                "rejected"
            ],
            default: "draft",
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Not Required", "Paid", "Under Verification", "Verified", "Payment Verified", "Rejected"],
            default: "Pending"
        },
        feeAmount: { type: Number, default: 0 },
        paymentMethod: { type: String, enum: ["Razorpay", "Manual", "None"], default: "None" },
        transactionId: { type: String },
        razorpayOrderId: { type: String },
        receiptUrl: { type: String },
        isVerified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedAt: { type: Date },
        feeCategory: { type: String },
        baseFee: { type: Number, default: 0 },
        gstAmount: { type: Number, default: 0 },
        totalPayable: { type: Number, default: 0 },
        paymentProofUrl: { type: String },
        rejectionReason: { type: String },
        returnReason: { type: String },
        paymentVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        paymentVerifiedAt: { type: Date },
        withdrawnAt: { type: Date },
        withdrawnBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        administrative: {
            organization: { type: String },
            iecName: { type: String },
            dateOfSubmission: { type: Date },
            reviewType: {
                type: String,
                enum: ["Exemption", "Expedited", "Full Committee"]
            },
            studyTitle: { type: String },
            shortTitle: { type: String },
            protocolNumber: { type: String },
            protocolVersion: { type: String },
            principalInvestigator: investigatorSchema,
            coInvestigators: [investigatorSchema]
        },

        research: {
            studyType: [{ type: String }],
            studyDesign: {
                type: String,
                enum: ["", "interventional", "observational"]
            },
            studyDuration: { type: Number },
            studySites: {
                type: String,
                enum: ["", "single", "multi"]
            },
            siteDetails: [siteDetailSchema],
            fundingSource: {
                type: String,
                enum: ["", "self", "govt", "industry", "other"]
            },
            fundingDetails: fundingDetailSchema,
            sponsorDetails: { type: String },
            croDetails: { type: String },
            conflictOfInterest: { type: Boolean },
            conflictDetails: { type: String },
            insuranceCoverage: { type: Boolean },
            insuranceDetails: { type: String }
        },

        participant: {
            participantCount: { type: Number },
            vulnerableGroups: [{ type: String }],
            inclusionCriteria: { type: String },
            exclusionCriteria: { type: String },
            recruitmentMethod: { type: String },
            interventionDetails: { type: String },
            dataCollectionMethods: [{ type: String }],
            riskAssessment: {
                type: String,
                enum: ["", "minimal", "low", "high"]
            },
            benefitAssessment: {
                type: String,
                enum: ["", "direct", "indirect", "none"]
            },
            privacyMeasures: { type: String }
        },

        consentData: {
            waiverRequest: { type: Boolean, default: false },
            waiverJustification: { type: String },
            consentProcess: { type: String },
            consentFormEnglish: { type: String },
            consentFormLocal: { type: String },
            avRecording: { type: Boolean, default: false },
            avJustification: { type: String },
            dataSharing: {
                type: String,
                enum: ["", "none", "anonymized", "full"]
            },
            sampleStorage: {
                type: String,
                enum: ["", "none", "short_term", "long_term", "biobank"]
            }
        },

        declaration: {
            agree: { type: Boolean, default: false },
            signatureFile: { type: String }
        },

        sectionA: { type: mongoose.Schema.Types.Mixed },
        sectionB: { type: mongoose.Schema.Types.Mixed },
        sectionC: { type: mongoose.Schema.Types.Mixed },
        sectionD: { type: mongoose.Schema.Types.Mixed },
        sectionE: { type: mongoose.Schema.Types.Mixed },
        sectionF: { type: mongoose.Schema.Types.Mixed },
        sectionG: { type: mongoose.Schema.Types.Mixed },
        
        checklist: { type: mongoose.Schema.Types.Mixed },
        checklistFiles: { type: mongoose.Schema.Types.Mixed },
        sectionBR: { type: mongoose.Schema.Types.Mixed },
        sectionIC: { type: mongoose.Schema.Types.Mixed },
        sectionSC: { type: mongoose.Schema.Types.Mixed },
        sectionPub: { type: mongoose.Schema.Types.Mixed },
        sectionDecl: { type: mongoose.Schema.Types.Mixed },

        summary: { type: String },
        objectives: { type: String },
        methodology: { type: String },
        expectedOutcome: { type: String },

        reviewers: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        ],
        reviewCycle: { type: Number, default: 1 },
        reviewRecords: [reviewRecordSchema],
        finalDecision: { type: finalDecisionSchema },
        statusHistory: { type: [statusHistorySchema], default: [] },
        assignedTo: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        ],
        documents: [
            {
                fileName: { type: String },
                fileContent: { type: String },
                contentType: { type: String },
                uploadedAt: { type: Date, default: Date.now }
            }
        ],
        comments: [
            {
                reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                text: String,
                decision: {
                    type: String,
                    enum: ["approved", "revision_required", "rejected"]
                },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        responses: [
            {
                researcher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                text: String,
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("Proposal", proposalSchema);