// import { useFormContext, Controller, useFieldArray } from "react-hook-form";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Trash2 } from "lucide-react";

// // ─────────────────────────────────────────────
// // PDF HELPER
// // ─────────────────────────────────────────────
// export const openPdfBase64 = (e, base64Data) => {
//     e.preventDefault();
//     if (!base64Data) return;
//     try {
//         let base64String = base64Data;
//         if (base64String.includes(",")) base64String = base64String.split(",")[1];
//         const byteCharacters = atob(base64String);
//         const byteNumbers = new Array(byteCharacters.length);
//         for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
//         const byteArray = new Uint8Array(byteNumbers);
//         const blob = new Blob([byteArray], { type: "application/pdf" });
//         window.open(URL.createObjectURL(blob), "_blank");
//     } catch (err) {
//         console.error("Error opening PDF", err);
//         alert("Failed to open document. It may not be a valid PDF.");
//     }
// };

// // ─────────────────────────────────────────────
// // SHARED HELPERS
// // ─────────────────────────────────────────────
// const ro = (readOnly) => readOnly ? "bg-slate-50 text-slate-700 border-slate-200" : "";

// const SectionTitle = ({ number, title }) => (
//     <div className="border-b-2 border-blue-700 pb-2 mb-6">
//         <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wide">
//             {number}. {title}
//         </h3>
//     </div>
// );

// const SubLabel = ({ children, required }) => (
//     <Label className="text-sm font-medium text-gray-700 mb-1 block">
//         {children}{required && <span className="text-red-500 ml-1">*</span>}
//     </Label>
// );

// const RadioGroup = ({ name, control, options, readOnly, row = true }) => (
//     <Controller
//         name={name}
//         control={control}
//         render={({ field }) => (
//             <div className={`flex ${row ? "flex-row flex-wrap gap-6" : "flex-col gap-2"}`}>
//                 {options.map(opt => (
//                     <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
//                         <input
//                             type="radio"
//                             value={opt}
//                             checked={field.value === opt}
//                             onChange={() => !readOnly && field.onChange(opt)}
//                             disabled={readOnly}
//                             className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                         />
//                         {opt}
//                     </label>
//                 ))}
//             </div>
//         )}
//     />
// );

// const MultiCheckGroup = ({ name, control, options, readOnly, cols = 1 }) => (
//     <Controller
//         name={name}
//         control={control}
//         render={({ field }) => (
//             <div className={`grid grid-cols-1 ${cols === 2 ? "md:grid-cols-2" : ""} gap-2`}>
//                 {options.map(opt => (
//                     <div key={opt} className="flex items-start space-x-2">
//                         <Checkbox
//                             id={name + "-" + opt.replace(/[\s/()]+/g, "-")}
//                             checked={field.value?.includes(opt) || false}
//                             disabled={readOnly}
//                             onCheckedChange={(checked) => {
//                                 const updated = checked
//                                     ? [...(field.value || []), opt]
//                                     : (field.value || []).filter(t => t !== opt);
//                                 field.onChange(updated);
//                             }}
//                             className="mt-0.5"
//                         />
//                         <Label
//                             htmlFor={name + "-" + opt.replace(/[\s/()]+/g, "-")}
//                             className="text-sm cursor-pointer leading-snug"
//                         >
//                             {opt}
//                         </Label>
//                     </div>
//                 ))}
//             </div>
//         )}
//     />
// );

// // ═══════════════════════════════════════════════════════════════
// // SECTION A — BASIC INFORMATION / 1. ADMINISTRATIVE DETAILS
// // ═══════════════════════════════════════════════════════════════
// const SectionAForm = ({ readOnly }) => {
//     const { register, control, formState: { errors } } = useFormContext();

//     return (
//         <div className="space-y-8">
//             <SectionTitle number="SECTION A" title="BASIC INFORMATION" />

//             {/* Header note */}
//             <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 leading-relaxed">
//                 <strong>General Instructions:</strong> a) Tick one or more options as applicable. Mark NA if not applicable. &nbsp; b) Attach additional sheets if required.
//             </div>

//             {/* Type of Research preamble checkboxes */}
//             <div className="bg-gray-50 border border-gray-200 rounded p-4">
//                 <SubLabel>Type of Research (tick one or more as applicable)</SubLabel>
//                 <MultiCheckGroup
//                     name="sectionA.typeOfResearch"
//                     control={control}
//                     readOnly={readOnly}
//                     cols={2}
//                     options={[
//                         "PG Student Dissertation Research",
//                         "PG Student Non-Dissertation Research",
//                         "UG Student Research",
//                         "Faculty Research",
//                         "Clinical Trial",
//                         "Research from Other Institute",
//                     ]}
//                 />
//             </div>

//             <div className="space-y-5">
//                 <h4 className="text-base font-semibold text-gray-800 bg-gray-100 px-3 py-2 rounded">
//                     1. ADMINISTRATIVE DETAILS
//                 </h4>

//                 <div>
//                     <SubLabel>(a) Name of Organization</SubLabel>
//                     <Input {...register("sectionA.nameOfOrganization")} placeholder="Name of Organization" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>

//                 <div>
//                     <SubLabel>(b) Name of Ethics Committee</SubLabel>
//                     <Input {...register("sectionA.nameOfEthicsCommittee")} placeholder="Name of Ethics Committee" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>

//                 <div>
//                     <SubLabel>(c) Name of Principal Investigator</SubLabel>
//                     <Input {...register("sectionA.nameOfPrincipalInvestigator")} placeholder="Name of Principal Investigator" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                         <SubLabel>(d) Department / Division</SubLabel>
//                         <Input {...register("sectionA.departmentDivision")} placeholder="Department / Division" className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                     <div>
//                         <SubLabel>(e) Date of Submission</SubLabel>
//                         <Input type="date" {...register("sectionA.dateOfSubmission")} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 </div>

//                 <div>
//                     <SubLabel>(f) Type of Review Requested</SubLabel>
//                     <RadioGroup
//                         name="sectionA.typeOfReviewRequested"
//                         control={control}
//                         readOnly={readOnly}
//                         options={["Exemption from Review", "Expedited Review", "Full Committee Review"]}
//                     />
//                     {errors.sectionA?.typeOfReviewRequested && <p className="text-red-500 text-xs mt-1">{errors.sectionA.typeOfReviewRequested.message}</p>}
//                 </div>

//                 <div>
//                     <SubLabel>(g) Title of the Study</SubLabel>
//                     <Textarea {...register("sectionA.titleOfTheStudy")} rows={3} placeholder="Full title of the study" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>

//                 <div>
//                     <SubLabel>Acronym / Short Title (If any)</SubLabel>
//                     <Input {...register("sectionA.acronymShortTitle")} placeholder="Acronym / Short Title" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                         <SubLabel>(h) Protocol Number (If any)</SubLabel>
//                         <Input {...register("sectionA.protocolNumber")} placeholder="Protocol Number" className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                     <div>
//                         <SubLabel>Version Number</SubLabel>
//                         <Input {...register("sectionA.versionNumber")} placeholder="Version Number" className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 </div>

//                 {/* (i) Investigators Table */}
//                 <InvestigatorsTable readOnly={readOnly} />

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                         <SubLabel>(j)(i) No. of studies where applicant is Principal Investigator at time of submission</SubLabel>
//                         <Input type="number" {...register("sectionA.piStudiesCount", { valueAsNumber: true })} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                     <div>
//                         <SubLabel>(j)(ii) No. of studies where applicant is Co-Investigator at time of submission</SubLabel>
//                         <Input type="number" {...register("sectionA.coPiStudiesCount", { valueAsNumber: true })} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 </div>

//                 <div>
//                     <SubLabel>(k) Duration of the Study</SubLabel>
//                     <Input {...register("sectionA.durationOfStudy")} placeholder="e.g. 12 months" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>
//         </div>
//     );
// };

// const InvestigatorsTable = ({ readOnly }) => {
//     const { register, control } = useFormContext();
//     const { fields, append, remove } = useFieldArray({ control, name: "sectionA.investigators" });

//     return (
//         <div className="space-y-2">
//             <div className="flex items-center justify-between">
//                 <SubLabel>(i) Details of Investigators</SubLabel>
//                 {!readOnly && (
//                     <Button type="button" size="sm" variant="outline"
//                         onClick={() => append({ role: "", designation: "", department: "", address: "" })}>
//                         + Add Investigator
//                     </Button>
//                 )}
//             </div>
//             <div className="overflow-x-auto border border-gray-300 rounded">
//                 <table className="w-full text-sm border-collapse">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold w-40">Role</th>
//                             <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Designation &amp; Qualification</th>
//                             <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Department &amp; Institution</th>
//                             <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Address for Communication (Mobile No &amp; Email ID)</th>
//                             {!readOnly && <th className="border border-gray-300 px-2 py-2 w-8"></th>}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {fields.length === 0 && (
//                             <tr>
//                                 <td colSpan={readOnly ? 4 : 5} className="border border-gray-300 px-3 py-4 text-center text-gray-400 italic text-xs">
//                                     {readOnly ? "No investigators added." : "Click '+ Add Investigator' to begin."}
//                                 </td>
//                             </tr>
//                         )}
//                         {fields.map((field, idx) => (
//                             <tr key={field.id}>
//                                 <td className="border border-gray-300 px-1 py-1">
//                                     <Input {...register(`sectionA.investigators.${idx}.role`)} placeholder="e.g. Principal Investigator" readOnly={readOnly} className={readOnly ? "bg-white border-0 text-xs" : "text-xs"} />
//                                 </td>
//                                 <td className="border border-gray-300 px-1 py-1">
//                                     <Input {...register(`sectionA.investigators.${idx}.designation`)} placeholder="Designation &amp; Qualification" readOnly={readOnly} className={readOnly ? "bg-white border-0 text-xs" : "text-xs"} />
//                                 </td>
//                                 <td className="border border-gray-300 px-1 py-1">
//                                     <Input {...register(`sectionA.investigators.${idx}.department`)} placeholder="Department &amp; Institution" readOnly={readOnly} className={readOnly ? "bg-white border-0 text-xs" : "text-xs"} />
//                                 </td>
//                                 <td className="border border-gray-300 px-1 py-1">
//                                     <Input {...register(`sectionA.investigators.${idx}.address`)} placeholder="Mobile No &amp; Email ID" readOnly={readOnly} className={readOnly ? "bg-white border-0 text-xs" : "text-xs"} />
//                                 </td>
//                                 {!readOnly && (
//                                     <td className="border border-gray-300 px-1 py-1 text-center">
//                                         <button type="button" onClick={() => remove(idx)} className="text-red-500 hover:text-red-700">
//                                             <Trash2 className="h-3.5 w-3.5" />
//                                         </button>
//                                     </td>
//                                 )}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION B — 2. FUNDING DETAILS AND BUDGET
// // ═══════════════════════════════════════════════════════════════
// const SectionBForm = ({ readOnly }) => {
//     const { register, control } = useFormContext();
//     return (
//         <div className="space-y-6">
//             <SectionTitle number="2" title="FUNDING DETAILS AND BUDGET" />

//             <div>
//                 <SubLabel>(a) Total Estimated Budget for Site</SubLabel>
//                 <Input type="number" {...register("sectionB.totalEstimatedBudget", { valueAsNumber: true })} className={ro(readOnly)} readOnly={readOnly} />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {[["At Site", "budgetAtSite"], ["In India", "budgetInIndia"], ["Globally", "budgetGlobally"]].map(([label, key]) => (
//                     <div key={key}>
//                         <SubLabel>{label}</SubLabel>
//                         <Input type="number" {...register(`sectionB.${key}`, { valueAsNumber: true })} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 ))}
//             </div>

//             <div>
//                 <SubLabel>(b) Funding Source (tick as applicable)</SubLabel>
//                 <MultiCheckGroup
//                     name="sectionB.fundingSource"
//                     control={control}
//                     readOnly={readOnly}
//                     options={["Self-Funding", "Institutional Funding", "Funding Agency (Specify)"]}
//                 />
//                 <div className="mt-3">
//                     <SubLabel>Funding Agency / Sponsor Details</SubLabel>
//                     <Textarea {...register("sectionB.sponsorDetails")} rows={2} placeholder="Specify name and details of funding agency / sponsor" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION C — 3. OVERVIEW OF RESEARCH
// // ═══════════════════════════════════════════════════════════════
// const SectionCForm = ({ readOnly }) => {
//     const { register, control } = useFormContext();
//     return (
//         <div className="space-y-6">
//             <SectionTitle number="3" title="OVERVIEW OF RESEARCH" />

//             <div>
//                 <SubLabel>(a) Lay Summary (within 300 words)</SubLabel>
//                 <p className="text-xs text-gray-500 mb-1 italic">
//                     Summarize in the simplest possible way such that a person with no prior knowledge of the subject can easily understand it.
//                 </p>
//                 <Textarea {...register("sectionC.laySummary")} rows={10} className={ro(readOnly)} readOnly={readOnly} />
//             </div>

//             <div>
//                 <SubLabel>(b) Type of Study</SubLabel>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
//                     <MultiCheckGroup
//                         name="sectionC.typeOfStudy"
//                         control={control}
//                         readOnly={readOnly}
//                         options={[
//                             "Basic Sciences",
//                             "Retrospective",
//                             "Prospective",
//                             "Qualitative",
//                             "Quantitative",
//                             "Mixed Method",
//                             "Any Others (Specify)",
//                         ]}
//                     />
//                     <MultiCheckGroup
//                         name="sectionC.typeOfStudy"
//                         control={control}
//                         readOnly={readOnly}
//                         options={[
//                             "Clinical",
//                             "Epidemiological / Public Health",
//                             "Socio-behavioral",
//                             "Biological Samples / Data",
//                             "Cross Sectional",
//                             "Case Control",
//                             "Cohort",
//                             "Systematic Review",
//                         ]}
//                     />
//                 </div>
//                 <div className="mt-3">
//                     <SubLabel>If "Any Others", please specify</SubLabel>
//                     <Input {...register("sectionC.typeOfStudyOther")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION D — 4. METHODOLOGY
// // ═══════════════════════════════════════════════════════════════
// const SectionDForm = ({ readOnly }) => {
//     const { register, control } = useFormContext();
//     return (
//         <div className="space-y-6">
//             <SectionTitle number="4" title="METHODOLOGY" />

//             <div>
//                 <SubLabel>(a) Sample Size / Number of Participants (as applicable)</SubLabel>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
//                     {[["At Site", "sampleSizeAtSite"], ["In India", "sampleSizeInIndia"], ["Globally", "sampleSizeGlobally"]].map(([label, key]) => (
//                         <div key={key}>
//                             <SubLabel>{label}</SubLabel>
//                             <Input {...register(`sectionD.${key}`)} className={ro(readOnly)} readOnly={readOnly} />
//                         </div>
//                     ))}
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//                     <div>
//                         <SubLabel>Control Group</SubLabel>
//                         <Input {...register("sectionD.controlGroup")} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                     <div>
//                         <SubLabel>Study Group</SubLabel>
//                         <Input {...register("sectionD.studyGroup")} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 </div>
//                 <SubLabel>Justification for the sample size chosen (100 words)</SubLabel>
//                 <p className="text-xs text-gray-500 mb-1 italic">
//                     In case of qualitative study, mention the criteria used for calculation.
//                 </p>
//                 <Textarea {...register("sectionD.sampleSizeJustification")} rows={5} className={ro(readOnly)} readOnly={readOnly} />
//             </div>

//             <div className="border-t pt-4">
//                 <SubLabel>(b) Is there an external laboratory / outsourcing involved for investigations?</SubLabel>
//                 <RadioGroup name="sectionD.externalLabInvolved" control={control} readOnly={readOnly} options={["Yes", "No", "NA"]} />
//             </div>

//             <div className="border-t pt-4">
//                 <SubLabel>(c) How was the scientific quality of the study assessed?</SubLabel>
//                 <MultiCheckGroup
//                     name="sectionD.scientificQualityAssessment"
//                     control={control}
//                     readOnly={readOnly}
//                     options={[
//                         "Independent External Review",
//                         "Review by Sponsor / Funder",
//                         "Review within PI's Institution (Department review for PG student)",
//                         "No Review",
//                     ]}
//                 />
//                 <div className="mt-3">
//                     <SubLabel>Date of Review</SubLabel>
//                     <Input type="date" {...register("sectionD.reviewDate")} className={ro(readOnly) + " w-48"} readOnly={readOnly} />
//                 </div>
//                 <div className="mt-3">
//                     <SubLabel>Comments in Review Meeting, if any (100 words)</SubLabel>
//                     <Textarea {...register("sectionD.reviewComments")} rows={4} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION E — 5. RECRUITMENT AND RESEARCH PARTICIPANTS
// // ═══════════════════════════════════════════════════════════════
// const SectionEForm = ({ readOnly }) => {
//     const { register, control } = useFormContext();
//     return (
//         <div className="space-y-6">
//             <SectionTitle number="5" title="RECRUITMENT AND RESEARCH PARTICIPANTS" />

//             {/* (a) Type of participants */}
//             <div>
//                 <SubLabel>(a) Type of Participants in the Study</SubLabel>
//                 <MultiCheckGroup
//                     name="sectionE.participantTypes"
//                     control={control}
//                     readOnly={readOnly}
//                     cols={2}
//                     options={["Healthy Volunteers", "Patients", "Vulnerable Persons / Special Groups", "Others (Specify)"]}
//                 />
//                 <div className="mt-2">
//                     <SubLabel>If "Others", specify</SubLabel>
//                     <Input {...register("sectionE.participantTypesOther")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//                 <div className="mt-3">
//                     <SubLabel>Who will do the Recruitment?</SubLabel>
//                     <Input {...register("sectionE.whoWillRecruit")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//                 <div className="mt-3">
//                     <SubLabel>Participant Recruitment Methods Used</SubLabel>
//                     <MultiCheckGroup
//                         name="sectionE.recruitmentMethods"
//                         control={control}
//                         readOnly={readOnly}
//                         cols={2}
//                         options={[
//                             "Posters / Leaflets / Letters",
//                             "TV / Radio Ads / Social Media / Institution Website",
//                             "Patient / Family / Friends / Visiting Hospitals",
//                             "Telephone",
//                             "Others (Specify)",
//                         ]}
//                     />
//                     <div className="mt-2">
//                         <SubLabel>If "Others", specify</SubLabel>
//                         <Input {...register("sectionE.recruitmentMethodsOther")} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 </div>
//             </div>

//             {/* (b) Vulnerable Persons */}
//             <div className="border-t pt-4 space-y-4">
//                 <div>
//                     <SubLabel>(b)(i) Will there be vulnerable persons / special groups involved?</SubLabel>
//                     <RadioGroup name="sectionE.vulnerablePersonsInvolved" control={control} readOnly={readOnly} options={["Yes", "No", "NA"]} />
//                 </div>
//                 <div>
//                     <SubLabel>(b)(ii) If yes, type of vulnerable persons / special groups</SubLabel>
//                     <MultiCheckGroup
//                         name="sectionE.vulnerableGroupTypes"
//                         control={control}
//                         readOnly={readOnly}
//                         cols={2}
//                         options={[
//                             "Children under 18 yrs",
//                             "Pregnant or Lactating Women",
//                             "Differently Abled (Mental / Physical)",
//                             "Employees / Students / Nurses / Staff",
//                             "Elderly",
//                             "Institutionalized",
//                             "Economically and Socially Disadvantaged",
//                             "Refugees / Migrants / Homeless",
//                             "Terminally Ill (Stigmatized or Rare Diseases)",
//                             "Any Other (Specify)",
//                         ]}
//                     />
//                 </div>
//                 <div>
//                     <SubLabel>(b)(iii) Provide justification for inclusion / exclusion</SubLabel>
//                     <Textarea {...register("sectionE.vulnerableGroupJustification")} rows={3} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//                 <div>
//                     <SubLabel>(b)(iv) Are there any additional safeguards to protect research participants?</SubLabel>
//                     <Textarea {...register("sectionE.additionalSafeguards")} rows={3} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (c) Reimbursement */}
//             <div className="border-t pt-4">
//                 <SubLabel>(c) Is there any reimbursement to the participants?</SubLabel>
//                 <RadioGroup name="sectionE.reimbursement" control={control} readOnly={readOnly} options={["Yes", "No"]} />
//                 <div className="mt-2 pl-2 space-y-2">
//                     <p className="text-xs text-gray-600">If yes —</p>
//                     <MultiCheckGroup name="sectionE.reimbursementType" control={control} readOnly={readOnly} options={["Monetary", "Non-Monetary"]} />
//                     <SubLabel>Provide details</SubLabel>
//                     <Textarea {...register("sectionE.reimbursementDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (d) Incentives */}
//             <div className="border-t pt-4">
//                 <SubLabel>(d) Are there any incentives to the participants?</SubLabel>
//                 <RadioGroup name="sectionE.incentives" control={control} readOnly={readOnly} options={["Yes", "No"]} />
//                 <div className="mt-2 pl-2 space-y-2">
//                     <p className="text-xs text-gray-600">If yes —</p>
//                     <MultiCheckGroup name="sectionE.incentivesType" control={control} readOnly={readOnly} options={["Monetary", "Non-Monetary"]} />
//                     <SubLabel>Provide details</SubLabel>
//                     <Textarea {...register("sectionE.incentivesDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (e) Recruitment fees for PI */}
//             <div className="border-t pt-4">
//                 <SubLabel>(e) Are there any participant recruitment fees / incentives for the study provided to the PI / Institution?</SubLabel>
//                 <RadioGroup name="sectionE.piRecruitmentFees" control={control} readOnly={readOnly} options={["Yes", "No"]} />
//                 <div className="mt-2 pl-2 space-y-2">
//                     <p className="text-xs text-gray-600">If yes —</p>
//                     <MultiCheckGroup name="sectionE.piRecruitmentFeesType" control={control} readOnly={readOnly} options={["Monetary", "Non-Monetary"]} />
//                     <SubLabel>Provide details</SubLabel>
//                     <Textarea {...register("sectionE.piRecruitmentFeesDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION 6: BENEFITS AND RISKS
// // ═══════════════════════════════════════════════════════════════
// const SectionBenefitsRisks = ({ readOnly }) => {
//     const { register, control } = useFormContext();

//     return (
//         <div className="space-y-6">
//             <SectionTitle number="6" title="BENEFITS AND RISKS" />

//             {/* (a)(i) Anticipated risks */}
//             <div>
//                 <SubLabel>(a)(i) Are there any anticipated physical / social / psychological discomforts / risk to participants?</SubLabel>
//                 <RadioGroup name="sectionBR.hasRisks" control={control} readOnly={readOnly} options={["Yes", "No"]} />

//                 <div className="mt-4">
//                     <SubLabel>If yes, categorize the level of risk</SubLabel>
//                     <RadioGroup
//                         name="sectionBR.riskLevel"
//                         control={control}
//                         readOnly={readOnly}
//                         row={false}
//                         options={[
//                             "Less than Minimal Risk",
//                             "Minimal Risk",
//                             "Minor Increase over Minimal Risk or Low Risk",
//                             "More than Minimal Risk or High Risk",
//                         ]}
//                     />
//                 </div>

//                 {/* Risk reference table */}
//                 <div className="mt-4 overflow-x-auto">
//                     <table className="w-full text-xs border-collapse border border-gray-300">
//                         <thead className="bg-gray-100">
//                             <tr>
//                                 <th className="border border-gray-300 px-2 py-2 w-10 text-center">Sr. No</th>
//                                 <th className="border border-gray-300 px-2 py-2 w-52">Type of Risk</th>
//                                 <th className="border border-gray-300 px-2 py-2">Examples</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {[
//                                 ["1.", "Less than Minimal Risk", "Research on anonymous or non-identified data/samples, data available in the public domain, meta-analysis, etc."],
//                                 ["2.", "Minimal Risk", "Research involving routine questioning or history taking, observing, physical examination, chest X-ray, obtaining body fluids without invasive intervention, such as hair, saliva or urine samples, etc."],
//                                 ["3.", "Minor Increase over Minimal Risk or Low Risk", "Routine research on children and adolescents; research on persons incapable of giving consent, drawing a small sample of blood for testing; trying a new diagnostic technique in pregnant and breastfeeding women, etc. Use of personal identifiable data in research."],
//                                 ["4.", "More than Minimal Risk or High Risk", "Research involving any interventional study using a drug, device or invasive procedure such as lumbar puncture, lung or liver biopsy, endoscopic procedure, intravenous sedation for diagnostic procedures, etc."],
//                             ].map(([no, type, ex]) => (
//                                 <tr key={no}>
//                                     <td className="border border-gray-300 px-2 py-1.5 text-center align-top">{no}</td>
//                                     <td className="border border-gray-300 px-2 py-1.5 font-semibold align-top">{type}</td>
//                                     <td className="border border-gray-300 px-2 py-1.5 align-top leading-relaxed">{ex}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="mt-4">
//                     <SubLabel>(a)(ii) Describe the Risk Management Strategy</SubLabel>
//                     <Textarea {...register("sectionBR.riskManagementStrategy")} rows={4} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (b) Benefits */}
//             <div className="border-t pt-4 space-y-4">
//                 <SubLabel>(b) What are the potential benefits from the study?</SubLabel>
//                 {[
//                     ["For the Participant", "sectionBR.benefitsForParticipant"],
//                     ["For the Society / Community", "sectionBR.benefitsForSociety"],
//                     ["For Improvement in Science", "sectionBR.benefitsForScience"],
//                 ].map(([label, key]) => (
//                     <div key={key}>
//                         <SubLabel>{label}</SubLabel>
//                         <Textarea {...register(key)} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 ))}
//                 <div>
//                     <SubLabel>Please describe how the benefits justify the risks</SubLabel>
//                     <Textarea {...register("sectionBR.benefitsJustifyRisks")} rows={3} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (c) Adverse events */}
//             <div className="border-t pt-4">
//                 <SubLabel>(c) Are adverse events expected in the study?</SubLabel>
//                 <RadioGroup name="sectionBR.adverseEventsExpected" control={control} readOnly={readOnly} options={["Yes", "No", "NA"]} />
//             </div>

//             {/* (d) Reporting procedures */}
//             <div className="border-t pt-4">
//                 <SubLabel>(d) Are reporting procedures and management strategies described in the study?</SubLabel>
//                 <RadioGroup name="sectionBR.reportingProceduresDescribed" control={control} readOnly={readOnly} options={["Yes", "No"]} />
//                 <div className="mt-2">
//                     <SubLabel>If Yes, Specify</SubLabel>
//                     <Textarea {...register("sectionBR.reportingProceduresDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION 7: INFORMED CONSENT
// // ═══════════════════════════════════════════════════════════════
// const SectionInformedConsent = ({ readOnly }) => {
//     const { register, control } = useFormContext();

//     return (
//         <div className="space-y-6">
//             <SectionTitle number="7" title="INFORMED CONSENT" />

//             {/* (a) Waiver */}
//             <div>
//                 <SubLabel>(a) Are you seeking waiver of consent? If yes, please specify reasons and skip to item no. 8</SubLabel>
//                 <RadioGroup name="sectionIC.waiverOfConsent" control={control} readOnly={readOnly} options={["Yes", "No"]} />
//                 <div className="mt-2">
//                     <SubLabel>If Yes, specify reasons</SubLabel>
//                     <Textarea {...register("sectionIC.waiverReason")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (b) Version numbers */}
//             <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                     <SubLabel>(b) Version Number and Date of Participant Information Sheet (PIS)</SubLabel>
//                     <Input {...register("sectionIC.pisVersionDate")} placeholder="e.g. Version 1.0, 01-01-2024" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//                 <div>
//                     <SubLabel>Version Number and Date of Informed Consent Form (ICF)</SubLabel>
//                     <Input {...register("sectionIC.icfVersionDate")} placeholder="e.g. Version 1.0, 01-01-2024" className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (c) Type of consent */}
//             <div className="border-t pt-4">
//                 <SubLabel>(c) Type of Consent Planned For</SubLabel>
//                 <MultiCheckGroup
//                     name="sectionIC.consentTypes"
//                     control={control}
//                     readOnly={readOnly}
//                     cols={2}
//                     options={[
//                         "Signed Consent",
//                         "Verbal / Oral Consent",
//                         "Witnessed Consent",
//                         "Audio-Video (AV) Consent",
//                         "Consent from LAR (If so, specify from whom)",
//                         "Other",
//                     ]}
//                 />
//                 <div className="mt-2">
//                     <SubLabel>If LAR / Other, specify</SubLabel>
//                     <Input {...register("sectionIC.consentTypesOther")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>

//                 <div className="mt-5">
//                     <SubLabel>For Children</SubLabel>
//                     <MultiCheckGroup
//                         name="sectionIC.consentForChildren"
//                         control={control}
//                         readOnly={readOnly}
//                         options={[
//                             "For children < 7 yrs — Parental / LAR Consent",
//                             "Verbal Assent from Minor (7–12 yrs) along with Parental Consent",
//                             "Written Assent from Minor (13–18 yrs) along with Parental Consent",
//                         ]}
//                     />
//                     <div className="mt-2">
//                         <SubLabel>Specify (if other arrangement)</SubLabel>
//                         <Input {...register("sectionIC.consentForChildrenOther")} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 </div>
//             </div>

//             {/* (d) Who obtains consent */}
//             <div className="border-t pt-4">
//                 <SubLabel>(d) Who will obtain the Informed Consent?</SubLabel>
//                 <MultiCheckGroup
//                     name="sectionIC.consentObtainedBy"
//                     control={control}
//                     readOnly={readOnly}
//                     cols={2}
//                     options={["PI / Co-I", "Nurse / Counselor", "Research Staff", "Other (Specify)"]}
//                 />
//                 <div className="mt-2">
//                     <SubLabel>Any tools to be used</SubLabel>
//                     <Input {...register("sectionIC.consentToolsUsed")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (e) Languages */}
//             <div className="border-t pt-4">
//                 <SubLabel>(e) Participant Information Sheet (PIS) and Informed Consent Form (ICF) available in</SubLabel>
//                 <MultiCheckGroup
//                     name="sectionIC.pisLanguages"
//                     control={control}
//                     readOnly={readOnly}
//                     options={["English", "Local Language", "Other (Specify)"]}
//                 />
//                 <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <SubLabel>List the languages in which translations were done</SubLabel>
//                         <Input {...register("sectionIC.translationLanguages")} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                     <div>
//                         <SubLabel>If translation has not been done, please justify</SubLabel>
//                         <Input {...register("sectionIC.noTranslationJustification")} className={ro(readOnly)} readOnly={readOnly} />
//                     </div>
//                 </div>
//             </div>

//             {/* (f) Stored samples */}
//             <div className="border-t pt-4">
//                 <SubLabel>(f) Provide details of consent requirements for previously stored samples if used in the study</SubLabel>
//                 <Textarea {...register("sectionIC.storedSamplesConsentDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//             </div>

//             {/* (g) Elements in PIS/ICF */}
//             <div className="border-t pt-4">
//                 <SubLabel>(g) Elements contained in the Participant Information Sheet (PIS) and Informed Consent Form (ICF)</SubLabel>
//                 <MultiCheckGroup
//                     name="sectionIC.icfElements"
//                     control={control}
//                     readOnly={readOnly}
//                     cols={2}
//                     options={[
//                         "Simple Language",
//                         "Data / Sample Sharing",
//                         "Risks and Discomforts",
//                         "Need to Re-Contact",
//                         "Alternatives to Participation",
//                         "Confidentiality",
//                         "Right to Withdraw",
//                         "Storage of Samples",
//                         "Benefits",
//                         "Return of Research Results",
//                         "Purpose and Procedure",
//                         "Payment for Participation",
//                         "Compensation for Study Related Injury",
//                         "Statement that Consent is Voluntary",
//                         "Commercialization / Benefit Sharing",
//                         "Statement that Study Involves Research",
//                         "Use of Photographs / Identifying Data",
//                         "Contact Information of PI and Member Secretary of EC",
//                         "Others (Specify)",
//                     ]}
//                 />
//                 <div className="mt-2">
//                     <SubLabel>If "Others", specify</SubLabel>
//                     <Input {...register("sectionIC.icfElementsOther")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION 8: AGREEMENT BETWEEN COLLABORATING PARTNERS
// // (this is a checklist/declaration section in the DOCX — 
// //  handled within the checklist; included here as a note page)
// // ═══════════════════════════════════════════════════════════════

// // ═══════════════════════════════════════════════════════════════
// // SECTION 9: STORAGE AND CONFIDENTIALITY
// // ═══════════════════════════════════════════════════════════════
// const SectionStorageConfidentiality = ({ readOnly }) => {
//     const { register, control } = useFormContext();

//     return (
//         <div className="space-y-6">
//             <SectionTitle number="9" title="STORAGE AND CONFIDENTIALITY" />

//             {/* (a) Identifying information */}
//             <div>
//                 <SubLabel>(a) Identifying Information: Study Involves Samples / Data</SubLabel>
//                 <RadioGroup name="sectionSC.studyInvolvesData" control={control} readOnly={readOnly} options={["Yes", "No", "NA"]} />

//                 <div className="mt-3">
//                     <SubLabel>If Yes, specify type of identifying information</SubLabel>
//                     <MultiCheckGroup
//                         name="sectionSC.identifyingInfoType"
//                         control={control}
//                         readOnly={readOnly}
//                         options={[
//                             "Anonymous / Unidentified",
//                             "Anonymized",
//                             "Reversibly Coded",
//                             "Irreversibly Coded",
//                             "Identifiable",
//                         ]}
//                     />
//                 </div>

//                 <div className="mt-3">
//                     <SubLabel>
//                         If identifiers must be retained, what additional precautions will be taken to ensure that access is limited / data is safeguarded?
//                     </SubLabel>
//                     <p className="text-xs text-gray-500 mb-1 italic">
//                         (e.g. data stored in a cabinet, password protected computer etc.)
//                     </p>
//                     <Textarea {...register("sectionSC.identifierPrecautions")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (b)(c)(d) Data maintenance */}
//             <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                     <SubLabel>(b) Who will be maintaining the data pertaining to the study?</SubLabel>
//                     <Input {...register("sectionSC.dataMaintainedBy")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//                 <div>
//                     <SubLabel>(c) Where will the data be analyzed and by whom?</SubLabel>
//                     <Input {...register("sectionSC.dataAnalyzedBy")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//                 <div>
//                     <SubLabel>(d) For how long will the data be stored?</SubLabel>
//                     <Input {...register("sectionSC.dataStorageDuration")} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>

//             {/* (e) Future use */}
//             <div className="border-t pt-4">
//                 <SubLabel>(e) Do you propose to use stored samples / data in future studies?</SubLabel>
//                 <RadioGroup name="sectionSC.futureSamplesUse" control={control} readOnly={readOnly} options={["Yes", "No", "Maybe"]} />
//                 <div className="mt-2">
//                     <SubLabel>If yes, explain how you might use stored material / data in the future</SubLabel>
//                     <Textarea {...register("sectionSC.futureSamplesExplanation")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION 10: PUBLICATION, BENEFIT SHARING AND IPR ISSUES
// // ═══════════════════════════════════════════════════════════════
// const SectionPublicationIPR = ({ readOnly }) => {
//     const { register, control } = useFormContext();

//     const items = [
//         {
//             label: "(a) Will the results of the study be reported and disseminated? If yes, specify.",
//             radioField: "sectionPub.resultsReported",
//             detailsField: "sectionPub.resultsReportedDetails",
//             opts: ["Yes", "No", "NA"],
//         },
//         {
//             label: "(b) Will you inform participants about the results of the study?",
//             radioField: "sectionPub.participantsInformed",
//             opts: ["Yes", "No", "NA"],
//         },
//         {
//             label: "(c) Are there any arrangements for continued provision of the intervention for participants, if effective, once the study has finished? If yes, describe in brief (Max 50 words).",
//             radioField: "sectionPub.continuedIntervention",
//             detailsField: "sectionPub.continuedInterventionDetails",
//             opts: ["Yes", "No", "NA"],
//         },
//         {
//             label: "(d) Is there any plan for post research benefit sharing with participants? If yes, specify.",
//             radioField: "sectionPub.benefitSharing",
//             detailsField: "sectionPub.benefitSharingDetails",
//             opts: ["Yes", "No", "NA"],
//         },
//         {
//             label: "(e) Is there any commercial value or a plan to patent / IPR issues? If yes, please provide details.",
//             radioField: "sectionPub.iprIssues",
//             detailsField: "sectionPub.iprIssuesDetails",
//             opts: ["Yes", "No", "NA"],
//         },
//         {
//             label: "(f) Do you have any additional information to add in support of the application, which is not included elsewhere in the form? If yes, provide details.",
//             radioField: "sectionPub.additionalInfo",
//             detailsField: "sectionPub.additionalInfoDetails",
//             opts: ["Yes", "No"],
//         },
//     ];

//     return (
//         <div className="space-y-6">
//             <SectionTitle number="10" title="PUBLICATION, BENEFIT SHARING AND IPR ISSUES" />
//             {items.map((item, i) => (
//                 <div key={i} className={i > 0 ? "border-t pt-4" : ""}>
//                     <SubLabel>{item.label}</SubLabel>
//                     <RadioGroup name={item.radioField} control={control} readOnly={readOnly} options={item.opts} />
//                     {item.detailsField && (
//                         <div className="mt-2">
//                             <Textarea
//                                 {...register(item.detailsField)}
//                                 rows={2}
//                                 placeholder="Specify details..."
//                                 className={ro(readOnly)}
//                                 readOnly={readOnly}
//                             />
//                         </div>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION 11: DECLARATION
// // ═══════════════════════════════════════════════════════════════
// const SectionDeclaration = ({ readOnly }) => {
//     const { register, control } = useFormContext();

//     const declarations = [
//         "I/We certify that the information provided in this application is complete and correct.",
//         "I/We confirm that all investigators have approved the submitted version of proposal / related documents.",
//         "I/We confirm that this study will be conducted in accordance with the latest ICMR National Ethical Guidelines for Biomedical and Health Research Involving Human Participants and other applicable regulations and guidelines.",
//         "I/We confirm that this study will be conducted in accordance with the New Drugs and Clinical Trials Rules, 2019 amended from time to time, GCP guidelines and other applicable regulations and guidelines.",
//         "I/We will comply with all policies and guidelines of the institute and affiliated / collaborating institutions where this study will be conducted.",
//         "I/We will ensure that personnel performing this study are qualified, appropriately trained and will adhere to the provisions of the EC approved protocol.",
//         "I/We declare that the expenditure in case of injury related to the study will be taken care of.",
//         "I/We confirm that an undertaking of what will be done with the leftover samples is provided, if applicable.",
//         "I/We confirm that we shall submit any protocol amendments, adverse events report, significant deviations from protocols, progress reports and a final report and also participate in any audit of the study if needed.",
//         "I/We confirm that we will maintain accurate and complete records of all aspects of the study.",
//         "I/We will protect the privacy of participants and assure confidentiality of data and biological samples.",
//         "I/We hereby declare that I / any of the investigators, researchers and/or close relative(s), have no conflict of interest (Financial / Non-Financial) with the sponsor(s) and outcome of study.",
//         "I/We declare / confirm that all necessary government approvals will be obtained as per requirements wherever applicable.",
//     ];

//     return (
//         <div className="space-y-6">
//             <SectionTitle number="11" title="DECLARATION (Please tick as applicable)" />

//             <div className="space-y-2">
//                 {declarations.map((text, idx) => (
//                     <div key={idx} className="flex items-start space-x-3 p-3 rounded border border-gray-200 hover:bg-gray-50">
//                         <Controller
//                             name={`sectionDecl.decl_${idx}`}
//                             control={control}
//                             render={({ field }) => (
//                                 <Checkbox
//                                     id={`decl-${idx}`}
//                                     checked={field.value || false}
//                                     disabled={readOnly}
//                                     onCheckedChange={(v) => field.onChange(v)}
//                                     className="mt-0.5 flex-shrink-0"
//                                 />
//                             )}
//                         />
//                         <Label htmlFor={`decl-${idx}`} className="text-sm cursor-pointer leading-relaxed">{text}</Label>
//                     </div>
//                 ))}
//             </div>

//             {/* Conflict of Interest */}
//             <div className="border border-yellow-300 bg-yellow-50 rounded p-4">
//                 <SubLabel>I/We have the following conflict of interest (PI / Co-I) — list below if applicable:</SubLabel>
//                 <Textarea
//                     {...register("sectionDecl.conflictOfInterestDetails")}
//                     rows={3}
//                     placeholder={"1. ...\n2. ..."}
//                     className={readOnly ? "bg-yellow-50 border-yellow-200" : ""}
//                     readOnly={readOnly}
//                 />
//             </div>

//         </div>
//     );
// };

// // ═══════════════════════════════════════════════════════════════
// // SECTION 12: CHECKLIST
// // ═══════════════════════════════════════════════════════════════
// const SectionChecklist = ({ onFileUpload, readOnly, hideFeeDocs = false }) => {
//     const { register, control, watch } = useFormContext();

//     // Items marked mandatory per DOCX: 1, 2, 14, 16, 18
//     const adminItems = [
//         { no: 1, label: "Cover Letter", mandatory: true },
//         { no: 2, label: "Brief CV of all Investigators", mandatory: true },
//         { no: 3, label: "Good Clinical Practice (GCP) training of investigators in last 3 years", mandatory: false },
//         { no: 4, label: "Department MOM of reviewing Synopsis (PG Research / PG Dissertation only)", mandatory: false },
//         { no: 5, label: "Basic Course in Biomedical Research (BCBR) Certification (For PG Students & Teachers Synopsis)", mandatory: false },
//         { no: 6, label: "EC Review Fee paid receipt (For PG Dissertation Synopsis)", mandatory: false },
//         { no: 7, label: "EC clearance of other centers *", mandatory: false },
//         { no: 8, label: "Agreement between collaborating partners *", mandatory: false },
//         { no: 9, label: "MTA between collaborating partners *", mandatory: false },
//         { no: 10, label: "Insurance policy / certificate", mandatory: false },
//         { no: 11, label: "Evidence of external laboratory credentials in case of an externally outsourced laboratory study — QA/QC certification", mandatory: false },
//         { no: 12, label: "Copy of contract or agreement signed with the sponsor or donor agency", mandatory: false },
//         { no: 13, label: "Provide all significant previous decisions (e.g. those leading to a negative decision or modified protocol) by other ECs / Regulatory authorities for proposed study (whether in same location or elsewhere) and modification(s) to protocol", mandatory: false },
//     ];

//     const proposalItems = [
//         { no: 14, label: "Copy of the detailed protocol", mandatory: true },
//         { no: 15, label: "Investigators Brochure (If applicable for drug / biological / device trials)", mandatory: false },
//         { no: 16, label: "Participant Information Sheet (PIS) and Participant Informed Consent Form (ICF) (English and translated)", mandatory: true },
//         { no: 17, label: "Assent form for minors (12–18 years) (English and Translated)", mandatory: false },
//         { no: 18, label: "Proforma / Questionnaire / Case Report Forms (CRF) / Interview guides / Guides for Focused Group Discussions (FGDs) (English and translated)", mandatory: true },
//         { no: 19, label: "Advertisement / material to recruit participants (fliers, posters etc.)", mandatory: false },
//     ];

//     const govItems = [
//         { no: 20, label: "CTRI" },
//         { no: 21, label: "DCGI" },
//         { no: 22, label: "HMSC" },
//         { no: 23, label: "NAC-SCRT" },
//         { no: 24, label: "ICSCR" },
//         { no: 25, label: "RCGM" },
//         { no: 26, label: "GEAC" },
//         { no: 27, label: "BARC" },
//         { no: 28, label: "Tribal Board" },
//         { no: 29, label: "Others (Specify)" },
//     ];

//     const thCls = "border border-gray-300 bg-gray-100 px-2 py-2 text-xs font-semibold text-gray-800 text-center";
//     const tdCls = "border border-gray-300 px-2 py-1.5 text-sm align-top";

//     const YNAField = ({ name }) => (
//         <Controller
//             name={name}
//             control={control}
//             render={({ field }) => (
//                 <div className="flex gap-3 justify-center">
//                     {["Yes", "No", "NA"].map(opt => (
//                         <label key={opt} className="flex flex-col items-center gap-0.5 text-xs cursor-pointer">
//                             <input
//                                 type="radio"
//                                 value={opt}
//                                 checked={field.value === opt}
//                                 onChange={() => !readOnly && field.onChange(opt)}
//                                 disabled={readOnly}
//                                 className="h-3 w-3 text-blue-600"
//                             />
//                             {opt}
//                         </label>
//                     ))}
//                 </div>
//             )}
//         />
//     );

//     const FileCell = ({ itemNo }) => {
//         const fk = `checklistFiles.item_${itemNo}`;
//         const fileValue = watch(fk);

//         if (itemNo === 6 && hideFeeDocs) {
//             return <span className="text-green-600 text-xs font-semibold">✓ Payment Verified</span>;
//         }
//         return (
//             <div className="space-y-1">
//                 {!readOnly && (
//                     <input
//                         type="file"
//                         accept=".pdf"
//                         onChange={(e) => onFileUpload && onFileUpload(e, fk)}
//                         className="text-xs w-full"
//                     />
//                 )}
//                 {fileValue ? (
//                     <div className="flex items-center gap-2">
//                         <span className="text-green-600 text-xs font-medium">✓ Uploaded</span>
//                         {readOnly && (
//                             <button
//                                 onClick={(e) => openPdfBase64(e, fileValue)}
//                                 className="text-blue-600 hover:underline text-xs font-semibold"
//                             >
//                                 View PDF
//                             </button>
//                         )}
//                     </div>
//                 ) : (
//                     readOnly && <span className="text-xs text-gray-400 italic">No file uploaded</span>
//                 )}
//             </div>
//         );
//     };

//     const ChecklistTable = ({ items }) => (
//         <div className="overflow-x-auto">
//             <table className="w-full border-collapse border border-gray-300 text-sm">
//                 <thead>
//                     <tr>
//                         <th className={thCls + " w-10"}>S. No</th>
//                         <th className={thCls}>Items</th>
//                         <th className={thCls + " w-32"}>Yes / No / NA</th>
//                         <th className={thCls + " w-28"}>Enclosure No</th>
//                         <th className={thCls + " w-44"}>Upload Document</th>
//                         <th className={thCls + " w-44"}>EC Remarks (If applicable)</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {items.map(item => (
//                         <tr key={item.no} className={item.mandatory ? "bg-amber-50" : "bg-white"}>
//                             <td className={tdCls + " text-center font-semibold"}>{item.no}</td>
//                             <td className={tdCls}>
//                                 {item.label}
//                                 {item.mandatory && (
//                                     <span className="ml-1 text-red-500 font-bold" title="Mandatory">*</span>
//                                 )}
//                             </td>
//                             <td className={tdCls}><YNAField name={`checklist.yn_${item.no}`} /></td>
//                             <td className={tdCls}>
//                                 <Input
//                                     {...register(`checklist.enc_${item.no}`)}
//                                     placeholder="Enc. No."
//                                     className={readOnly ? "bg-white border-slate-200 text-xs h-7" : "text-xs h-7"}
//                                     readOnly={readOnly}
//                                 />
//                             </td>
//                             <td className={tdCls}><FileCell itemNo={item.no} /></td>
//                             <td className={tdCls}>
//                                 <Input
//                                     {...register(`checklist.remarks_${item.no}`)}
//                                     className={readOnly ? "bg-white border-slate-200 text-xs h-7" : "text-xs h-7"}
//                                     readOnly={readOnly}
//                                 />
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     const SubHeading = ({ children }) => (
//         <h4 className="text-sm font-bold text-gray-800 bg-gray-200 px-3 py-2 rounded mb-2 uppercase tracking-wide">
//             {children}
//         </h4>
//     );

//     return (
//         <div className="space-y-8">
//             <SectionTitle number="12" title="CHECKLIST" />

//             <div>
//                 <SubHeading>Administrative Requirements</SubHeading>
//                 <ChecklistTable items={adminItems} />
//             </div>

//             <div>
//                 <SubHeading>Proposal Related</SubHeading>
//                 <ChecklistTable items={proposalItems} />
//             </div>

//             <div>
//                 <SubHeading>Permission from Governing Authorities</SubHeading>
//                 <div className="overflow-x-auto">
//                     <table className="w-full border-collapse border border-gray-300 text-sm">
//                         <thead>
//                             <tr>
//                                 <th className={thCls + " w-10"}>S. No</th>
//                                 <th className={thCls}>Other Permissions</th>
//                                 <th className={thCls + " w-24"}>Required</th>
//                                 <th className={thCls + " w-24"}>Not Required</th>
//                                 <th className={thCls + " w-24"}>Received</th>
//                                 <th className={thCls + " w-32"}>Applied dd/mm/yy</th>
//                                 <th className={thCls + " w-44"}>EC Remarks</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {govItems.map(item => (
//                                 <tr key={item.no} className="bg-white">
//                                     <td className={tdCls + " text-center font-semibold"}>{item.no}</td>
//                                     <td className={tdCls}>{item.label}</td>
//                                     {["required", "notRequired", "received"].map(state => (
//                                         <td key={state} className={tdCls + " text-center"}>
//                                             <Controller
//                                                 name={`checklist.gov_${state}_${item.no}`}
//                                                 control={control}
//                                                 render={({ field }) => (
//                                                     <Checkbox
//                                                         checked={field.value || false}
//                                                         disabled={readOnly}
//                                                         onCheckedChange={(v) => field.onChange(v)}
//                                                     />
//                                                 )}
//                                             />
//                                         </td>
//                                     ))}
//                                     <td className={tdCls}>
//                                         <Input
//                                             type="date"
//                                             {...register(`checklist.govDate_${item.no}`)}
//                                             className={readOnly ? "bg-white border-slate-200 text-xs h-7" : "text-xs h-7"}
//                                             readOnly={readOnly}
//                                         />
//                                     </td>
//                                     <td className={tdCls}>
//                                         <Input
//                                             {...register(`checklist.govRemarks_${item.no}`)}
//                                             className={readOnly ? "bg-white border-slate-200 text-xs h-7" : "text-xs h-7"}
//                                             readOnly={readOnly}
//                                         />
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//                 <div className="text-xs text-gray-500 italic mt-2 space-y-1">
//                     <p>* For multicentre research.</p>
//                     <p>
//                         MTA — Material Transfer Agreement; CTRI — Clinical Trial Registry-India;
//                         DCGI — Drug Controller General of India; HMSC — Health Ministry's Screening Committee;
//                         NAC-SCRT — National Apex Committee for Stem Cell Research and Therapy;
//                         IC-SCR — Institutional Committee for Stem Cell Research;
//                         RCGM — Review Committee on Genetic Manipulation;
//                         GEAC — Genetic Engineering Approval Committee; BARC — Bhabha Atomic Research Centre.
//                     </p>
//                     <p className="text-red-600 font-semibold not-italic">
//                         * Mandatory items: 1 (Cover Letter), 2 (CV of Investigators), 14 (Detailed Protocol), 16 (PIS &amp; ICF), 18 (CRF / Questionnaire)
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ─────────────────────────────────────────────
// // Legacy alias — keeps existing parent imports working
// // ─────────────────────────────────────────────
// const SectionFForm = ({ onFileUpload, readOnly, hideFeeDocs = false }) => (
//     <SectionChecklist onFileUpload={onFileUpload} readOnly={readOnly} hideFeeDocs={hideFeeDocs} />
// );

// // ─────────────────────────────────────────────
// // EXPORTS
// // ─────────────────────────────────────────────
// export {
//     // Sections 1–5 (original names kept for backward compat)
//     SectionAForm,
//     SectionBForm,
//     SectionCForm,
//     SectionDForm,
//     SectionEForm,

//     // Sections 6–12
//     SectionBenefitsRisks,
//     SectionInformedConsent,
//     SectionStorageConfidentiality,
//     SectionPublicationIPR,
//     SectionDeclaration,
//     SectionChecklist,

//     // Legacy alias
//     SectionFForm,
// };


import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { calculateFee } from "../proposal.utils";
import api from "@/api/axios";

// ─────────────────────────────────────────────
// PDF HELPER
// ─────────────────────────────────────────────
const openPdfBase64 = async (e, documentUrl) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!documentUrl) {
        alert("No document data available.");
        return;
    }

    const previewWindow = window.open("about:blank", "_blank");
    try {
        let blob;
        if (documentUrl.startsWith("/api/proposals/")) {
            const response = await api.get(documentUrl.replace(/^\/api/, ""), { responseType: "blob" });
            blob = response.data;
        } else {
            const dataUriMatch = documentUrl.match(/^data:([^;,]+);base64,(.+)$/);
            const mimeType = dataUriMatch?.[1] || "application/pdf";
            let base64 = dataUriMatch?.[2] || documentUrl;
            base64 = base64.replace(/\s/g, "");
            while (base64.length % 4 !== 0) base64 += "=";

            const binary = window.atob(base64);
            const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
            blob = new Blob([bytes], { type: mimeType });
        }
        const objectUrl = URL.createObjectURL(blob);
        if (previewWindow) {
            previewWindow.location.href = objectUrl;
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        } else {
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `proposal-document-${Date.now()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
        }
    } catch (err) { 
        previewWindow?.close();
        console.error("PDF Open Error:", err);
        alert("Could not open this document. Please try uploading it again.");
    }
};

// ─────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────
const ro = (readOnly) => readOnly ? "bg-slate-50 text-slate-700 border-slate-200" : "";

const SectionHeading = ({ number, label }) => (
    <div className="border-b-2 border-blue-700 pb-2 mb-5">
        <h3 className="text-base font-bold text-blue-900 uppercase tracking-wide">
            {number}. {label}
        </h3>
    </div>
);

const Divider = () => <hr className="border-gray-200 my-6" />;

const FL = ({ children, required }) => (
    <Label className="text-sm font-medium text-gray-700 mb-1 block">
        {children}{required && <span className="text-red-500 ml-1">*</span>}
    </Label>
);

const RadioRow = ({ name, control, options, readOnly, vertical = false }) => {
    const { formState: { errors } } = useFormContext();
    const error = name.split('.').reduce((o, i) => o?.[i], errors);
    return (
        <Controller name={name} control={control} render={({ field }) => (
            <div className={`relative ${error ? "bg-red-50 border border-red-500 p-2 rounded-md" : ""}`}>
                <div className={`flex ${vertical ? "flex-col gap-2" : "flex-row flex-wrap gap-6"} mt-1`}>
                    {options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" value={opt} checked={field.value === opt}
                                onChange={() => !readOnly && field.onChange(opt)} disabled={readOnly}
                                name={field.name}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            {opt}
                        </label>
                    ))}
                </div>
                {error && <span className="absolute right-2 top-2 text-red-500">⚠</span>}
                {error && <p className="text-red-500 text-xs mt-1 font-medium">{error.message}</p>}
            </div>
        )} />
    );
};

const CheckGroup = ({ name, control, options, readOnly, cols = 1 }) => {
    const { formState: { errors } } = useFormContext();
    const error = name.split('.').reduce((o, i) => o?.[i], errors);
    return (
        <Controller name={name} control={control} render={({ field }) => (
            <div className={`relative ${error ? "bg-red-50 border border-red-500 p-2 rounded-md" : ""}`}>
                <div className={`grid grid-cols-1 ${cols === 2 ? "md:grid-cols-2" : ""} gap-2 mt-1`}>
                    {options.map(opt => (
                        <div key={opt} className="flex items-start gap-2">
                            <Checkbox
                                id={`${name}__${opt.replace(/[\s/()]+/g, "-")}`}
                                name={field.name}
                                checked={field.value?.includes(opt) || false}
                                disabled={readOnly}
                                onCheckedChange={c => field.onChange(c ? [...(field.value || []), opt] : (field.value || []).filter(t => t !== opt))}
                                className="mt-0.5"
                            />
                            <Label htmlFor={`${name}__${opt.replace(/[\s/()]+/g, "-")}`} className="text-sm cursor-pointer leading-snug">{opt}</Label>
                        </div>
                    ))}
                </div>
                {error && <span className="absolute right-2 top-2 text-red-500">⚠</span>}
                {error && <p className="text-red-500 text-xs mt-1 font-medium">{error.message}</p>}
            </div>
        )} />
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION A  —  1. ADMINISTRATIVE DETAILS  +  2. FUNDING DETAILS AND BUDGET
// ═══════════════════════════════════════════════════════════════════════════════
const SectionAForm = ({ readOnly }) => {
    const { register, control, formState: { errors } } = useFormContext();
    return (
        <div className="space-y-0">

            {/* ── Header instruction ── */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 leading-relaxed mb-6">
                <strong>General Instructions:</strong> a) Tick one or more options as applicable. Mark NA if not applicable.&nbsp;&nbsp;b) Attach additional sheets if required.
            </div>

            {/* ── Type of Research preamble ── */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
                <FL>Type of Research (tick one or more as applicable)</FL>
                <CheckGroup name="sectionA.typeOfResearch" control={control} readOnly={readOnly} cols={2}
                    options={[
                        "PG Student Dissertation Research", 
                        "PG Student Non-Dissertation Research", 
                        "UG Student Research", 
                        "Faculty Research", 
                        "Clinical Trial", 
                        "Research from Other Institute",
                        "Other Academic (DNB, DM, Nursing, PhD Research)"
                    ]}
                />
            </div>

            {/* ════ 1. ADMINISTRATIVE DETAILS ════ */}
            <SectionHeading number="1" label="ADMINISTRATIVE DETAILS" />

            <div className="space-y-5">
                <div>
                    <FL>(a) Name of Organization</FL>
                    <Input {...register("sectionA.nameOfOrganization")} placeholder="Name of Organization" className={ro(readOnly)} readOnly={readOnly} />
                    {errors.sectionA?.nameOfOrganization && <p className="text-red-500 text-xs mt-1">{errors.sectionA.nameOfOrganization.message}</p>}
                </div>

                <div>
                    <FL>(b) Name of Ethics Committee</FL>
                    <Input {...register("sectionA.nameOfEthicsCommittee")} placeholder="Name of Ethics Committee" className={ro(readOnly)} readOnly={readOnly} />
                </div>

                <div>
                    <FL>(c) Name of Principal Investigator</FL>
                    <Input {...register("sectionA.nameOfPrincipalInvestigator")} placeholder="Name of Principal Investigator" className={ro(readOnly)} readOnly={readOnly} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <FL>(d) Department / Division</FL>
                        <Input {...register("sectionA.departmentDivision")} placeholder="Department / Division" className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                    <div>
                        <FL>(e) Date of Submission</FL>
                        <Input type="date" {...register("sectionA.dateOfSubmission")} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                <div>
                    <FL>(f) Type of Review Requested</FL>
                    <RadioRow name="sectionA.typeOfReviewRequested" control={control} readOnly={readOnly}
                        options={["Exemption from Review", "Expedited Review", "Full Committee Review"]} />
                    {errors.sectionA?.typeOfReviewRequested && <p className="text-red-500 text-xs mt-1">{errors.sectionA.typeOfReviewRequested.message}</p>}
                </div>

                <div>
                    <FL>(g) Title of the Study</FL>
                    <Textarea {...register("sectionA.titleOfTheStudy")} rows={3} placeholder="Full title of the study" className={ro(readOnly)} readOnly={readOnly} />
                    {errors.sectionA?.titleOfTheStudy && <p className="text-red-500 text-xs mt-1">{errors.sectionA.titleOfTheStudy.message}</p>}
                </div>

                <div>
                    <FL>Acronym / Short Title (If any)</FL>
                    <Input {...register("sectionA.acronymShortTitle")} placeholder="Acronym / Short Title" className={ro(readOnly)} readOnly={readOnly} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <FL>(h) Protocol Number (If any)</FL>
                        <Input {...register("sectionA.protocolNumber")} placeholder="Protocol Number" className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                    <div>
                        <FL>Version Number</FL>
                        <Input {...register("sectionA.versionNumber")} placeholder="Version Number" className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                {/* (i) Investigators table */}
                <InvestigatorsTable readOnly={readOnly} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <FL>(j)(i) No. of studies where applicant is Principal Investigator at time of submission</FL>
                        <Input type="number" {...register("sectionA.piStudiesCount", { valueAsNumber: true })} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                    <div>
                        <FL>(j)(ii) No. of studies where applicant is Co-Investigator at time of submission</FL>
                        <Input type="number" {...register("sectionA.coPiStudiesCount", { valueAsNumber: true })} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                <div>
                    <FL>(k) Duration of the Study</FL>
                    <Input {...register("sectionA.durationOfStudy")} placeholder="e.g. 12 months" className={ro(readOnly)} readOnly={readOnly} />
                </div>
            </div>

            <Divider />

            {/* ════ 2. FUNDING DETAILS AND BUDGET ════ */}
            <SectionHeading number="2" label="FUNDING DETAILS AND BUDGET" />

            <div className="space-y-5">
                <div>
                    <FL>(a) Total Estimated Budget for Site</FL>
                    <Input type="number" {...register("sectionB.totalEstimatedBudget", { valueAsNumber: true })} className={ro(readOnly)} readOnly={readOnly} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[["At Site", "budgetAtSite"], ["In India", "budgetInIndia"], ["Globally", "budgetGlobally"]].map(([lbl, k]) => (
                        <div key={k}>
                            <FL>{lbl}</FL>
                            <Input type="number" {...register(`sectionB.${k}`, { valueAsNumber: true })} className={ro(readOnly)} readOnly={readOnly} />
                        </div>
                    ))}
                </div>

                <div>
                    <FL>(b) Funding Source (tick as applicable)</FL>
                    <CheckGroup name="sectionB.fundingSource" control={control} readOnly={readOnly}
                        options={["Self-Funding", "Institutional Funding", "Funding Agency (Specify)"]} />
                    <div className="mt-3">
                        <FL>Funding Agency / Sponsor Details</FL>
                        <Textarea {...register("sectionB.sponsorDetails")} rows={2} placeholder="Specify name and details" className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Investigators sub-table
const InvestigatorsTable = ({ readOnly }) => {
    const { register, control } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name: "sectionA.investigators" });
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <FL>(i) Details of Investigators</FL>
                {!readOnly && (
                    <Button type="button" size="sm" variant="outline"
                        onClick={() => append({ role: "", designation: "", department: "", address: "" })}>
                        + Add Investigator
                    </Button>
                )}
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold w-36">Role</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Designation &amp; Qualification</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Department &amp; Institution</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Address for Communication (Mobile No &amp; Email ID)</th>
                            {!readOnly && <th className="border border-gray-300 px-2 py-2 w-8" />}
                        </tr>
                    </thead>
                    <tbody>
                        {fields.length === 0 && (
                            <tr><td colSpan={readOnly ? 4 : 5} className="border border-gray-300 px-3 py-4 text-center text-gray-400 italic text-xs">
                                {readOnly ? "No investigators added." : "Click '+ Add Investigator' to begin."}
                            </td></tr>
                        )}
                        {fields.map((f, idx) => (
                            <tr key={f.id}>
                                {["role", "designation", "department", "address"].map(key => (
                                    <td key={key} className="border border-gray-300 px-1 py-1">
                                        <Input {...register(`sectionA.investigators.${idx}.${key}`)} readOnly={readOnly} className={readOnly ? "bg-white border-0 text-xs" : "text-xs"} />
                                    </td>
                                ))}
                                {!readOnly && (
                                    <td className="border border-gray-300 px-1 py-1 text-center">
                                        <button type="button" onClick={() => remove(idx)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION B  —  3. OVERVIEW OF RESEARCH  +  4. METHODOLOGY
// ═══════════════════════════════════════════════════════════════════════════════
const SectionBForm = ({ readOnly }) => {
    const { register, control } = useFormContext();
    return (
        <div className="space-y-0">

            {/* ════ 3. OVERVIEW OF RESEARCH ════ */}
            <SectionHeading number="3" label="OVERVIEW OF RESEARCH" />

            <div className="space-y-5">
                <div>
                    <FL>(a) Lay Summary (within 300 words)</FL>
                    <p className="text-xs text-gray-500 mb-1 italic">Summarize in the simplest possible way such that a person with no prior knowledge of the subject can easily understand it.</p>
                    <Textarea {...register("sectionC.laySummary")} rows={8} className={ro(readOnly)} readOnly={readOnly} />
                </div>

                <div>
                    <FL>(b) Type of Study</FL>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-1">
                        <CheckGroup name="sectionC.typeOfStudy" control={control} readOnly={readOnly}
                            options={["Basic Sciences", "Retrospective", "Prospective", "Qualitative", "Quantitative", "Mixed Method", "Any Others (Specify)"]} />
                        <CheckGroup name="sectionC.typeOfStudy" control={control} readOnly={readOnly}
                            options={["Clinical", "Epidemiological / Public Health", "Socio-behavioral", "Biological Samples / Data", "Cross Sectional", "Case Control", "Cohort", "Systematic Review"]} />
                    </div>
                    <div className="mt-3">
                        <FL>If "Any Others", please specify</FL>
                        <Input {...register("sectionC.typeOfStudyOther")} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>
            </div>

            <Divider />

            {/* ════ 4. METHODOLOGY ════ */}
            <SectionHeading number="4" label="METHODOLOGY" />

            <div className="space-y-5">
                {/* (a) Sample Size */}
                <div>
                    <FL>(a) Sample Size / Number of Participants (as applicable)</FL>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
                        {[["At Site", "sampleSizeAtSite"], ["In India", "sampleSizeInIndia"], ["Globally", "sampleSizeGlobally"]].map(([lbl, k]) => (
                            <div key={k}>
                                <FL>{lbl}</FL>
                                <Input {...register(`sectionD.${k}`)} className={ro(readOnly)} readOnly={readOnly} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div><FL>Control Group</FL><Input {...register("sectionD.controlGroup")} className={ro(readOnly)} readOnly={readOnly} /></div>
                        <div><FL>Study Group</FL><Input {...register("sectionD.studyGroup")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    </div>
                    <FL>Justification for the sample size chosen (100 words)</FL>
                    <p className="text-xs text-gray-500 mb-1 italic">In case of qualitative study, mention the criteria used for calculation.</p>
                    <Textarea {...register("sectionD.sampleSizeJustification")} rows={5} className={ro(readOnly)} readOnly={readOnly} />
                </div>

                {/* (b) External lab */}
                <div className="border-t pt-4">
                    <FL>(b) Is there an external laboratory / outsourcing involved for investigations?</FL>
                    <RadioRow name="sectionD.externalLabInvolved" control={control} readOnly={readOnly} options={["Yes", "No", "NA"]} />
                </div>

                {/* (c) Scientific quality */}
                <div className="border-t pt-4">
                    <FL>(c) How was the scientific quality of the study assessed?</FL>
                    <CheckGroup name="sectionD.scientificQualityAssessment" control={control} readOnly={readOnly}
                        options={["Independent External Review", "Review by Sponsor / Funder", "Review within PI's Institution (Department review for PG student)", "No Review"]} />
                    <div className="mt-3">
                        <FL>Date of Review</FL>
                        <Input type="date" {...register("sectionD.reviewDate")} className={ro(readOnly) + " w-48"} readOnly={readOnly} />
                    </div>
                    <div className="mt-3">
                        <FL>Comments in Review Meeting, if any (100 words)</FL>
                        <Textarea {...register("sectionD.reviewComments")} rows={4} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION C  —  5. RECRUITMENT  +  6. BENEFITS & RISKS  +  7. INFORMED CONSENT
//              +  8. PAYMENT/COMPENSATION  +  9. STORAGE & CONFIDENTIALITY
// ═══════════════════════════════════════════════════════════════════════════════
const SectionCForm = ({ readOnly }) => {
    const { register, control } = useFormContext();
    return (
        <div className="space-y-0">

            {/* ════ 5. RECRUITMENT AND RESEARCH PARTICIPANTS ════ */}
            <SectionHeading number="5" label="RECRUITMENT AND RESEARCH PARTICIPANTS" />

            <div className="space-y-5">
                {/* (a) Participants */}
                <div>
                    <FL>(a) Type of Participants in the Study</FL>
                    <CheckGroup name="sectionE.participantTypes" control={control} readOnly={readOnly} cols={2}
                        options={["Healthy Volunteers", "Patients", "Vulnerable Persons / Special Groups", "Others (Specify)"]} />
                    <div className="mt-2"><FL>If "Others", specify</FL><Input {...register("sectionE.participantTypesOther")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    <div className="mt-3"><FL>Who will do the Recruitment?</FL><Input {...register("sectionE.whoWillRecruit")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    <div className="mt-3">
                        <FL>Participant Recruitment Methods Used</FL>
                        <CheckGroup name="sectionE.recruitmentMethods" control={control} readOnly={readOnly} cols={2}
                            options={["Posters / Leaflets / Letters", "TV / Radio Ads / Social Media / Institution Website", "Patient / Family / Friends / Visiting Hospitals", "Telephone", "Others (Specify)"]} />
                        <div className="mt-2"><FL>If "Others", specify</FL><Input {...register("sectionE.recruitmentMethodsOther")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    </div>
                </div>

                {/* (b) Vulnerable persons */}
                <div className="border-t pt-4 space-y-4">
                    <div>
                        <FL>(b)(i) Will there be vulnerable persons / special groups involved?</FL>
                        <RadioRow name="sectionE.vulnerablePersonsInvolved" control={control} readOnly={readOnly} options={["Yes", "No", "NA"]} />
                    </div>
                    <div>
                        <FL>(b)(ii) If yes, type of vulnerable persons / special groups</FL>
                        <CheckGroup name="sectionE.vulnerableGroupTypes" control={control} readOnly={readOnly} cols={2}
                            options={["Children under 18 yrs", "Pregnant or Lactating Women", "Differently Abled (Mental / Physical)", "Employees / Students / Nurses / Staff", "Elderly", "Institutionalized", "Economically and Socially Disadvantaged", "Refugees / Migrants / Homeless", "Terminally Ill (Stigmatized or Rare Diseases)", "Any Other (Specify)"]} />
                    </div>
                    <div>
                        <FL>(b)(iii) Provide justification for inclusion / exclusion</FL>
                        <Textarea {...register("sectionE.vulnerableGroupJustification")} rows={3} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                    <div>
                        <FL>(b)(iv) Are there any additional safeguards to protect research participants?</FL>
                        <Textarea {...register("sectionE.additionalSafeguards")} rows={3} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>
            </div>

            <Divider />

            {/* ════ 6. BENEFITS AND RISKS ════ */}
            <SectionHeading number="6" label="BENEFITS AND RISKS" />

            <div className="space-y-5">
                <div>
                    <FL>(a)(i) Are there any anticipated physical / social / psychological discomforts / risk to participants?</FL>
                    <RadioRow name="sectionBR.hasRisks" control={control} readOnly={readOnly} options={["Yes", "No"]} />
                    <div className="mt-4">
                        <FL>If yes, categorize the level of risk</FL>
                        <RadioRow name="sectionBR.riskLevel" control={control} readOnly={readOnly} vertical
                            options={["Less than Minimal Risk", "Minimal Risk", "Minor Increase over Minimal Risk or Low Risk", "More than Minimal Risk or High Risk"]} />
                    </div>
                    {/* Risk reference table */}
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 px-2 py-2 w-10 text-center">Sr.</th>
                                    <th className="border border-gray-300 px-2 py-2 w-48">Type of Risk</th>
                                    <th className="border border-gray-300 px-2 py-2">Examples</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["1.", "Less than Minimal Risk", "Research on anonymous or non-identified data/samples, data available in the public domain, meta-analysis, etc."],
                                    ["2.", "Minimal Risk", "Research involving routine questioning or history taking, observing, physical examination, chest X-ray, obtaining body fluids without invasive intervention, such as hair, saliva or urine samples, etc."],
                                    ["3.", "Minor Increase over Minimal Risk or Low Risk", "Routine research on children and adolescents; research on persons incapable of giving consent, drawing a small sample of blood for testing; trying a new diagnostic technique in pregnant and breastfeeding women, etc. Use of personal identifiable data in research."],
                                    ["4.", "More than Minimal Risk or High Risk", "Research involving any interventional study using a drug, device or invasive procedure such as lumbar puncture, lung or liver biopsy, endoscopic procedure, intravenous sedation for diagnostic procedures, etc."],
                                ].map(([n, t, e]) => (
                                    <tr key={n}>
                                        <td className="border border-gray-300 px-2 py-1.5 text-center align-top">{n}</td>
                                        <td className="border border-gray-300 px-2 py-1.5 font-semibold align-top">{t}</td>
                                        <td className="border border-gray-300 px-2 py-1.5 align-top leading-relaxed">{e}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <FL>(a)(ii) Describe the Risk Management Strategy</FL>
                        <Textarea {...register("sectionBR.riskManagementStrategy")} rows={3} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                    <FL>(b) What are the potential benefits from the study?</FL>
                    {[["For the Participant", "sectionBR.benefitsForParticipant"], ["For the Society / Community", "sectionBR.benefitsForSociety"], ["For Improvement in Science", "sectionBR.benefitsForScience"]].map(([lbl, k]) => (
                        <div key={k}><FL>{lbl}</FL><Textarea {...register(k)} rows={2} className={ro(readOnly)} readOnly={readOnly} /></div>
                    ))}
                    <div>
                        <FL>Please describe how the benefits justify the risks</FL>
                        <Textarea {...register("sectionBR.benefitsJustifyRisks")} rows={3} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <FL>(c) Are adverse events expected in the study?</FL>
                    <RadioRow name="sectionBR.adverseEventsExpected" control={control} readOnly={readOnly} options={["Yes", "No", "NA"]} />
                </div>

                <div className="border-t pt-4">
                    <FL>(d) Are reporting procedures and management strategies described in the study?</FL>
                    <RadioRow name="sectionBR.reportingProceduresDescribed" control={control} readOnly={readOnly} options={["Yes", "No"]} />
                    <div className="mt-2"><FL>If Yes, Specify</FL><Textarea {...register("sectionBR.reportingProceduresDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} /></div>
                </div>
            </div>

            <Divider />

            {/* ════ 7. INFORMED CONSENT ════ */}
            <SectionHeading number="7" label="INFORMED CONSENT" />

            <div className="space-y-5">
                <div>
                    <FL>(a) Are you seeking waiver of consent? If yes, please specify reasons and skip to item no. 8</FL>
                    <RadioRow name="sectionIC.waiverOfConsent" control={control} readOnly={readOnly} options={["Yes", "No"]} />
                    <div className="mt-2"><FL>If Yes, specify reasons</FL><Textarea {...register("sectionIC.waiverReason")} rows={2} className={ro(readOnly)} readOnly={readOnly} /></div>
                </div>

                <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <FL>(b) Version Number and Date of PIS</FL>
                        <Input {...register("sectionIC.pisVersionDate")} placeholder="e.g. Version 1.0, 01-01-2024" className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                    <div>
                        <FL>Version Number and Date of ICF</FL>
                        <Input {...register("sectionIC.icfVersionDate")} placeholder="e.g. Version 1.0, 01-01-2024" className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <FL>(c) Type of Consent Planned For</FL>
                    <CheckGroup name="sectionIC.consentTypes" control={control} readOnly={readOnly} cols={2}
                        options={["Signed Consent", "Verbal / Oral Consent", "Witnessed Consent", "Audio-Video (AV) Consent", "Consent from LAR (If so, specify from whom)", "Other"]} />
                    <div className="mt-2"><FL>If LAR / Other, specify</FL><Input {...register("sectionIC.consentTypesOther")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    <div className="mt-4">
                        <FL>For Children</FL>
                        <CheckGroup name="sectionIC.consentForChildren" control={control} readOnly={readOnly}
                            options={["For children < 7 yrs — Parental / LAR Consent", "Verbal Assent from Minor (7–12 yrs) along with Parental Consent", "Written Assent from Minor (13–18 yrs) along with Parental Consent"]} />
                        <div className="mt-2"><FL>Specify (if other)</FL><Input {...register("sectionIC.consentForChildrenOther")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <FL>(d) Who will obtain the Informed Consent?</FL>
                    <CheckGroup name="sectionIC.consentObtainedBy" control={control} readOnly={readOnly} cols={2}
                        options={["PI / Co-I", "Nurse / Counselor", "Research Staff", "Other (Specify)"]} />
                    <div className="mt-2"><FL>Any tools to be used</FL><Input {...register("sectionIC.consentToolsUsed")} className={ro(readOnly)} readOnly={readOnly} /></div>
                </div>

                <div className="border-t pt-4">
                    <FL>(e) PIS and ICF available in</FL>
                    <CheckGroup name="sectionIC.pisLanguages" control={control} readOnly={readOnly}
                        options={["English", "Local Language", "Other (Specify)"]} />
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><FL>List the languages in which translations were done</FL><Input {...register("sectionIC.translationLanguages")} className={ro(readOnly)} readOnly={readOnly} /></div>
                        <div><FL>If translation has not been done, please justify</FL><Input {...register("sectionIC.noTranslationJustification")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <FL>(f) Consent requirements for previously stored samples if used in the study</FL>
                    <Textarea {...register("sectionIC.storedSamplesConsentDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
                </div>

                <div className="border-t pt-4">
                    <FL>(g) Elements contained in the PIS and ICF</FL>
                    <CheckGroup name="sectionIC.icfElements" control={control} readOnly={readOnly} cols={2}
                        options={["Simple Language", "Data / Sample Sharing", "Risks and Discomforts", "Need to Re-Contact", "Alternatives to Participation", "Confidentiality", "Right to Withdraw", "Storage of Samples", "Benefits", "Return of Research Results", "Purpose and Procedure", "Payment for Participation", "Compensation for Study Related Injury", "Statement that Consent is Voluntary", "Commercialization / Benefit Sharing", "Statement that Study Involves Research", "Use of Photographs / Identifying Data", "Contact Information of PI and Member Secretary of EC", "Others (Specify)"]} />
                    <div className="mt-2"><FL>If "Others", specify</FL><Input {...register("sectionIC.icfElementsOther")} className={ro(readOnly)} readOnly={readOnly} /></div>
                </div>
            </div>

            <Divider />

            {/* ════ 8. PAYMENT / COMPENSATION ════ */}
            <SectionHeading number="8" label="PAYMENT / COMPENSATION" />

            <div className="space-y-5">
                <div>
                    <FL>(c) Is there any reimbursement to the participants?</FL>
                    <RadioRow name="sectionE.reimbursement" control={control} readOnly={readOnly} options={["Yes", "No"]} />
                    <div className="mt-2 pl-2 space-y-2">
                        <p className="text-xs text-gray-600">If yes —</p>
                        <CheckGroup name="sectionE.reimbursementType" control={control} readOnly={readOnly} options={["Monetary", "Non-Monetary"]} />
                        <FL>Provide details</FL>
                        <Textarea {...register("sectionE.reimbursementDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <FL>(d) Are there any incentives to the participants?</FL>
                    <RadioRow name="sectionE.incentives" control={control} readOnly={readOnly} options={["Yes", "No"]} />
                    <div className="mt-2 pl-2 space-y-2">
                        <p className="text-xs text-gray-600">If yes —</p>
                        <CheckGroup name="sectionE.incentivesType" control={control} readOnly={readOnly} options={["Monetary", "Non-Monetary"]} />
                        <FL>Provide details</FL>
                        <Textarea {...register("sectionE.incentivesDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <FL>(e) Are there any participant recruitment fees / incentives provided to the PI / Institution?</FL>
                    <RadioRow name="sectionE.piRecruitmentFees" control={control} readOnly={readOnly} options={["Yes", "No"]} />
                    <div className="mt-2 pl-2 space-y-2">
                        <p className="text-xs text-gray-600">If yes —</p>
                        <CheckGroup name="sectionE.piRecruitmentFeesType" control={control} readOnly={readOnly} options={["Monetary", "Non-Monetary"]} />
                        <FL>Provide details</FL>
                        <Textarea {...register("sectionE.piRecruitmentFeesDetails")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>
            </div>

            <Divider />

            {/* ════ 9. STORAGE AND CONFIDENTIALITY ════ */}
            <SectionHeading number="9" label="STORAGE AND CONFIDENTIALITY" />

            <div className="space-y-5">
                <div>
                    <FL>(a) Identifying Information: Study Involves Samples / Data</FL>
                    <RadioRow name="sectionSC.studyInvolvesData" control={control} readOnly={readOnly} options={["Yes", "No", "NA"]} />
                    <div className="mt-3">
                        <FL>If Yes, specify type of identifying information</FL>
                        <CheckGroup name="sectionSC.identifyingInfoType" control={control} readOnly={readOnly}
                            options={["Anonymous / Unidentified", "Anonymized", "Reversibly Coded", "Irreversibly Coded", "Identifiable"]} />
                    </div>
                    <div className="mt-3">
                        <FL>If identifiers must be retained, what additional precautions will be taken?</FL>
                        <p className="text-xs text-gray-500 mb-1 italic">(e.g. data stored in a cabinet, password protected computer etc.)</p>
                        <Textarea {...register("sectionSC.identifierPrecautions")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><FL>(b) Who will be maintaining the data pertaining to the study?</FL><Input {...register("sectionSC.dataMaintainedBy")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    <div><FL>(c) Where will the data be analyzed and by whom?</FL><Input {...register("sectionSC.dataAnalyzedBy")} className={ro(readOnly)} readOnly={readOnly} /></div>
                    <div><FL>(d) For how long will the data be stored?</FL><Input {...register("sectionSC.dataStorageDuration")} className={ro(readOnly)} readOnly={readOnly} /></div>
                </div>

                <div className="border-t pt-4">
                    <FL>(e) Do you propose to use stored samples / data in future studies?</FL>
                    <RadioRow name="sectionSC.futureSamplesUse" control={control} readOnly={readOnly} options={["Yes", "No", "Maybe"]} />
                    <div className="mt-2">
                        <FL>If yes, explain how you might use stored material / data in the future</FL>
                        <Textarea {...register("sectionSC.futureSamplesExplanation")} rows={2} className={ro(readOnly)} readOnly={readOnly} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION D  —  10. PUBLICATION, BENEFIT SHARING AND IPR ISSUES
// ═══════════════════════════════════════════════════════════════════════════════
const SectionDForm = ({ readOnly }) => {
    const { register, control } = useFormContext();

    const items = [
        { label: "(a) Will the results of the study be reported and disseminated? If yes, specify.", radio: "sectionPub.resultsReported", details: "sectionPub.resultsReportedDetails", opts: ["Yes", "No", "NA"] },
        { label: "(b) Will you inform participants about the results of the study?", radio: "sectionPub.participantsInformed", opts: ["Yes", "No", "NA"] },
        { label: "(c) Are there any arrangements for continued provision of the intervention for participants, if effective, once the study has finished? If yes, describe in brief (Max 50 words).", radio: "sectionPub.continuedIntervention", details: "sectionPub.continuedInterventionDetails", opts: ["Yes", "No", "NA"] },
        { label: "(d) Is there any plan for post research benefit sharing with participants? If yes, specify.", radio: "sectionPub.benefitSharing", details: "sectionPub.benefitSharingDetails", opts: ["Yes", "No", "NA"] },
        { label: "(e) Is there any commercial value or a plan to patent / IPR issues? If yes, please provide details.", radio: "sectionPub.iprIssues", details: "sectionPub.iprIssuesDetails", opts: ["Yes", "No", "NA"] },
        { label: "(f) Do you have any additional information to add in support of the application, which is not included elsewhere in the form? If yes, provide details.", radio: "sectionPub.additionalInfo", details: "sectionPub.additionalInfoDetails", opts: ["Yes", "No"] },
    ];

    return (
        <div className="space-y-0">
            <SectionHeading number="10" label="PUBLICATION, BENEFIT SHARING AND IPR ISSUES" />
            <div className="space-y-5">
                {items.map((item, i) => (
                    <div key={i} className={i > 0 ? "border-t pt-4" : ""}>
                        <FL>{item.label}</FL>
                        <RadioRow name={item.radio} control={control} readOnly={readOnly} options={item.opts} />
                        {item.details && (
                            <div className="mt-2">
                                <Textarea {...register(item.details)} rows={2} placeholder="Specify details..." className={ro(readOnly)} readOnly={readOnly} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION E  —  11. DECLARATION
// ═══════════════════════════════════════════════════════════════════════════════
const SectionEForm = ({ readOnly }) => {
    const { register, control, watch } = useFormContext();

    const researchTypes = watch("sectionA.typeOfResearch") || [];
    const feeAmount = calculateFee(researchTypes);
    const paymentStatus = watch("sectionG.paymentStatus");
    const paymentMethod = watch("sectionG.paymentMethod");
    const transactionId = watch("sectionG.transactionId");
    const isVerified = watch("sectionG.isVerified");

    const declarations = [
        "I/We certify that the information provided in this application is complete and correct.",
        "I/We confirm that all investigators have approved the submitted version of proposal / related documents.",
        "I/We confirm that this study will be conducted in accordance with the latest ICMR National Ethical Guidelines for Biomedical and Health Research Involving Human Participants and other applicable regulations and guidelines.",
        "I/We confirm that this study will be conducted in accordance with the New Drugs and Clinical Trials Rules, 2019 amended from time to time, GCP guidelines and other applicable regulations and guidelines.",
        "I/We will comply with all policies and guidelines of the institute and affiliated / collaborating institutions where this study will be conducted.",
        "I/We will ensure that personnel performing this study are qualified, appropriately trained and will adhere to the provisions of the EC approved protocol.",
        "I/We declare that the expenditure in case of injury related to the study will be taken care of.",
        "I/We confirm that an undertaking of what will be done with the leftover samples is provided, if applicable.",
        "I/We confirm that we shall submit any protocol amendments, adverse events report, significant deviations from protocols, progress reports and a final report and also participate in any audit of the study if needed.",
        "I/We confirm that we will maintain accurate and complete records of all aspects of the study.",
        "I/We will protect the privacy of participants and assure confidentiality of data and biological samples.",
        "I/We hereby declare that I / any of the investigators, researchers and/or close relative(s), have no conflict of interest (Financial / Non-Financial) with the sponsor(s) and outcome of study.",
        "I/Ref confirm that all necessary government approvals will be obtained as per requirements wherever applicable.",
    ];

    const handleRazorpay = async () => {
        const event = new CustomEvent('triggerRazorpay', { detail: { feeAmount } });
        window.dispatchEvent(event);
    };

    return (
        <div className="space-y-6">
            <SectionHeading number="11" label="DECLARATION (Please tick as applicable)" />

            <div className="space-y-2">
                {declarations.map((text, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded border border-gray-200 hover:bg-gray-50">
                        <Controller name={`sectionDecl.decl_${idx}`} control={control}
                            render={({ field }) => (
                                <Checkbox id={`decl-${idx}`} checked={field.value || false} disabled={readOnly}
                                    onCheckedChange={v => field.onChange(v)} className="mt-0.5 flex-shrink-0" />
                            )} />
                        <Label htmlFor={`decl-${idx}`} className="text-sm cursor-pointer leading-relaxed">{text}</Label>
                    </div>
                ))}
            </div>

            <div className="border border-yellow-300 bg-yellow-50 rounded-2xl p-5">
                <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Conflict of Interest</p>
                <FL>I/We have the following conflict of interest (PI / Co-I) — list below if applicable:</FL>
                <Textarea {...register("sectionDecl.conflictOfInterestDetails")} rows={3}
                    placeholder={"1. ...\n2. ..."}
                    className={readOnly ? "bg-yellow-50 border-yellow-200" : "bg-white mt-2"} readOnly={readOnly} />
            </div>

            {/* Razorpay Payment in Section E - As Requested */}
            {feeAmount > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className={`p-6 rounded-[2rem] transition-all duration-500 ${isVerified ? 'bg-green-50 border border-green-100' : 'bg-blue-50 border border-blue-100'}`}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${isVerified ? 'bg-green-200 text-green-700' : 'bg-blue-600 text-white animate-pulse'}`}>
                                    {isVerified ? 'Payment Verified' : 'Action Required: Processing Fee'}
                                </span>
                                <h3 className="text-xl font-black text-gray-900">₹{feeAmount.toLocaleString()} <span className="text-xs font-medium text-gray-500 uppercase tracking-widest ml-2">Review Fee</span></h3>
                                <p className="text-xs text-gray-500 font-medium">Fee calculated based on research type(s)</p>
                            </div>

                            {!isVerified && !["Paid", "Under Verification"].includes(paymentStatus) && !readOnly && (
                                <Button 
                                    type="button" 
                                    onClick={handleRazorpay}
                                    className="group relative bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-6 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-3 transition-all active:scale-95"
                                >
                                    <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">Pay Securely with</p>
                                        <p className="text-sm font-black leading-none">Razorpay</p>
                                    </div>
                                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </Button>
                            )}

                            {isVerified && (
                                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-green-100">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Payment Success</p>
                                        <p className="text-xs font-bold text-gray-800">
                                            {paymentMethod === 'Razorpay' ? `Paid via Razorpay (ID: ${transactionId})` : 'Manual payment recorded'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION F  —  12. CHECKLIST  (Admin + Proposal Related only — no Gov Auth)
// ═══════════════════════════════════════════════════════════════════════════════
const SectionFForm = ({ onFileUpload, readOnly }) => {
    const { register, control } = useFormContext();

    // Required fields retain their legacy keys; display numbers shift after the inserted plagiarism report.
    const adminItems = [
        { no: 1, label: "Cover Letter", mandatory: true },
        { no: 2, label: "Brief CV of all Investigators", mandatory: true },
        { no: 3, label: "Good Clinical Practice (GCP) training of investigators in last 3 years", mandatory: false },
        { no: 4, label: "Department MOM of reviewing Synopsis (PG Research / PG Dissertation only)", mandatory: false },
        { no: 5, fieldNo: 20, label: "Plagiarism Report", mandatory: true },
        { no: 6, fieldNo: 5, label: "Basic Course in Biomedical Research (BCBR) Certification (For PG Students & Teachers Synopsis)", mandatory: false },
        { no: 7, fieldNo: 6, label: "EC Review Fee paid receipt (For PG Dissertation Synopsis)", mandatory: false },
        { no: 8, fieldNo: 7, label: "EC clearance of other centers *", mandatory: false },
        { no: 9, fieldNo: 8, label: "Agreement between collaborating partners *", mandatory: false },
        { no: 10, fieldNo: 9, label: "MTA between collaborating partners *", mandatory: false },
        { no: 11, fieldNo: 10, label: "Insurance policy / certificate", mandatory: false },
        { no: 12, fieldNo: 11, label: "Evidence of external laboratory credentials in case of an externally outsourced laboratory study — QA/QC certification", mandatory: false },
        { no: 13, fieldNo: 12, label: "Copy of contract or agreement signed with the sponsor or donor agency", mandatory: false },
        { no: 14, fieldNo: 13, label: "Provide all significant previous decisions (e.g. those leading to a negative decision or modified protocol) by other ECs / Regulatory authorities for proposed study (whether in same location or elsewhere) and modification(s) to protocol", mandatory: false },
    ];

    const proposalItems = [
        { no: 15, fieldNo: 14, label: "Copy of the detailed protocol", mandatory: true },
        { no: 16, fieldNo: 15, label: "Investigators Brochure (If applicable for drug / biological / device trials)", mandatory: false },
        { no: 17, fieldNo: 16, label: "Participant Information Sheet (PIS) and Participant Informed Consent Form (ICF) (English and translated)", mandatory: true },
        { no: 18, fieldNo: 17, label: "Assent form for minors (12–18 years) (English and Translated)", mandatory: false },
        { no: 19, fieldNo: 18, label: "Proforma / Questionnaire / Case Report Forms (CRF) / Interview guides / Guides for Focused Group Discussions (FGDs) (English and translated)", mandatory: true },
        { no: 20, fieldNo: 19, label: "Advertisement / material to recruit participants (fliers, posters etc.)", mandatory: false },
    ];

    const thCls = "border border-gray-300 bg-gray-100 px-2 py-2 text-xs font-semibold text-gray-800 text-center";
    const tdCls = "border border-gray-300 px-2 py-1.5 text-sm align-top";

    const YNA = ({ name }) => {
        const { formState: { errors }, trigger } = useFormContext();
        const error = name.split('.').reduce((o, i) => o?.[i], errors);
        const itemNo = Number(name.split("_").at(-1));
        const fileName = `checklistFiles.item_${itemNo}`;
        const options = itemNo === 20 ? ["Yes", "No"] : ["Yes", "No", "NA"];
        return (
            <Controller name={name} control={control} render={({ field }) => (
                <div className={`flex flex-col items-center relative p-1 rounded ${error ? "bg-red-50 border border-red-500" : ""}`}>
                    {error && <span className="absolute right-0 top-0 text-red-500 text-[10px]">⚠</span>}
                    <div className="flex gap-3 justify-center">
                        {options.map(opt => (
                            <label key={opt} className="flex flex-col items-center gap-0.5 text-xs cursor-pointer">
                                <input 
                                    type="radio" 
                                    value={opt} 
                                    checked={String(field.value || "").toUpperCase() === opt.toUpperCase()}
                                    onChange={() => {
                                        if (readOnly) return;
                                        field.onChange(opt);
                                        void trigger([name, fileName]);
                                    }}
                                    disabled={readOnly}
                                    name={field.name}
                                    className="h-4 w-4 text-blue-600 border-gray-300" 
                                />
                                <span className={readOnly ? "text-slate-900 font-medium" : ""}>{opt}</span>
                            </label>
                        ))}
                    </div>
                    {error && <p className="text-red-500 text-[10px] mt-1 pr-2 font-medium">{error.message}</p>}
                </div>
            )} />
        );
    };

    const FileCell = ({ itemNo }) => {
        const { formState: { errors }, watch } = useFormContext();
        const fk = `checklistFiles.item_${itemNo}`;
        const val = watch(fk);
        const answer = watch(`checklist.yn_${itemNo}`);
        const error = fk.split('.').reduce((o, i) => o?.[i], errors);
        
        return (
            <div className={`space-y-1 relative p-2 rounded ${error ? "bg-red-50 border border-red-500" : ""}`}>
                {!readOnly && answer !== "NA" && <input type="file" name={fk} accept=".pdf" onChange={e => onFileUpload && onFileUpload(e, fk)} className="text-xs w-full" />}
                {!readOnly && answer === "NA" && <span className="text-xs text-slate-500 italic">Not required (N/A)</span>}
                <div className="flex flex-col gap-1">
                    {(itemNo === 6 && (watch("sectionG.isVerified") || watch("sectionG.paymentStatus") === "Verified")) && (
                        <span className="text-green-600 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
                            <span className="text-sm">✓</span> Admin Verified
                        </span>
                    )}
                    {val ? (
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600 text-xs font-medium flex items-center gap-1">
                                <span className="text-lg">✓</span> Uploaded
                            </span>
                            {readOnly && (
                                <Button 
                                    onClick={e => openPdfBase64(e, val)} 
                                    variant="outline"
                                    size="sm"
                                    className="view-pdf-btn h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 text-xs font-semibold" 
                                    type="button"
                                >
                                    View PDF
                                </Button>
                            )}
                        </div>
                    ) : readOnly ? (itemNo === 6 && watch("sectionG.paymentMethod") === "Razorpay" ? null : <span className="text-xs text-gray-400 italic">No file uploaded</span>) : null}
                </div>
                {error && <span className="absolute right-1 top-1 text-red-500 text-[10px]">⚠</span>}
                {error && <p className="text-red-500 text-[10px] mt-1 font-medium">{error.message}</p>}
            </div>
        );
    };

    const Table = ({ items }) => {
        const { formState: { errors } } = useFormContext();
        return (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr>
                            <th className={thCls + " w-10"}>S. No</th>
                            <th className={thCls}>Items</th>
                            <th className={thCls + " w-32"}>Yes / No / NA <span className="text-red-500">*</span></th>
                            <th className={thCls + " w-28"}>Enclosure No</th>
                            <th className={thCls + " w-44"}>Upload Document <span className="text-red-500">*</span></th>
                            <th className={thCls + " w-44"}>EC Remarks (If applicable)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => {
                            const fieldNo = item.fieldNo ?? item.no;
                            const errYn = errors?.checklist?.[`yn_${fieldNo}`];
                            const errFile = errors?.checklistFiles?.[`item_${fieldNo}`];
                            const errEnc = errors?.checklist?.[`enc_${fieldNo}`];
                            const rowHasError = !!(errYn || errFile || errEnc);
                            
                            return (
                                <tr key={fieldNo} className={`${item.mandatory ? "bg-amber-50" : "bg-white"} ${rowHasError ? "bg-red-50 ring-2 ring-red-500" : ""}`}>
                                    <td className={tdCls + " text-center font-semibold"}>{item.no}</td>
                                    <td className={tdCls}>
                                        {item.label}
                                        {item.mandatory && <span className="ml-1 text-red-500 font-bold" title="Mandatory">*</span>}
                                    </td>
                                    <td className={tdCls}><YNA name={`checklist.yn_${fieldNo}`} /></td>
                                    <td className={tdCls}>
                                        <Input {...register(`checklist.enc_${fieldNo}`)} placeholder="Enc. No."
                                            className={readOnly ? "bg-white border-slate-200 text-xs h-7" : "text-xs h-7"} readOnly={readOnly} />
                                    </td>
                                    <td className={tdCls}><FileCell itemNo={fieldNo} /></td>
                                    <td className={tdCls}>
                                        <Input {...register(`checklist.remarks_${fieldNo}`)}
                                            className={readOnly ? "bg-white border-slate-200 text-xs h-7" : "text-xs h-7"} readOnly={readOnly} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-0">
            <SectionHeading number="12" label="CHECKLIST" />

            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-bold text-gray-800 bg-gray-200 px-3 py-2 rounded mb-2 uppercase tracking-wide">Administrative Requirements</h4>
                    <Table items={adminItems} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-800 bg-gray-200 px-3 py-2 rounded mb-2 uppercase tracking-wide">Proposal Related</h4>
                    <Table items={proposalItems} />
                </div>
            </div>

            <div className="text-xs text-gray-500 italic mt-3 space-y-1">
                <p>* For multicentre research. &nbsp; MTA — Material Transfer Agreement.</p>
                <p className="text-red-600 font-semibold not-italic">
                    * Mandatory items: 1 (Cover Letter), 2 (CV of Investigators), 5 (Plagiarism Report), 15 (Detailed Protocol), 17 (PIS &amp; ICF), 19 (CRF / Questionnaire)
                </p>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION G  —  FEES & PAYMENT DETAILS
// ═══════════════════════════════════════════════════════════════════════════════
const SectionGForm = ({ onFileUpload, readOnly }) => {
    const { watch, setValue, formState: { errors } } = useFormContext();
    const researchTypes = watch("sectionA.typeOfResearch") || [];
    const feeAmount = calculateFee(researchTypes);
    const paymentStatus = watch("sectionG.paymentStatus") || (feeAmount > 0 ? "Pending" : "Not Required");
    const paymentMethod = watch("sectionG.paymentMethod") || "None";
    const receiptUrl = watch("sectionG.receiptUrl");
    const transactionId = watch("sectionG.transactionId");

    // Bank Details
    const bankDetails = {
        accountName: "Dean, Dr. Vasantrao Pawar Medical College, Nashik",
        bankName: "IDBI Bank, M.G Road, Nashik",
        accountNumber: "0493104000083232", 
        ifscCode: "IBKL0000493",
        micrCode: "422259002"
    };

    const handleRazorpay = async () => {
        // Triggered by wizard for real integration
        const event = new CustomEvent('triggerRazorpay', { detail: { feeAmount } });
        window.dispatchEvent(event);
    };

    return (
        <div className="space-y-6">
            <SectionHeading number="G" label="FEES & PAYMENT DETAILS" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fee Summary Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Fee Summary</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-start text-sm">
                            <span className="text-gray-600">Research Type:</span>
                            <span className="font-semibold text-gray-900 text-right max-w-[200px]">
                                {researchTypes.length > 0 ? researchTypes.join(", ") : "Not selected"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-blue-100">
                            <span className="text-gray-600">Calculated Fee:</span>
                            <span className="text-lg font-bold text-blue-700">₹{feeAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-blue-100">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-sm
                                ${paymentStatus === 'Verified' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                  paymentStatus === 'Paid' || paymentStatus === 'Under Verification' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                                  paymentStatus === 'Not Required' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  'bg-red-100 text-red-700 border border-red-200'}`}>
                                {paymentStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Options (Only if fee > 0 and not already paid/verified) */}
                {feeAmount > 0 && !["Verified", "Paid", "Under Verification"].includes(paymentStatus) && !readOnly && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Payment Options</h4>
                        
                        <div className="flex flex-col gap-3">
                            <Button 
                                type="button" 
                                onClick={handleRazorpay}
                                className="bg-[#3395FF] hover:bg-[#2d84e0] text-white rounded-xl h-12 font-bold shadow-sm flex items-center justify-center gap-2 group transition-all"
                            >
                                <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                Pay with Razorpay
                            </Button>

                            <div className="relative py-2 flex items-center">
                                <div className="flex-grow border-t border-gray-100"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or Pay Manually</span>
                                <div className="flex-grow border-t border-gray-100"></div>
                            </div>

                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setValue("sectionG.showManual", !watch("sectionG.showManual"))}
                                className={`border-gray-200 text-gray-700 rounded-xl h-12 font-semibold transition-all ${watch("sectionG.showManual") ? 'bg-gray-100 ring-2 ring-gray-200' : 'hover:bg-gray-50'}`}
                            >
                                {watch("sectionG.showManual") ? 'Hide Bank Details' : 'View QR Code & Bank Details'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Verified / Paid Display / ReadOnly */}
                {((paymentStatus === 'Verified' || paymentStatus === 'Paid' || paymentStatus === 'Under Verification') || (readOnly && feeAmount > 0)) && (
                    <div className="flex flex-col items-center justify-center p-8 bg-green-50 border border-green-100 rounded-2xl text-center shadow-inner">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-green-100">
                            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h4 className="font-extrabold text-green-800 tracking-wide uppercase text-xs">Payment {paymentStatus}</h4>
                        <p className="text-xs text-green-600 mt-2 font-medium">
                            {paymentMethod === 'Razorpay' ? `Paid via Razorpay (ID: ${transactionId})` : 'Manual payment recorded'}
                        </p>
                    </div>
                )}

                {/* No Payment Required Display */}
                {feeAmount === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 bg-blue-50 border border-blue-100 rounded-2xl text-center shadow-inner">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h4 className="font-extrabold text-blue-800 tracking-wide uppercase text-xs">No Payment Required</h4>
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                            Based on your selected research type.
                        </p>
                    </div>
                )}
            </div>

            {/* Manual Payment Section Details */}
            {watch("sectionG.showManual") && feeAmount > 0 && !readOnly && paymentStatus !== 'Verified' && (
                <div className="mt-8 bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-600 w-1 h-6 rounded-full"></span>
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Bank Details</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    ["Account Name", bankDetails.accountName],
                                    ["Bank Name", bankDetails.bankName],
                                    ["Account Number", bankDetails.accountNumber],
                                    ["IFSC Code", bankDetails.ifscCode],
                                    ["MICR Code", bankDetails.micrCode],
                                ].map(([label, value]) => (
                                    <div key={label} className="space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{label}</span>
                                        <p className="text-xs font-bold text-gray-700 leading-snug">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-8 flex flex-col items-center justify-center border-l border-gray-100">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=deanmvpmc@idbi&pn=Dean%20Dr%20VPMC%20Nashik&am=${feeAmount}&cu=INR`} 
                                    alt="Payment QR Code" 
                                    className="w-40 h-40"
                                />
                            </div>
                            <div className="mt-6 text-center space-y-2">
                                <h5 className="text-xs font-bold text-gray-800">Scan with any UPI App</h5>
                                <p className="text-[10px] text-gray-500 font-medium max-w-[200px]">
                                    Complete the payment of ₹{feeAmount.toLocaleString()} and upload the receipt below.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Upload Section */}
            {feeAmount > 0 && (
                <div className="mt-10 border-t border-gray-100 pt-10">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                {receiptUrl ? (
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                                    </svg>
                                )}
                                {receiptUrl ? "View Receipt" : "Upload Fee Receipt"}
                            </h4>
                            <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-tight
                                ${receiptUrl ? 'bg-green-100 text-green-700' : (paymentMethod === 'Manual' || paymentStatus === 'Pending' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500')}`}>
                                {receiptUrl ? 'Uploaded' : (paymentMethod === 'Manual' ? 'Required' : 'Optional')}
                            </span>
                        </div>
                        
                        <div className={`group relative p-8 rounded-[2rem] border-2 border-dashed transition-all duration-300
                            ${receiptUrl ? 'border-green-200 bg-green-50/50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'}`}>
                            
                            {!readOnly && paymentStatus !== 'Verified' && !receiptUrl ? (
                                <div className="text-center space-y-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-700">Drop your receipt here</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">PDF, JPG, PNG or WebP up to 10 MB</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        onChange={e => onFileUpload && onFileUpload(e, "sectionG.receiptUrl")}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Button variant="outline" className="rounded-xl border-slate-200 text-xs px-6 h-9 pointer-events-none">
                                        Select File
                                    </Button>
                                </div>
                            ) : null}

                            {receiptUrl && (
                                <div className="flex items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-green-100 shadow-xl overflow-hidden">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 011 1v8a1 1 0 11-2 0V7a1 1 0 011-1zm3 0a1 1 0 011 1v8a1 1 0 11-2 0V7a1 1 0 011-1zm3 2a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-800 truncate max-w-[200px]">Payment_Receipt_{transactionId || 'Manual'}.pdf</p>
                                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter mt-0.5">Uploaded & Ready</p>
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={(e) => openPdfBase64(e, receiptUrl)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl text-xs h-9 px-5 shadow-md shadow-blue-200"
                                    >
                                        View
                                    </Button>
                                </div>
                            )}

                            {!receiptUrl && readOnly && (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-400 italic">No receipt document provided</p>
                                </div>
                            )}
                        </div>
                        {errors.sectionG?.receiptUrl && <p className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                            {errors.sectionG.receiptUrl.message}
                        </p>}
                    </div>
                </div>
            )}
            
            {/* Note for Workflow Control */}
            {feeAmount > 0 && paymentStatus !== 'Verified' && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-xl shrink-0">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Workflow Notice</h5>
                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                            {paymentStatus === "Paid" ? 
                             "Your payment receipt has been recorded. You can now PROCEED to final submission. Official verification by IEC Admin will occur post-submission." :
                             "Final submission will be enabled once your payment is completed (Razorpay) or a receipt is uploaded (Manual)."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export {
    SectionAForm,   // Section A: 1. Admin + 2. Funding
    SectionBForm,   // Section B: 3. Overview + 4. Methodology
    SectionCForm,   // Section C: 5. Recruitment + 6. Benefits & Risks + 7. Consent + 8. Payment + 9. Storage
    SectionDForm,   // Section D: 10. Publication & IPR
    SectionEForm,   // Section E: 11. Declaration
    SectionFForm,   // Section F: 12. Checklist
    SectionGForm,   // Section G: Fees & Payment
};