
import jsPDF from 'jspdf';
import type { Answers } from '../types/pdf-types';
import { getPdfImageAddSource, type PdfImageSource } from '../shared/image-source';

export const drawStudentVisaProcess = (
  doc: jsPDF,
  answers: Answers,
  initialY: number,
  images: {
    planeIconImg: PdfImageSource;
    checkboxIconImg: PdfImageSource;
    checkedIconImg: PdfImageSource;
  }
): number => {
  let currentY = initialY;
  const margin = 8;
  const pageWidth = doc.internal.pageSize.getWidth();

  const headerText = "Student Visa Process Flow Checklist";
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#004097');

  const iconSize = 4;
  const iconTextGap = 1.5;
  const headerTextWidth = doc.getTextWidth(headerText);
  const totalHeaderWidth = headerTextWidth + iconSize + iconTextGap;

  let headerStartX = (pageWidth - totalHeaderWidth) / 2;

  const iconY = currentY - (iconSize / 2);
  doc.addImage(getPdfImageAddSource(images.planeIconImg), 'PNG', headerStartX, iconY, iconSize, iconSize);

  const textX = headerStartX + iconSize + iconTextGap;
  doc.text(headerText, textX, currentY, { baseline: 'middle', align: 'left' });

  currentY += 8;

  const { studyDestination = 'Australia', programCategory } = answers;
  const isAustraliaResearch = studyDestination === 'Australia' && ['Master Research', 'PhD'].includes(programCategory || '');
  const isCanada = studyDestination === 'Canada';
  const isNewZealand = studyDestination === 'New Zealand';

  const researchSteps = [
      { id: "consultation", title: "Consultation & Assessment", description: "Initial assessment of the student's profile and study goals." },
      { id: "research-topic", title: "Look for Research Topic", description: "Identify a suitable research topic." },
      { id: "supervisor", title: "Look for a Supervisor", description: "Find and secure a research supervisor." },
      { id: "application", title: "Apply Directly to the University", description: "Submit the research application directly." },
      { id: "offer-letter", title: "Offer Letter", description: "Receiving a conditional or unconditional offer." },
      { id: "nominate-agency", title: "Nominate Agency Representative", description: "Nominate the agency as the student's representative after receiving the offer." },
      { id: "tuition-payment", title: "Tuition Fee Payment", description: "Paying the initial deposit or full tuition fee." },
      { id: "loa-coe", title: "Confirmation of Enrollment (CoE)", description: "The official document confirming the student's place." },
      { id: "visa-lodgement", title: "Visa Application Lodgement", description: "Submitting the student's visa application." },
      { id: "medical-exam", title: "Medical Examination", description: "Completing a health check-up." },
      { id: "biometrics", title: "Biometrics", description: "Providing fingerprints and a photo." },
      { id: "visa-outcome", title: "Visa Outcome", description: "Receiving the final decision on the visa application.", isBranch: true },
  ];
  const newZealandSteps = [
      { id: "consultation", title: "Consultation & Assessment", description: "Initial assessment of the student's profile and study goals." },
      { id: "documentation", title: "Document Collection", description: "Gathering all necessary academic and personal documents." },
      { id: "application", title: "School Application", description: "Submitting the application to the chosen institution." },
      { id: "loa-coe", title: "Offer of Place", description: "The official document confirming the student's place in the course." },
      { id: "visa-lodgement", title: "Visa Application Lodgement", description: "Submitting the student visa application to the embassy." },
      { id: "medical-exam", title: "Medical Examination", description: "Completing a health check-up at an accredited clinic." },
      { id: "visa-outcome", title: "Visa Outcome", description: "Receiving the final decision on the visa application.", isBranch: true }
  ];
  let canadaSteps = [
      { id: "consultation", title: "Consultation & Assessment", description: "Initial assessment of the student's profile and study goals." },
      { id: "documentation", title: "Document Collection", description: "Gathering all necessary academic and personal documents." },
      { id: "application", title: "School Application", description: "Submitting the application to the chosen institution." },
      { id: "offer-letter", title: "Offer Letter", description: "Receiving a conditional or unconditional offer from the school." },
      { id: "loa-coe", title: "Letter of Acceptance (LoA)", description: "The official document confirming the student's place in the course." },
      { id: "pal", title: "Provincial Attestation Letter", description: "A mandatory letter from the province to apply for a study permit." },
      { id: "visa-lodgement", title: "Visa Application Lodgement", description: "Submitting the student visa application to the embassy." },
      { id: "medical-exam", title: "Medical Examination", description: "Completing a health check-up at an accredited clinic." },
      { id: "biometrics", title: "Biometrics", description: "Providing fingerprints and a photo at a designated center." },
      { id: "visa-outcome", title: "Visa Outcome", description: "Receiving the final decision on the visa application.", isBranch: true }
  ];
  if (studyDestination === 'Canada' && (programCategory === 'Master Degree' || programCategory === 'Doctorate (PhD)')) {
      canadaSteps = canadaSteps.filter(step => step.id !== 'pal');
  }
  let defaultSteps = [
      { id: "consultation", title: "Consultation & Assessment", description: "Initial assessment of the student's profile and study goals." },
      { id: "documentation", title: "Document Collection", description: "Gathering all necessary academic and personal documents." },
      { id: "application", title: "School Application", description: "Submitting the application to the chosen institution." },
      { id: "offer-letter", title: "Offer Letter", description: "Receiving a conditional or unconditional offer from the school." },
      { id: "tuition-payment", title: "Tuition Fee Payment", description: "Paying the initial deposit or full tuition fee as required." },
      { id: "loa-coe", title: "Confirmation of Enrollment (CoE)", description: "The official document confirming the student's place in the course." },
      { id: "visa-lodgement", title: "Visa Application Lodgement", description: "Submitting the student visa application to the embassy." },
      { id: "medical-exam", title: "Medical Examination", description: "Completing a health check-up at an accredited clinic." },
      { id: "visa-outcome", title: "Visa Outcome", description: "Receiving the final decision on the visa application.", isBranch: true }
  ];
  if (['Australia', 'UK'].includes(studyDestination)) {
      const medicalExamIndex = defaultSteps.findIndex(step => step.id === 'medical-exam');
      if (medicalExamIndex !== -1) {
          defaultSteps.splice(medicalExamIndex + 1, 0, { id: "biometrics", title: "Biometrics", description: "Providing fingerprints and a photo at a designated center." });
      }
  }
  if (studyDestination === 'Ireland') {
      const loaStep = defaultSteps.find(step => step.id === 'loa-coe');
      if (loaStep) loaStep.title = "Letter of Acceptance (LoA)";
  }
  if (studyDestination === 'Ireland') {
      defaultSteps = defaultSteps.filter(step => step.id !== "medical-exam" && step.id !== "biometrics");
  }

  let steps;
  if (isNewZealand) {
      steps = newZealandSteps;
  } else if (isCanada) {
      steps = canadaSteps;
  } else if (isAustraliaResearch && answers.schoolWillAssist !== 'true') {
      steps = researchSteps;
  } else {
      steps = defaultSteps;
  }

  const midPoint = Math.ceil(steps.length / 2);
  const column1Steps = steps.slice(0, midPoint);
  const column2Steps = steps.slice(midPoint);
  
  const columnGap = 10;
  const columnWidth = (pageWidth - (margin * 2) - columnGap) / 2;
  
  let yPos1 = currentY;
  let yPos2 = currentY;
  const startX1 = margin;
  const startX2 = margin + columnWidth + columnGap;

  const drawStep = (step: any, index: number, startX: number, startY: number, colWidth: number) => {
      let localY = startY;
      const checkboxSize = 3;
      const checkboxTextGap = 1;
      
      const textStartX = startX + checkboxSize + checkboxTextGap;
      const textAvailableWidth = colWidth - checkboxSize - checkboxTextGap;

      const iconToDraw = index === 0 ? images.checkedIconImg : images.checkboxIconImg;
      doc.addImage(getPdfImageAddSource(iconToDraw), 'PNG', startX, localY, checkboxSize, checkboxSize);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#004097');
      const splitTitle = doc.splitTextToSize(`${index + 1}. ${step.title}`, textAvailableWidth);
      const titleHeight = splitTitle.length * 3.5;
      doc.text(splitTitle, textStartX, localY + 1.5, {baseline: 'middle'});
      localY += titleHeight + 0.5; // Add a small gap after the title
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const splitDescription = doc.splitTextToSize(step.description, textAvailableWidth);
      doc.text(splitDescription, textStartX, localY, {baseline: 'top'});
      localY += (splitDescription.length * 3) + 2;
      
      if (step.isBranch) {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          
          doc.setTextColor('#16a34a'); // green
          doc.text('Visa Granted', textStartX + 5, localY);
          localY += 3;
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          
          if (isCanada) {
              doc.text('- Passport Submission Request', textStartX + 8, localY);
              localY += 3;
              doc.text('- POE Introduction Letter', textStartX + 8, localY);
              localY += 3;
              doc.text('- Pre-Departure Orientation', textStartX + 8, localY);
          } else if (isNewZealand) {
              doc.text('- Approval in Principle', textStartX + 8, localY);
              localY += 3;
              doc.text('- Pre-Departure Orientation', textStartX + 8, localY);
          } else {
              doc.text('- Pre-Departure Orientation', textStartX + 8, localY);
          }
          localY += 4;

          doc.setFont('helvetica', 'bold');
          doc.setTextColor('#dc2626'); // red
          doc.text('Visa Refused', textStartX + 5, localY);
          localY += 3;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          doc.text('- Refund Assistance', textStartX + 8, localY);
          localY += 5;
      }

      return localY - startY;
  };

  column1Steps.forEach((step, index) => {
      const stepHeight = drawStep(step, index, startX1, yPos1, columnWidth);
      yPos1 += stepHeight;
  });

  column2Steps.forEach((step, index) => {
      const stepHeight = drawStep(step, midPoint + index, startX2, yPos2, columnWidth);
      yPos2 += stepHeight;
  });
  
  currentY = Math.max(yPos1, yPos2) + 2;
  
  return currentY;
};
