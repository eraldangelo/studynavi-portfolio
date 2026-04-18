
import type { ModalContent } from '../../core/types';

export const commonModalContent: Record<string, ModalContent> = {
  DEPENDENT_VISA: {
    id: 'DEPENDENT_VISA',
    title: 'Dependent Visa Application',
    description: [
      'Please confirm if the student will include their dependents in the initial visa application.',
      { list: [
          '**Initial Application:** An additional fee of **PHP 15,000 per person** applies if dependents are included now.',
          '**Subsequent Application:** If the student plans to bring dependents *after* their visa is granted, the fee is **PHP 25,000 per person**.'
      ]},
      'If the student plans a subsequent application, please select **"No"** for now.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Dependent visa illustration',
    primaryButtonText: 'Yes, Proceed',
    secondaryButtonText: 'Cancel'
  },
  NO_SPONSOR_INQUIRY: {
    id: 'NO_SPONSOR_INQUIRY',
    title: 'Potential Non-Genuine Student',
    description: [
      'If the student does not have any sponsors, this is a **potential indicator of a non-genuine student**. Please ask if other family members or close relatives can help with their study abroad application.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'No sponsor illustration',
    primaryButtonText: 'Not Sure Yet',
    secondaryButtonText: 'No Sponsor Available'
  },
  VISA_REQUIREMENT_INFO: {
    id: 'VISA_REQUIREMENT_INFO',
    title: 'Important Visa Requirement Information',
    description: [
      'Please inform the student that an **official English test (such as IELTS, PTE, or TOEFL) is a mandatory requirement** for most student visa applications. It is crucial to set the expectation that they will likely need to take one of these tests.',
      'While a few institutions may not require an English test for admission to specific courses, the **embassy often requires it for the visa itself**. Please advise the student accordingly.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Visa requirement illustration',
    primaryButtonText: 'Acknowledge'
  },
  STUDY_WORK_GAP: {
    id: 'STUDY_WORK_GAP',
    title: 'Study or Work Gap Detected',
    description: [
      'A **study or work gap of more than six months** can raise concerns for educational institutions and embassies. Please ask the student if they can provide **evidence to explain this gap**.',
      'For example, if they were caring for a sick family member, documents like medical certificates, photos, or hospital bills can be very helpful. There are many possible reasons for a gap, so please inquire thoroughly to understand the student\'s situation.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Study gap illustration',
    primaryButtonText: 'Acknowledge'
  },
  VISA_REFUSAL_ACKNOWLEDGEMENT: {
    id: 'VISA_REFUSAL_ACKNOWLEDGEMENT',
    title: 'Visa Refusal Acknowledgment',
    description: [
      'A previous visa refusal **significantly increases the risk** for the current application.',
      'Potential consequences include:',
      { list: [
          '**Rejection by the educational institution**.',
          'A **second visa refusal** from the embassy.'
      ]},
      'Does the student understand these risks and wish to proceed?'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Visa refusal illustration',
    primaryButtonText: 'Yes, I understand and accept the risk',
    secondaryButtonText: 'No, Cancel'
  },
  SCHOOL_APPLICATION_INFO: {
    id: 'SCHOOL_APPLICATION_INFO',
    title: 'The School Application Process',
    description: [
      "The admissions team will handle the submission of the school application on the student's behalf. Our goal is to submit as early as possible to secure a spot in the desired intake.",
      "**Key Documents for Submission:**",
      {
        list: [
          "**Passport:** A clear, colored copy of the passport bio-page is essential.",
          "**Academic Documents:** All relevant diplomas and transcripts of records.",
          "**Updated Resume/CV.**"
        ]
      },
      "It is okay if the student is still missing certain items, such as an **English test result** or a **Certificate of Employment**. We can still submit the application, but this will likely result in a **Conditional Offer Letter**.",
      "The estimated time to receive an offer letter after applying is typically **1-2 weeks**. However, some schools may take up to **4 weeks**."
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'School application information',
    hideDefaultCloseButton: true,
  },
  OFFER_LETTER_INFO: {
    id: 'OFFER_LETTER_INFO',
    title: 'Understanding the Offer Letter',
    description: [
      'There are two main types of offer letters a student might receive:',
      { list: [
        '**Conditional Offer Letter:** This means the student is provisionally accepted but must provide additional documents or meet specific conditions before being fully admitted. The student cannot pay their tuition fee at this stage.',
        '**Unconditional Offer Letter:** This means the student has met all the requirements and is fully accepted into the program. The student is now ready to proceed with paying their tuition fee.'
      ]},
      'The estimated time to receive an offer letter after applying is typically **1-2 weeks**. However, some schools may take up to **4 weeks**. If a response has not been received after 4 weeks, please contact us for assistance.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Offer letter information',
    hideDefaultCloseButton: true,
  },
  TUITION_FEE_PAYMENT_INFO: {
    id: 'TUITION_FEE_PAYMENT_INFO',
    title: 'Tuition Fee Payment Information',
    description: [
        "For tuition fee payment, **the agency will not receive any payment**. All payments go **directly to the school**.",
        "For payment details, please check the offer letter, as schools provide their bank details there.",
        "The student can also ask to generate payment details if the application is made through StudyLink.",
        "**Types of Payment:**",
        { list: [
            "Telegraphic / Wire Transfer",
            "Online / Credit Card Payment"
        ]},
        "Once the student has paid the tuition fee, we will request the student to send their **proof of tuition fee payment**, and an assigned consultant will submit it to the school.",
        "Once the proof of payment is sent, the processing for the **[DOCUMENT_TYPE]** will take up to **5 business days**."
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Tuition fee payment information',
    hideDefaultCloseButton: true,
  },
  LOA_COE_INFO: {
    id: 'LOA_COE_INFO',
    title: 'Received the [DOCUMENT_TYPE]',
    description: [
        'Once the **[DOCUMENT_TYPE]** is received, please double-check all of the student\'s information to ensure it is correct.',
        'If all details are accurate, we can proceed with the student visa application.',
        'If any corrections are needed, the student must notify their assigned consultant immediately to coordinate with the school.',
        'Receiving an updated **[DOCUMENT_TYPE]** may take an additional **3-5 business days**.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Letter of Acceptance / COE Information',
    hideDefaultCloseButton: true,
  }
};
