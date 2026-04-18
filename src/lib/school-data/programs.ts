
import { groupOf8GeneralPrograms, groupOf8PopularPrograms } from './programs/groupof8';
import { universitiesGeneralPrograms, universitiesPopularPrograms } from './programs/universities';
import { privateCollegesGeneralPrograms, privateCollegesPopularPrograms } from './programs/private-colleges';
import { canadaSchoolGeneralPrograms, canadaSchoolPopularPrograms } from './programs/canada-school-programs';
import { newZealandSchoolGeneralPrograms, newZealandSchoolPopularPrograms } from './programs/newzealand-school-programs';

export const generalProgramsData: Record<string, string> = {
  ...groupOf8GeneralPrograms,
  ...universitiesGeneralPrograms,
  ...privateCollegesGeneralPrograms,
  ...canadaSchoolGeneralPrograms,
  ...newZealandSchoolGeneralPrograms,
};

export const popularProgramsData: Record<string, string> = {
  ...groupOf8PopularPrograms,
  ...universitiesPopularPrograms,
  ...privateCollegesPopularPrograms,
  ...canadaSchoolPopularPrograms,
  ...newZealandSchoolPopularPrograms,
};
