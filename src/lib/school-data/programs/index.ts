import { groupOf8GeneralPrograms, groupOf8PopularPrograms } from './groupof8';
import { universitiesGeneralPrograms, universitiesPopularPrograms } from './universities';
import { privateCollegesGeneralPrograms, privateCollegesPopularPrograms } from './private-colleges';
import { canadaSchoolGeneralPrograms, canadaSchoolPopularPrograms } from './canada-school-programs';
import { newZealandSchoolGeneralPrograms, newZealandSchoolPopularPrograms } from './newzealand-school-programs';
import { irelandSchoolGeneralPrograms, irelandSchoolPopularPrograms } from './ireland-school-programs';
import { germanySchoolGeneralPrograms, germanySchoolPopularPrograms } from './germany-school-programs';

export const generalProgramsData: Record<string, string> = {
  ...groupOf8GeneralPrograms,
  ...universitiesGeneralPrograms,
  ...privateCollegesGeneralPrograms,
  ...canadaSchoolGeneralPrograms,
  ...newZealandSchoolGeneralPrograms,
  ...irelandSchoolGeneralPrograms,
  ...germanySchoolGeneralPrograms,
};

export const popularProgramsData: Record<string, string> = {
  ...groupOf8PopularPrograms,
  ...universitiesPopularPrograms,
  ...privateCollegesPopularPrograms,
  ...canadaSchoolPopularPrograms,
  ...newZealandSchoolPopularPrograms,
  ...irelandSchoolPopularPrograms,
  ...germanySchoolPopularPrograms,
};
