import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const fileOrUrlToBase64 = (fileOrUrl) => {
    return new Promise((resolve) => {
        if (!fileOrUrl) {
            return resolve(null);
        }
        if (typeof fileOrUrl === 'string') {
            fetch(fileOrUrl)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(blob);
                })
                .catch(() => resolve(null));
        } else {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(fileOrUrl);
        }
    });
};

export const generateAndDownloadPdf = async (formData, subjects, entranceMarks, hasTakenEntrance) => {
    function toSentenceCase(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function toTitleCase(str) {
        if (!str) return "";
        return str
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    const userDate = prompt(
        "Enter the date for the document (DD/MM/YYYY):",
        new Date().toLocaleDateString('en-GB')
    );
    console.log(formData.place)

    if (!userDate) {
        try {
            toast.error("PDF generation cancelled.");
        } catch (e) {
            console.error(`PDF Generation cancelled: ${e}`);
        }
        return;
    }

    const doc = new jsPDF();

    const [photoBase64, parentSignBase64, applicantSignBase64] = await Promise.all([
        fileOrUrlToBase64(formData.photo),
        fileOrUrlToBase64(formData.parentSignature),
        fileOrUrlToBase64(formData.applicantSignature),
    ]);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageCenterX = pageWidth / 2;

    // --- Page 1: Personal & Academic Prefaces (Items 1 - 20) ---
    // This page remains unchanged
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Page 1 Border
    const headerTextX = 37;
    doc.addImage('/mgm_logo.png', 'PNG', 18, 17, 15, 20);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('MGM COLLEGE OF ENGINEERING & TECHNOLOGY', headerTextX, 23);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('MGM Technological campus, Pampakuda P.O, Ernakulam-686667, Kerala', headerTextX, 29);
    doc.text('Approved by AICTE and Affiliated to APJ Abdul Kalam Technological University, Kerala', headerTextX, 35);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('APPLICATION FOR ADMISSION TO B.TECH DEGREE COURSE 2025-2026', pageCenterX, 45, { align: 'center' });
    doc.text('UNDER GOVERNMENT / MANAGEMENT / NRI QUOTA', pageCenterX, 50, { align: 'center' });
    doc.text(`Application No: ${formData.appId || ''}`, 20, 65);

    if (photoBase64) {
        doc.addImage(photoBase64, 'JPEG', 155, 50, 25, 32);
    } else {
        doc.rect(155, 57, 25, 32);
        doc.text("Photo", 167.5, 73, { align: 'center' });
    }
    const preferencesText = `1. ${formData.preference1 || ''}\n2. ${formData.preference2 || ''}\n3. ${formData.preference3 || ''}`;

    const personalInfoBody = [
        ['1', 'Name of the Candidate', formData.candidateName.toUpperCase() || ''],
        ['2', 'Permanent Address', toTitleCase(formData.permanentAddress).replace(/\n+/g, " ").trim() || ''],
        ['3', 'Address For Communication', toTitleCase(formData.communicationAddress).replace(/\n+/g, " ").trim() || ''],
        ['4', 'Email', formData.email.toLowerCase() || ''],
        ['5', 'Date of Birth', formData.dateOfBirth || ''],
        ['6', 'Age', formData.age || ''],
        ['7', 'Gender', toSentenceCase(formData.gender) || ''],
        ['8', 'Nationality', toSentenceCase(formData.nationality) || ''],
        ['9', 'Religion', toSentenceCase(formData.religion) || ''],
        ['10', 'Community', toTitleCase(formData.community) || ''],
        ['11', 'Category', formData.category.toUpperCase() || ''],
        ['12', 'Blood Group', toSentenceCase(formData.bloodGroup) || ''],
        ['13', 'Aadhaar Number', formData.aadhaarNumber || ''],
        ["14(a)", "Father's Name", toTitleCase(formData.fatherName) || ''],
        ['14(b)', 'Occupation', toTitleCase(formData.fatherOccupation) || ''],
        ['14(c)', 'Mobile No', formData.fatherMobile || ''],
        ["15(a)", "Mother's Name", toTitleCase(formData.motherName) || ''],
        ['15(b)', 'Occupation', toTitleCase(formData.motherOccupation) || ''],
        ['15(c)', 'Mobile No', formData.motherMobile || ''],
        ['16', 'Annual Family Income', formData.annualIncome || ''],
        ["17(a)", "Guardian's Name", toTitleCase(formData.guardianName) || ''],
        ['17(b)', 'Relation', toSentenceCase(formData.guardianRelation) || ''],
        ['17(c)', 'Mobile No', formData.guardianMobileNumber || ''],
        ['18', 'Order of preference of branches offered', toTitleCase(preferencesText)],
        ['19', 'Name of the Institution last studied', toTitleCase(formData.lastInstitution) || ''],
        ['20', 'Board of Study (+2)', formData.boardOfStudy.toUpperCase() || ''],
    ];

    autoTable(doc, {
        startY: 80,
        body: personalInfoBody,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50 } },
    });


    // --- Page 2: All Mark Details (Items 21 - 24) ---
    doc.addPage();
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Page 2 Border

    autoTable(doc, {
        startY: 20,
        head: [['21', 'Details of Marks secured in the plus two examination']],
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        theme: 'grid',
    });

    const subjectTableBody = subjects.map(subj => [
        toSentenceCase(subj.name) || '', subj.markObtained || '', subj.maxMark || '', toTitleCase(subj.grade) || '',
    ]);

    autoTable(doc, {
        head: [['Subject', 'Mark Obtained', 'Maximum Marks', 'Grade']],
        body: subjectTableBody,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: 0 },
        styles: { fontSize: 9 },
    });

    autoTable(doc, {
        theme: 'grid',
        styles: { fontSize: 9, fontStyle: 'bold' },
        body: [
            [`Grand Total: ${formData.grandTotal}`, `Total Percentage: ${formData.totalPercentage}`],
            [`Total PCM: ${formData.totalPCM}`, `PCM Percentage: ${formData.pcmPercentage}`],
        ],
        columnStyles: { 0: { halign: 'right', cellPadding: 2 }, 1: { halign: 'right', cellPadding: 2 } },
    });

    // --- MODIFIED: Conditionally render the entire entrance exam section ---
    if (entranceMarks) {
        autoTable(doc, {
            head: [['22', 'Details of Entrance examination']],
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
            theme: 'grid',
        });

        autoTable(doc, {
            body: [
                ['22(a)', 'Register No', formData.entranceRegisterNo || ''],
                ['22(b)', 'Rank', formData.entranceRank || ''],
            ],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 1.5 },
            columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50 } },
        });

        autoTable(doc, {
            head: [
                [{ content: 'Subject / Paper', rowSpan: 2, styles: { valign: 'middle' } }, { content: 'Marks Scored', colSpan: 2, styles: { halign: 'center' } }],
                ['In Figures', 'In Words'],
            ],
            body: [
                ['Paper I (Physics & Chemistry)', entranceMarks.paper1Figures || '', toTitleCase(entranceMarks.paper1Words) || ''],
                ['Paper II (Mathematics)', entranceMarks.paper2Figures || '', toTitleCase(entranceMarks.paper2Words) || ''],
                ['Total Marks', entranceMarks.totalFigures || '', toTitleCase(entranceMarks.totalWords) || ''],
            ],
            theme: 'grid',
            headStyles: { fillColor: [220, 220, 220], textColor: 0, halign: 'center' },
        });
    }

    autoTable(doc, {
        head: [[hasTakenEntrance ? '23' : '22', 'Details of Marks secured in the SSLC examination']],
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        theme: 'grid',
    });

    autoTable(doc, {
        body: [
            [hasTakenEntrance ? '23(a)' : '22(a)', 'Board of Study', formData.sslcBoard.toUpperCase() || ''],
            ['23(b)', 'Total % of marks', formData.sslcPercentage || ''],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50 } },
    });

    autoTable(doc, {
        body: [
            [hasTakenEntrance ? '24' : '23', 'Admission Quota', toSentenceCase(formData.quota) || ''],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50 } },
    });

    // --- Page 3: Declaration & Certificate ---
    // This page remains unchanged
    doc.addPage();
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Page 3 Border

    let finalY = 30;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Declaration', pageCenterX, finalY, { align: 'center' });
    finalY += 15;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const declaration = 'We, the applicant & parent / guardian do hereby declare that all the information furnished above are true and correct and we will obey the rules and regulations of the Institution, if admitted. Also we understand that the admission shall be, subject to satisfying the eligibility norms prescribed by the Statutory Authorities and the state Govt. from time to time.';
    const splitDeclaration = doc.splitTextToSize(declaration, 170);
    doc.text(splitDeclaration, 20, finalY);
    finalY += 25;

    doc.text(`Place: ${toSentenceCase(formData.place) || ' '}`, 20, finalY);
    doc.text(`Date: ${userDate}`, 20, finalY + 8);

    doc.text(`Name: ${toTitleCase(formData.candidateName) || ''}`, 120, finalY);
    doc.text('Signature of the Parent:', 20, finalY + 25);
    doc.text('Signature of the Applicant:', 120, finalY + 25);

    if (parentSignBase64) doc.addImage(parentSignBase64, 'JPEG', 20, finalY + 30, 40, 15);
    if (applicantSignBase64) doc.addImage(applicantSignBase64, 'JPEG', 120, finalY + 30, 40, 15);

    finalY += 60;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('FOR OFFICE USE ONLY', pageCenterX, finalY, { align: 'center' });
    finalY += 10;

    const text = 'CERTIFICATE';
    doc.text(text, pageCenterX, finalY, { align: 'center' });

    const textWidth = doc.getTextWidth(text);
    const startX = pageCenterX - textWidth / 2;
    const endX = pageCenterX + textWidth / 2;
    const underlineY = finalY + 1;
    doc.line(startX, underlineY, endX, underlineY);
    finalY += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const certificate = 'Certified that the candidate has passed the qualifying examination mentioned and I have verified the original mark list with the entries made above and found correct.';
    const splitCertificate = doc.splitTextToSize(certificate, 170);
    doc.text(splitCertificate, 20, finalY);
    finalY += 20;

    doc.setFont(undefined, 'bold');
    doc.text(`Place: `, 20, finalY);
    doc.text('Signature:', 120, finalY);
    finalY += 8;
    doc.text('Date:', 20, finalY);
    doc.text('Name:', 120, finalY);
    finalY += 8;
    doc.text('Designation:', 120, finalY);
    finalY += 15;

    doc.setFont(undefined, 'normal');
    const admission = `The above candidate is admitted Provisionally to ___________________________________________ on _______________________________________ under Government / Management / NRI Quota.`;
    const splitAdmission = doc.splitTextToSize(admission, 170);
    doc.setLineHeightFactor(1.5);
    doc.text(splitAdmission, 20, finalY);
    finalY += 25;

    doc.setLineHeightFactor(1);
    doc.setFont(undefined, 'bold');
    doc.text('Signature of Director', 20, finalY);
    doc.text('Signature of Principal', 150, finalY);
    doc.setFont(undefined, 'normal');


    const pageCount = doc.internal.getNumberOfPages();
    const siteUrl = window.location.href;
    const dateTimeString = `${new Date().toLocaleString('en-IN')}`;

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i); // Go to page i

        // --- Header ---
        doc.setFontSize(8);
        doc.setTextColor(150); // Set color to a light gray

        // Top-left: Current Date and Time
        doc.text(dateTimeString, 10, 7);

        // Top-right: Website URL
        doc.text(siteUrl, pageWidth - 10, 7, { align: 'right' });

        // --- Footer ---
        // Bottom-right: Page Number
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 10, pageHeight - 7, { align: 'right' });
    }

    // --- Final Save ---
    const candidateName = formData.candidateName || 'Application';
    doc.save(`${candidateName.replace(/\s+/g, '_')}_Application.pdf`);
};