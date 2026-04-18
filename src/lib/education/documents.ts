
import type { Answers } from '../core/types';

export const allDocuments = [
    { id: 'passport', label: 'Passport' },
    { id: 'moi', label: 'MOI Certificate' },
    { id: 'englishTest', label: 'English Proficiency Test' },
    { id: 'uniDiploma', label: 'University/College Diploma' },
    { id: 'uniTranscript', label: 'University/College Transcript' },
    { id: 'shsDiploma', label: 'SHS Diploma' },
    { id: 'shsTranscript', label: 'SHS Transcript' },
    { id: 'jhsDiploma', label: 'Year 11 Diploma' },
    { id: 'jhsTranscript', label: 'Year 11 Transcript' },
    { id: 'hsDiplomaOld', label: 'High School Diploma (Old Curriculum)' },
    { id: 'hsTranscriptOld', label: 'High School Transcript (Old Curriculum)' },
    { id: 'enrollmentProof', label: 'Proof of Enrollment (for DNF University/College)' },
    { id: 'satAct', label: 'SAT/ACT/AP Result (if taken)' },
    { id: 'ibDiploma', label: 'IB Diploma' },
    { id: 'ibTranscript', label: 'IB Transcript' },
    { id: 'ibPredicted', label: 'IB Predicted Grades' },
    { id: 'tesda', label: 'TESDA Certificate' },
    { id: 'vocationalTranscript', label: 'Vocational School Transcript' },
    { id: 'coe', label: 'Certificate of Employment', condition: (answers: Answers) => answers.hasWorkExperience === 'Yes' },
    { id: 'resume', label: 'Updated Resume' },
    { id: 'birthCert', label: 'Birth Certificate' },
    { id: 'marriageCert', label: 'Marriage Certificate', condition: (answers: Answers) => ['De Facto / Common Law', 'Married', 'Divorced', 'Widowed'].includes(answers.maritalStatus || '') },
    { id: 'homeTies', label: 'Home Ties', subLabel: '(optional)' },
    { id: 'auVisa', label: 'Visa Grant/Refusal Letter', condition: (answers: Answers) => answers.hasVisitedDestination === 'Yes' },
    { id: 'bizPermits', label: 'Business Permits/Documents', condition: (answers: Answers) => answers.hasBusiness === 'Yes' },
    { id: 'visaStamps', label: 'All Visa Stamps from the past 10 years', subLabel: '(optional)' },
    { id: 'proofOfGaps', label: 'Proof of Gaps', condition: (answers: Answers) => answers.hasStudyWorkGap === 'Yes' },
    { id: 'prc', label: 'PRC License and Documents', subLabel: '(optional)' },
    { id: 'nzTuitionProof', label: 'Proof of Tuition Fee Payment', subLabel: '(must be sent to embassy after visa grant)', condition: (answers: Answers) => answers.studyDestination === 'New Zealand' },
    { id: 'nbiClearance', label: 'NBI Clearance', condition: (answers: Answers) => answers.studyDestination === 'Canada' },
    { id: 'policeCertificate', label: 'Police Certificate', subLabel: '(optional)', condition: (answers: Answers) => answers.studyDestination === 'Canada' },
];
  
const juniorHighDocs = new Set([
    'passport', 'englishTest', 'jhsDiploma', 'jhsTranscript', 'resume', 'birthCert', 'homeTies', 'proofOfGaps', 'auVisa', 'visaStamps', 'nzTuitionProof', 'nbiClearance', 'policeCertificate'
]);
const highSchoolOldDocs = new Set([
    'passport', 'englishTest', 'hsDiplomaOld', 'hsTranscriptOld', 'resume', 'birthCert', 'marriageCert', 'homeTies', 'auVisa', 'bizPermits', 'visaStamps', 'proofOfGaps', 'nzTuitionProof', 'nbiClearance', 'policeCertificate'
]);
const seniorHighDocs = new Set([
    'passport', 'englishTest', 'shsDiploma', 'shsTranscript', 'satAct', 'resume', 'birthCert', 'marriageCert', 'homeTies', 'auVisa', 'bizPermits', 'visaStamps', 'proofOfGaps', 'nzTuitionProof', 'nbiClearance', 'policeCertificate'
]);
const ibGceDocs = new Set([
    'passport', 'moi', 'ibDiploma', 'ibTranscript', 'ibPredicted', 'resume', 'birthCert', 'marriageCert', 'homeTies', 'auVisa', 'bizPermits', 'visaStamps', 'proofOfGaps', 'nzTuitionProof', 'nbiClearance', 'policeCertificate'
]);
const tesdaDocs = new Set([
    'passport', 'shsDiploma', 'shsTranscript', 'tesda', 'vocationalTranscript', 'resume', 'birthCert', 'marriageCert', 'homeTies', 'auVisa', 'bizPermits', 'visaStamps', 'proofOfGaps', 'nzTuitionProof', 'nbiClearance', 'policeCertificate'
]);
const associateDegreeDocs = new Set([
    'passport', 'englishTest', 'uniDiploma', 'uniTranscript', 'coe', 'resume', 'birthCert', 'marriageCert', 'homeTies', 'auVisa', 'bizPermits', 'visaStamps', 'proofOfGaps', 'nzTuitionProof', 'nbiClearance', 'policeCertificate'
]);
const bachelorDnfDocs = new Set([
    'passport', 'englishTest', 'uniTranscript', 'shsDiploma', 'shsTranscript', 'enrollmentProof', 'coe', 'resume', 'birthCert', 'marriageCert', 'homeTies', 'auVisa', 'bizPermits', 'visaStamps', 'proofOfGaps', 'nzTuitionProof', 'nbiClearance', 'policeCertificate'
]);
const bachelorAndMastersDocs = new Set([
    'passport', 'englishTest', 'uniDiploma', 'uniTranscript', 'coe', 'prc', 'resume', 'birthCert', 'marriageCert', 'homeTies', 'auVisa', 'bizPermits', 'visaStamps', 'proofOfGaps', 'nzTuitionProof', 'nbiClearance', 'policeCertificate'
]);

export const getDocsForEducation = (answers: Answers) => {
    const education = answers.highestEducation;
    let docSet;

    if (education === 'Junior High School') docSet = juniorHighDocs;
    else if (education === 'High School Graduate (Old Curriculum)') docSet = highSchoolOldDocs;
    else if (education === 'Senior High School') docSet = seniorHighDocs;
    else if (education === 'International Baccalaureate / GCE A-Levels') docSet = ibGceDocs;
    else if (education === 'TESDA Certificate') docSet = tesdaDocs;
    else if (education === 'Associate Degree') docSet = associateDegreeDocs;
    else if (education === 'Bachelor Degree (Did Not Finish)') docSet = bachelorDnfDocs;
    else if (education === "Bachelor's Degree" || education === "Master Degree" || "PhD" === education) docSet = bachelorAndMastersDocs;
    
    const destinationSpecificDocs = allDocuments.filter(doc => doc.condition && doc.condition(answers));

    if (docSet) {
        const educationDocs = allDocuments.filter(doc => docSet.has(doc.id));
        const combined = [...educationDocs, ...destinationSpecificDocs];
        const uniqueDocs = Array.from(new Set(combined.map(doc => doc.id))).map(id => combined.find(doc => doc.id === id)!);
        return uniqueDocs.filter(doc => !doc.condition || doc.condition(answers));
    }

    return allDocuments.filter(doc => !doc.condition || doc.condition(answers));
};
