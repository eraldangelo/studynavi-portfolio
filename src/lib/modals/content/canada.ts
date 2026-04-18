import type { ModalContent } from '../../core/types';
import canadaAcademicPgwpDependentsModalContent from './canada/canada-academic-pgwp-dependents.json';
import canadaHealthWorkModalContent from './canada/canada-health-work.json';
import canadaProcessModalContent from './canada/canada-process.json';

export const canadaModalContent: Record<string, ModalContent> = {
  ...(canadaProcessModalContent as Record<string, ModalContent>),
  ...(canadaHealthWorkModalContent as Record<string, ModalContent>),
  ...(canadaAcademicPgwpDependentsModalContent as Record<string, ModalContent>),
};
