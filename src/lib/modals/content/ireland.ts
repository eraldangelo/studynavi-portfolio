
import type { ModalContent } from '../../core/types';

export const irelandModalContent: Record<string, ModalContent> = {
  IRELAND_RISK_ACKNOWLEDGEMENT: {
    id: 'IRELAND_RISK_ACKNOWLEDGEMENT',
    title: 'Risk Acknowledgment',
    description: [
      'Please inform the student of the following risks:',
      { list: [
          '**Sponsor Requirements:** The Irish Embassy often requires **proof of funds from close relatives**.',
          '**Higher-Risk Sponsors:** If the sponsor is a family friend, fiancÃ©, in-law, or distant relative, this path carries a **significantly higher risk of visa refusal** due to extensive documentation requirements.',
          '**Required Documents:** The specific documents needed for financial sponsorship will be discussed in detail in a later step.'
      ]},
      'Does the student understand and agree to proceed despite these risks?'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Risk acknowledgment illustration',
    primaryButtonText: 'Yes, Proceed',
    secondaryButtonText: 'No, Cancel'
  },
  IRELAND_WORK_RIGHTS: {
    id: 'IRELAND_WORK_RIGHTS',
    title: 'Work Rights While Studying',
    description: [
      "International students in Ireland have the legal right to work part-time to help cover living expenses.",
      "**Working Hours**",
      { list: [
          'Term Time: Up to 20 hours per week.',
          'Holiday Periods: Up to 40 hours per week.'
      ]},
      "**Standardized Holiday Dates:**",
      { list: [
        "Summer: June 1 â€“ September 30",
        "Winter: December 15 â€“ January 15"
      ]},
      "**Minimum Wage (2025/2026)**",
      { list: [
        "Current Rate: â‚¬13.50 per hour.",
        "Upcoming (Jan 2026): Increasing to â‚¬14.15 per hour."
      ]},
      "An average student working 20 hours can earn roughly â‚¬1,100+ per month.",
      "For more information, visit: [https://www.internationalstudents.ie/info-and-advice/immigration/working-in-ireland](https://www.internationalstudents.ie/info-and-advice/immigration/working-in-ireland)"
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Work rights info',
    hideDefaultCloseButton: true,
  },
  IRELAND_DEPENDENT_INFO: {
    id: 'IRELAND_DEPENDENT_INFO',
    title: 'Important Information About Dependents',
    description: [
        'When studying **in Ireland**, it is **not possible** to bring dependents with the student on the **initial study visa**. There is **no specific dependent visa** that allows family members to accompany the student at the same time.',
        'Please set the expectation for the student that they may be able to bring their dependents **only after** their studies are complete and they have successfully applied for a **post-graduate visa**.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Dependents information illustration',
    primaryButtonText: 'Acknowledge and Proceed',
    secondaryButtonText: 'Cancel'
  },
  IRELAND_NO_DEPENDENTS: {
    id: 'IRELAND_NO_DEPENDENTS',
    title: 'Dependents Cannot Be Added to This Visa',
    description: [
      'The **Stamp 2 study visa** issued to international students in Ireland does **not allow spouses or children to accompany the student** during the initial application.',
      { list: [
        '**No Dependent Stream:** Unlike other destinations, there is no paired dependent visa that can be lodged alongside the study visa.',
        '**Bring Them Later:** Dependents can only join once the student has completed their program and moved to a **Stamp 1G (Stay Back)** or a work permit.',
        '**Visitor Visas Are Limited:** Short-term visitor visas for family members are discretionary and do not allow work or schooling.'
      ]},
      'Please explain this policy clearly so the student can make informed plans for their family and focus on completing the program first.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Ireland dependent restriction notice',
    primaryButtonText: 'Return to Options'
  },
  IRELAND_VISA_REQUIREMENT_INFO: {
    id: 'IRELAND_VISA_REQUIREMENT_INFO',
    title: 'Important Visa Requirement Information',
    description: [
      'Please inform the student that an **official English test (such as IELTS, PTE, TOEFL, or Duolingo) is a mandatory requirement** for most Irish school and visa applications. It is crucial to set the expectation that they will likely need to take one of these tests.',
      'We **strongly suggest taking the Duolingo English Test**, as it is one of the **easiest and most affordable options** and can be taken from the **comfort of the student\'s home**.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Visa requirement illustration',
    primaryButtonText: 'Acknowledge'
  },
  IRELAND_QUALIFICATION_INFO: {
    id: 'IRELAND_QUALIFICATION_INFO',
    title: 'Important Qualification Information',
    description: [
        'Please set the expectation for the student that they might need to take a **Level 6 Certificate in Access to Higher Education** or might be **rejected by the school**. This is because the level of qualification in the Philippines is different from that in Ireland.',
        'For a comparison, please visit [https://qsearch.qqi.ie/webpart/search?searchtype=recognitions](https://qsearch.qqi.ie/webpart/search?searchtype=recognitions).'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Qualification information illustration',
    primaryButtonText: 'Acknowledge and Proceed'
  },
  IRELAND_STUDY_WORK_GAP: {
    id: 'IRELAND_STUDY_WORK_GAP',
    title: 'Study or Work Gap Detected',
    description: [
      'A **study or work gap of more than six months** can raise concerns for educational institutions and embassies. Please ask the student if they can provide **evidence to explain this gap**.',
      'For example, if they were caring for a sick family member, documents like medical certificates, photos, or hospital bills can be very helpful. There are many possible reasons for a gap, so please inquire thoroughly to understand the student\'s situation.'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Study gap illustration'
  },
  IRELAND_BACHELOR_LEVEL7_PROGRAM_DURATION: {
    id: 'IRELAND_BACHELOR_LEVEL7_PROGRAM_DURATION',
    title: 'Warning',
    description: [
      { list: [
          "If the student graduated from the **old high school curriculum** and holds a **bachelor's degree**, they will be required to complete the **full three-year program**.",
          "If the student graduated from the **K-12 senior high school curriculum** and holds a **bachelor's degree**, the program duration might be **reduced to one year**."
      ]},
      "Please set the expectation that the student may be required to complete the **full three-year course**. Setting proper expectations can help manage student satisfaction.",
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Warning illustration',
    hideDefaultCloseButton: true,
  },
  IRELAND_BACHELOR_LEVEL8_PROGRAM_DURATION: {
    id: 'IRELAND_BACHELOR_LEVEL8_PROGRAM_DURATION',
    title: 'Warning',
    description: [
      { list: [
          "If the student graduated from the **old high school curriculum** and holds a **bachelor's degree**, they will be required to complete the **full three-year program**.",
          "If the student graduated from the **K-12 senior high school curriculum** and holds a **bachelor's degree**, the program duration might be **reduced to one year**."
      ]},
      "Please set the expectation that the student may be required to complete the **full three-year course**. Setting proper expectations can help manage student satisfaction.",
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Warning illustration',
    hideDefaultCloseButton: true,
  },
  IRELAND_MASTER_DEGREE_INFO: {
    id: 'IRELAND_MASTER_DEGREE_INFO',
    title: 'Important Information',
    description: [
        "Only a **Master Degree** or **PhD** from the **Philippines** qualifies for **direct entry** into a **Level 9: Master Degree** program. For more information, please check [https://qsearch.qqi.ie/webpart/search?searchtype=recognitions&embedded=0](https://qsearch.qqi.ie/webpart/search?searchtype=recognitions&embedded=0)."
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Information illustration',
    primaryButtonText: 'Acknowledge and Proceed'
  },
  IRELAND_POST_STUDY_WORK_VISA: {
    id: 'IRELAND_POST_STUDY_WORK_VISA',
    title: 'Post-Study Work Visa',
    description: [
      '<div class="font-bold" style="color: #004097;">The "Golden Rule"</div><div class="text-gray-600 italic mb-2">(Level 8 Degree and Above)</div>',
      'The main reason Ireland is a top destination for international students.',
      "**How long can a student stay?**",
      "After graduation, the student is granted a \"Stay-Back Visa\" (Stamp 1G) to work full-time:",
      { list: [
          "Level 8: Bachelorâ€™s Degree (Honours): **1 Year**",
          "Level 9: Master Degree: **2 Years**",
          "Level 10: Doctorate Degree: **2 Years**",
      ]},
      "**Key Benefits**",
      { list: [
          "**Work Full-Time:** The student can work 40 hours a week for any employer.",
          "**No Permit Needed:** Employers do not have to sponsor the student during this period, making it much easier to get hired."
      ]},
      "**Pathway to Residency:** Use this time to secure a long-term Critical Skills Work Permit.",
      "**Simple Requirements**",
      { list: [
          "**Finish the course:** Graduate from a recognized full-time degree.",
          "**Apply Fast:** The student must apply within 6 months of getting their final results."
      ]},
      "For the Critical Skills Work List, a student can visit here: [https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/employment-permit-eligibility/highly-skilled-eligible-occupations-list/](https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/employment-permit-eligibility/highly-skilled-eligible-occupations-list/)"
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Post-study work rights info',
    hideDefaultCloseButton: true,
  },
  IRELAND_VISA_LODGEMENT_INFO: {
    id: 'IRELAND_VISA_LODGEMENT_INFO',
    title: 'Student Visa Application Process for Ireland',
    description: [
      "For Filipino students applying for a Student Visa in Ireland, here is the 3-step workflow:",
      { list: [
        "**Online Application (AVATS):** Complete the official Irish government form online [here](https://www.visas.inis.gov.ie/avats/OnlineHome.aspx).",
        "**VFS Global Appointment:** Schedule an appointment and submit documents through the VFS Global application page [here](https://visa.vfsglobal.com/phl/en/irl/apply-visa). *Note: The VFS Service Fee is â‚±3,150.*",
        "**Additional Documents:** Since we have most of the student's documents, we will only need a few more items, including the **Letter of Application**. This is the student's Statement of Purpose (SOP), which must be signed, dated, and include where the student will be staying for the duration of their studies."
      ]}
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Ireland visa lodgement process',
    hideDefaultCloseButton: true,
  },
  IRELAND_VISA_PROCESSING_TIME: {
    id: 'IRELAND_VISA_PROCESSING_TIME',
    title: 'Student Visa Processing Time',
    description: [
      'For more information about the student visa processing time for Ireland, please visit this page: [https://www.vfsglobal.com/one-pager/ireland/phillippines/english/index.html](https://www.vfsglobal.com/one-pager/ireland/phillippines/english/index.html)'
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Visa processing time info',
    hideDefaultCloseButton: true,
  },
  IRELAND_PEL_INFO: {
    id: 'IRELAND_PEL_INFO',
    title: 'Protection of Enrolled Learners (PEL)',
    description: [
      'PEL is a mandatory insurance policy or financial bond that protects international students if their college or school unexpectedly closes down or stops offering their course.',
      '**Why it matters to the student:**',
      { list: [
        '**Money Back:** If the college closes, the student is legally entitled to a refund of the fees they paid.',
        '**Finish the Degree:** In many cases, PEL allows the student to transfer to a similar course at a different college to finish their studies without paying extra.'
      ]},
      '**Visa Requirement:** Students cannot get a Study Visa (Stamp 2) for a private college unless that college provides proof of PEL.',
      '**Key Facts for Students**',
      { list: [
        '**Applies to:** Any course longer than 3 months (Degree programs and English Language courses).',
        '**The Certificate:** Once the student arrives and pays, the college must provide them with an individual insurance certificate.'
      ]}
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Protection of Enrolled Learners info'
  }
};
