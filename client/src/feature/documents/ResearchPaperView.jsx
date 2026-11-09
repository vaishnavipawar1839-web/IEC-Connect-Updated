import React, { useCallback, useEffect } from "react";
import { Download, FileText, User, Building2 } from "lucide-react";
import { jsPDF } from "jspdf";
import * as htmlToImage from 'html-to-image';
import { toast } from "sonner";
import { PDFDocument } from 'pdf-lib';

const noop = () => {};

const ResearchPaperView = ({ proposal, autoDownload = false, onDownloadComplete = noop }) => {
    const protocolData = proposal?.sectionF?.detailedProtocol;
    const protocolUrl = protocolData
        ? protocolData.startsWith("data:")
            ? protocolData
            : `data:application/pdf;base64,${protocolData}`
        : null;

    const paperId = `research-paper-content-${proposal?._id}`;

    const { sectionA, createdAt } = proposal || {};

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const downloadPaper = useCallback(async () => {
        const element = document.getElementById(paperId);
        if (!element) {
            onDownloadComplete();
            return;
        }

        const downloadToast = toast.loading("Generating professional Research Document...");

        try {
            await document.fonts.ready;

            // Generate image at 2x density for crispness
            const dataUrl = await htmlToImage.toJpeg(element, {
                quality: 0.95,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            });

            // Initialize A4 Portrait PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => { img.onload = resolve; });

            // Calculate height in mm relative to A4 width
            const imgWidth = img.width;
            const imgHeight = img.height;
            const imgMmHeight = (imgHeight * pageWidth) / imgWidth;

            // Simple vertical slicing pagination
            let heightLeft = imgMmHeight;
            let position = 0;

            // Page 1
            pdf.addImage(dataUrl, 'JPEG', 0, position, pageWidth, imgMmHeight);
            heightLeft -= pageHeight;

            // Subsequent pages
            while (heightLeft > 0) {
                position = heightLeft - imgMmHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'JPEG', 0, position, pageWidth, imgMmHeight);
                heightLeft -= pageHeight;
            }

            const fileName = (proposal.title || "Research_Document")
                .replace(/[^a-z0-9]/gi, '_')
                .substring(0, 50);

            let finalPdfBytes = pdf.output('arraybuffer');

            // Merge with the protocol PDF if available
            if (proposal.sectionF?.detailedProtocol) {
                try {
                    const mergedPdf = await PDFDocument.create();
                    
                    const coverDoc = await PDFDocument.load(finalPdfBytes);
                    const coverPages = await mergedPdf.copyPages(coverDoc, coverDoc.getPageIndices());
                    coverPages.forEach(page => mergedPdf.addPage(page));

                    let base64String = proposal.sectionF.detailedProtocol;
                    if (base64String.includes(',')) base64String = base64String.split(',')[1];
                    const protocolBytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
                    
                    const protocolDoc = await PDFDocument.load(protocolBytes);
                    const protocolPages = await mergedPdf.copyPages(protocolDoc, protocolDoc.getPageIndices());
                    protocolPages.forEach(page => mergedPdf.addPage(page));

                    finalPdfBytes = await mergedPdf.save();
                } catch (mergeErr) {
                    console.error("PDF-lib merge failed:", mergeErr);
                    toast.error("Failed to append the protocol. Generating cover pages only.", { id: downloadToast });
                }
            }

            const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileName}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success("Document downloaded successfully", { id: downloadToast });
            onDownloadComplete();
        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Generation error. Use Browser Print for manual save.", { id: downloadToast });
            onDownloadComplete();
        }
    }, [onDownloadComplete, paperId, proposal]);

    useEffect(() => {
        if (autoDownload && proposal) {
            const timer = setTimeout(downloadPaper, 1500);
            return () => clearTimeout(timer);
        }
    }, [autoDownload, downloadPaper, proposal]);

    if (!proposal) return null;

    return (
        <div className="relative group w-full flex flex-col items-center pb-20">
            {/* Action Bar (Only visible in viewer, not PDF) */}
            <button
                id="document-pdf-download-btn"
                onClick={downloadPaper}
                className="fixed bottom-10 right-10 bg-slate-900 text-white p-5 rounded-full shadow-2xl hover:bg-black transition-all z-50 flex items-center gap-3 hover:scale-105 active:scale-95"
                title="Download as Official PDF"
            >
                <Download className="h-6 w-6" />
                <span className="font-sans font-bold uppercase text-xs tracking-widest whitespace-nowrap pr-2">
                    Download Official Copy
                </span>
            </button>

            {/* The actual paper cover content */}
            <div
                id={paperId}
                className="bg-white max-w-[1200px] w-full mt-4 mb-8 p-10 border border-slate-100 shadow-sm"
                style={{
                    color: '#000000',
                    backgroundColor: '#ffffff',
                    fontFamily: 'serif',
                    fontSize: '12px',
                    lineHeight: '1.5'
                }}
            >
                {/* Header */}
                <div className="text-center mb-8 border-b border-slate-900 pb-6">
                    <div className="uppercase tracking-[.3em] text-[10px] font-sans text-slate-500 mb-4 font-bold flex items-center justify-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {sectionA?.nameOfOrganization || "Institutional Ethics Committee"}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4 px-2 uppercase leading-snug">
                        {sectionA?.titleOfTheStudy || proposal.title || "RESEARCH PROPOSAL"}
                    </h1>
                    <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-[11px] font-sans font-semibold text-slate-700">
                        <span>IEC: {sectionA?.nameOfEthicsCommittee || "N/A"}</span>
                        <span>CERTIFIED: {formatDate(createdAt)}</span>
                        <span>PROTOCOL NO: {sectionA?.protocolNumber || "N/A"}</span>
                    </div>
                </div>

                <div className="space-y-10 px-4">
                    {/* Basic Research Details */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                            <FileText className="h-5 w-5 text-slate-800" />
                            <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900">
                                Basic Research Details
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 font-sans">
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Acronym / Short Title</span>
                                <span className="text-slate-900 font-medium text-sm">{sectionA?.acronymShortTitle || "N/A"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Type of Research</span>
                                <span className="text-slate-900 font-medium text-sm">{sectionA?.typeOfResearch?.join(', ') || "N/A"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Type of Project</span>
                                <span className="text-slate-900 font-medium text-sm">{sectionA?.typeOfProject || "N/A"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Type of Review Requested</span>
                                <span className="text-slate-900 font-medium text-sm">{sectionA?.typeOfReviewRequested || "N/A"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Duration of the Study</span>
                                <span className="text-slate-900 font-medium text-sm">{sectionA?.durationOfStudy || "N/A"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Submission Date</span>
                                <span className="text-slate-900 font-medium text-sm">{formatDate(sectionA?.dateOfSubmission)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Investigators Information */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                            <User className="h-5 w-5 text-slate-800" />
                            <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900">
                                Investigators Information
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 font-sans bg-slate-50 p-6 rounded border border-slate-100">
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Principal Investigator</span>
                                <span className="text-slate-900 font-bold text-base">{sectionA?.nameOfPrincipalInvestigator || "N/A"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Department / Division</span>
                                <span className="text-slate-900 font-medium text-sm">{sectionA?.departmentDivision || "N/A"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Studies as PI</span>
                                <span className="text-slate-900 font-medium text-sm">{sectionA?.piStudiesCount ?? "0"}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Studies as Co-PI</span>
                                <span className="text-slate-900 font-medium text-sm">{sectionA?.coPiStudiesCount ?? "0"}</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-200 text-center flex flex-col items-center">
                    <div className="text-[10px] font-sans text-slate-400 uppercase tracking-widest font-bold">
                        Official Archive Copy • Reference: {proposal._id.toString().toUpperCase()}
                    </div>
                </div>
            </div>

            {/* In-Browser Protocol Viewer (Not captured by htmlToImage) */}
            {protocolUrl && !autoDownload && (
                <div className="w-full max-w-[1200px] mt-8 bg-white border border-slate-200 shadow-sm p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-4">
                        <FileText className="h-6 w-6 text-slate-800" />
                        <h2 className="font-sans font-bold text-lg uppercase tracking-wider text-slate-900">
                            Copy of Protocol
                        </h2>
                    </div>
                    <iframe
                        src={protocolUrl}
                        className="w-full h-[1000px] border-none rounded-lg"
                        title="Copy of Protocol"
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default ResearchPaperView;

