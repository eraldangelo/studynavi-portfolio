'use client';

export const getIrelandProgramCategories = (highestEducation: string | null | undefined): string[] => {
    if (['Master Degree', 'PhD'].includes(highestEducation || '')) {
       return ['Master Degree'];
   }

   const isEligibleForAccess = [
       'Junior High School',
       'Senior High School',
       'TESDA Certificate',
       'Associate Degree',
       'High School Graduate (Old Curriculum)',
       'Bachelor Degree (Did Not Finish)'
   ].includes(highestEducation || '');

   if (isEligibleForAccess) {
       return ['Certificate in Access Studies for Higher Education'];
   }

   if (highestEducation === 'International Baccalaureate / GCE A-Levels' || highestEducation === "Bachelor's Degree") {
       return ['Bachelor', 'Bachelor (Honours)'];
   }
   
   return [];
};
