
'use client';

export const getCanadaProgramCategories = (highestEducation: string | null | undefined): string[] => {
    const eslOption = 'ESL / FSL';
    
    const undergraduateDiplomaAndCert = [
        'Certificate',
        'Diploma',
        'Advanced Diploma',
    ];

    const undergraduateDegree = [
        'Associate Degree',
        'Bachelor’s Degree',
    ];

    const postgraduate = [
        'Post-Graduate Certificate',
        'Post-Graduate Diploma',
        'Professional Degree',
        'Master Degree',
        'Doctorate (PhD)',
    ];

    const allUndergraduate = [...undergraduateDiplomaAndCert, ...undergraduateDegree];

    switch (highestEducation) {
        case 'Junior High School':
            return [eslOption];

        case 'High School Graduate (Old Curriculum)':
        case 'Senior High School':
        case 'International Baccalaureate / GCE A-Levels':
        case 'TESDA Certificate':
        case 'Associate Degree':
        case 'Bachelor Degree (Did Not Finish)':
            return [eslOption, ...allUndergraduate];

        case "Bachelor's Degree":
        case "Master's Degree":
        case 'PhD':
             return [
                eslOption,
                ...allUndergraduate,
                ...postgraduate,
            ];

        default:
            // If no education level is selected, return a comprehensive list.
            return [
                eslOption,
                ...allUndergraduate,
                ...postgraduate,
            ];
    }
};
