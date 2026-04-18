import type { ModalContent } from '../../core/types';
import australiaAcademicPathwaysModalContent from './australia/australia-academic-pathways.json';
import australiaPostStudyModalContent from './australia/australia-post-study.json';
import australiaResearchModalContent from './australia/australia-research.json';
import australiaVisaCoreModalContent from './australia/australia-visa-core.json';
import australiaWorkRightsHigherEdModalContent from './australia/australia-work-rights-higher-ed.json';
import australiaWorkRightsVocationalElicosModalContent from './australia/australia-work-rights-vocational-elicos.json';

export const australiaModalContent: Record<string, ModalContent> = {
  ...(australiaVisaCoreModalContent as Record<string, ModalContent>),
  ...(australiaPostStudyModalContent as Record<string, ModalContent>),
  ...(australiaWorkRightsVocationalElicosModalContent as Record<string, ModalContent>),
  ...(australiaWorkRightsHigherEdModalContent as Record<string, ModalContent>),
  ...(australiaAcademicPathwaysModalContent as Record<string, ModalContent>),
  ...(australiaResearchModalContent as Record<string, ModalContent>),
};
