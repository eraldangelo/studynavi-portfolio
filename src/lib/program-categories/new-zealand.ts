
'use client';

export const getNewZealandProgramCategories = (highestEducation: string | null | undefined): string[] => {
    const lowerEducationLevels = [
       'Junior High School', 
       'High School Graduate (Old Curriculum)', 
       'Senior High School', 
       'International Baccalaureate / GCE A-Levels', 
       'TESDA Certificate'
   ];

   const midEducationLevels = [
       'Associate Degree',
       'Bachelor Degree (Did Not Finish)',
       "Bachelor's Degree"
   ];

    const baseCategories = [
       'Pathway Student',
       'Level 4: Certificate', 
       'Level 5: Diploma / Certificate', 
       'Level 6: Diploma', 
       'Level 7: Bachelor\'s Degree / Graduate Diploma', 
       'Level 8: Postgraduate Diploma / Honours', 
       'Level 9: Master Degree', 
       'Level 9: Master\'s (Research)',
       'Level 10: Doctorate Degree (PhD)',
   ];
   
   if (lowerEducationLevels.includes(highestEducation || '')) {
       return baseCategories.filter(cat => ![
           'Level 8: Postgraduate Diploma / Honours',
           'Level 9: Master Degree',
           'Level 9: Master\'s (Research)',
           'Level 10: Doctorate Degree (PhD)'
       ].includes(cat));
   }

   if (midEducationLevels.includes(highestEducation || '')) {
       return baseCategories.filter(cat => cat !== 'Level 10: Doctorate Degree (PhD)');
   }

   return baseCategories;
};
