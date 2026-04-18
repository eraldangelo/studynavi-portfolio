
'use client';

const allProgramCategories = [
    'ELICOS', 'Secondary School', 'Foundation Studies', 'Vocational', 'Bachelor', 'Pre-Masters Program', 'Master Coursework', 'Master Research', 'PhD'
];

export const getAustraliaProgramCategories = (highestEducation: string | null | undefined): string[] => {
    let categories: string[];
    switch (highestEducation) {
        case 'Junior High School':
            categories = ['ELICOS', 'Secondary School', 'Foundation Studies'];
            break;
        case 'High School Graduate (Old Curriculum)':
            categories = ['ELICOS', 'Vocational', 'Bachelor'];
            break;
        case 'Senior High School':
        case 'International Baccalaureate / GCE A-Levels':
            categories = ['ELICOS', 'Foundation Studies', 'Vocational', 'Bachelor'];
            break;
        case 'TESDA Certificate':
        case 'Associate Degree':
        case 'Bachelor Degree (Did Not Finish)':
            categories = ['ELICOS', 'Vocational', 'Bachelor'];
            break;
        case "Bachelor's Degree":
            categories = allProgramCategories.filter(c => !['Secondary School', 'Foundation Studies', 'PhD'].includes(c));
            break;
        case "Master Degree":
        case 'PhD':
             categories = ['ELICOS', 'Vocational', 'Bachelor', 'Master Coursework', 'Master Research', 'PhD'];
             break;
        default:
            // Return a broad list if education is not specified
            return ['ELICOS', 'Secondary School', 'Foundation Studies', 'Vocational', 'Bachelor', 'Pre-Masters Program', 'Master Coursework', 'Master Research', 'PhD'];
    }
    return categories;
};
