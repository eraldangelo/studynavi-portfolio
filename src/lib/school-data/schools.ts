
import { groupOf8 } from './groupof8';
import { universities } from './index';
import { privateColleges } from './index';
import { canadaSchoolData } from './canada-schools';
import { newZealandSchoolData } from './newzealand-schools';
import { irelandSchoolData } from './ireland-schools';
import { germanySchoolData } from './germany-schools';
import { generalProgramsData, popularProgramsData } from './programs';
import { schoolLogos } from './logos';

export interface School {
  name: string;
  country: string;
  countryFlag: string;
  tags: string[];
}

// The old schools array is kept for now, but is empty.
export const schools: School[] = [];


export interface SchoolTableEntry {
  university: string;
  logoUrl: string;
  location: string[];
  intakes: string;
  generalPrograms: string;
  popularPrograms: string;
  priorityLevel: 'High' | 'Low';
  website: string;
  category: string;
  partner?: boolean;
}

const allSchoolData = [
    ...groupOf8,
    ...universities,
    ...privateColleges,
    ...canadaSchoolData,
    ...newZealandSchoolData,
    ...irelandSchoolData,
    ...germanySchoolData,
];

export const schoolTableData: SchoolTableEntry[] = allSchoolData.map(school => {
  // Get programs from centralized data or use school's own data
  const generalPrograms = generalProgramsData[school.university] || (school as any).generalPrograms || 'N/A';
  const popularPrograms = popularProgramsData[school.university] || (school as any).popularPrograms || 'N/A';
  
  // Get logo URL
  const logoUrl = (school as any).logoUrl || schoolLogos[school.university as keyof typeof schoolLogos] || '';
  
  // Get intakes
  const intakes = (school as any).intakes || (school as any).intake || (school as any).typicalIntakes || 'N/A';

  return {
    ...school,
    logoUrl,
    intakes,
    generalPrograms,
    popularPrograms,
  };
});
