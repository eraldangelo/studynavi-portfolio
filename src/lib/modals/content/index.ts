import { commonModalContent } from './common';
import { australiaModalContent } from './australia';
import { irelandModalContent } from './ireland';
import { NEW_ZEALAND_MODAL_CONTENT } from './new-zealand';
import { canadaModalContent } from './canada';
import { otherDestinationsModalContent } from './other-destinations';
import type { ModalContent } from '../../core/types';

export const MODAL_CONTENT: Record<string, ModalContent> = {
  ...commonModalContent,
  ...australiaModalContent,
  ...irelandModalContent,
  ...NEW_ZEALAND_MODAL_CONTENT,
  ...canadaModalContent,
  ...otherDestinationsModalContent,
};
