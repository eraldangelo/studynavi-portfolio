
import type { ModalContent } from '../../core/types';

export const otherDestinationsModalContent: Record<string, ModalContent> = {
  CANADA_BIOMETRICS_INFO: {
    id: 'CANADA_BIOMETRICS_INFO',
    title: 'Canada Visa: Biometrics (Philippines)',
    description: [
      'The digital capture of your fingerprints and facial image.',
      '**When to Book**',
      {
        list: [
          '**The Trigger:** You can only book this appointment **after** you have lodged your visa application and received the Biometric Instruction Letter (BIL).',
          '**The Deadline:** You usually have **30 days** from the date of the letter to complete this step.',
        ]
      },
      '**How to Book**',
      'The student needs to create an account and book an appointment here: [https://visa.vfsglobal.com/phl/en/can/](https://visa.vfsglobal.com/phl/en/can/)',
      '**Payment:** Paid at the VFS center in PHP.',
      '**What to Bring (Mandatory)**',
      {
        list: [
          '**Original Passport:** Must be the same one used in your visa application.',
          '**Biometric Instruction Letter (BIL):** The official letter from IRCC.',
          '**Appointment Confirmation:** The printed or digital copy from the VFS booking system.',
        ]
      },
      '**Critical Rules for the Day**',
      {
        list: [
          '**No "Decorations":** Ensure fingertips are free from cuts, bandages, or temporary decorations like henna (mehndi), as these interfere with the scanner.',
          '**Facial Image:** Your face must be clearly visible. You may be asked to remove glasses or head coverings (unless worn for religious reasons).',
          '**Minors:** Students under 18 years old must be accompanied by a parent or legal guardian.',
        ]
      }
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Biometrics information',
    hideDefaultCloseButton: true,
  },
  UK_BIOMETRICS_INFO: {
    id: 'UK_BIOMETRICS_INFO',
    title: 'UK Visa: Biometrics (Philippines)',
    description: [
      'The digital capture of your fingerprints and facial image.',
      '**When to Book**',
      {
        list: [
          '**The Trigger:** You book your biometrics appointment as part of the online visa application process.',
          '**The Deadline:** You must attend the appointment on the date you select.',
        ]
      },
      '**How to Book**',
      'The student books an appointment through the VFS Global website as part of their online application: [https://visa.vfsglobal.com/phl/en/gbr/](https://visa.vfsglobal.com/phl/en/gbr/)',
      '**Payment:** Paid at the VFS center in PHP.',
      '**What to Bring (Mandatory)**',
      {
        list: [
          '**Original Passport:** Must be the same one used in your visa application.',
          '**Appointment Confirmation:** A printed copy of your appointment confirmation.',
          '**Document Checklist:** A printed copy of your checklist from the online application.',
        ]
      },
      '**Critical Rules for the Day**',
      {
        list: [
          '**No "Decorations":** Ensure fingertips are free from cuts, bandages, or temporary decorations like henna (mehndi), as these interfere with the scanner.',
          '**Facial Image:** Your face must be clearly visible. You may be asked to remove glasses or head coverings (unless worn for religious reasons).',
          '**Minors:** Students under 18 years old must be accompanied by a parent or legal guardian.',
        ]
      }
    ],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70',
    imageAlt: 'Biometrics information'
  },
};
