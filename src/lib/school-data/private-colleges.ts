type PrivateCollege = {
    university: string;
    location: string[];
    typicalIntakes: string;
    category: string;
    priorityLevel: 'High' | 'Low';
    website: string;
    partner?: boolean;
}

export const privateColleges: PrivateCollege[] = [
    {
        university: 'ABM Further Education',
        location: ['Sydney'],
        typicalIntakes: 'Jan, Apr, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://abm.edu.au'
    },
    {
        university: 'Adelaide Education Group (AEG)',
        location: ['Adelaide', 'Melbourne'],
        typicalIntakes: 'Mar, Jul, Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://aeg.edu.au'
    },
    {
        university: 'Alma Mater College Australia (AMCA)',
        location: ['Melbourne'],
        typicalIntakes: 'Jan, Apr, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.almamatercollege.edu.au'
    },
    {
        university: 'Apeiro Institute',
        location: ['Perth', 'Melbourne', 'Sydney'],
        typicalIntakes: 'Jan, Apr, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.apeiro.edu.au'
    },
    {
        university: 'Australian Institute of Higher Education (AIHE)',
        location: ['Sydney', 'Melbourne'],
        typicalIntakes: 'Mar, Jul, Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://aihe.sa.edu.au'
    },
    {
        university: 'Australian Professional Skills Institute (APSI)',
        location: ['Perth'],
        typicalIntakes: 'Jan, Apr, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://apsi.edu.au'
    },
    {
        university: 'Canberra Institute of Technology (CIT)',
        location: ['Canberra'],
        typicalIntakes: 'Feb, Jul',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://cit.edu.au'
    },
    {
        university: 'Edith Cowan College (ECC)',
        location: ['Perth'],
        typicalIntakes: 'Feb, Jun, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.edithcowancollege.edu.au',
    },
    {
        university: 'Education Centre of Australia College (ECA College)',
        location: ['Sydney', 'Melbourne', 'Brisbane'],
        typicalIntakes: 'Jan, Apr, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.ecacollege.edu.au',
    },
    {
        university: 'Engineering Institute of Technology (EIT)',
        location: ['Perth', 'Melbourne', 'Brisbane'],
        typicalIntakes: 'Feb, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.eit.edu.au',
    },
    {
        university: 'Excelsia University College',
        location: ['Sydney'],
        typicalIntakes: 'Feb, Jul',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://excelsia.edu.au'
    },
    {
        university: 'Gordon TAFE',
        location: ['Melbourne', '**Regional VIC**', '• Geelong City Campus', '• East Geelong Campus'],
        typicalIntakes: 'Feb, Jul',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.thegordon.edu.au',
    },
    {
        university: 'Holmesglen Institute',
        location: ['Melbourne', '**Regional VIC**', '• Eildon Campus'],
        typicalIntakes: 'Feb, Jul',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.holmesglen.edu.au',
    },
    {
        university: 'IKON Institute / Australian Learning Group (ALG)',
        location: ['Sydney', 'Melbourne', 'Brisbane'],
        typicalIntakes: 'Feb, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.alg.edu.au',
    },
    {
        university: 'Imagine Education Australia',
        location: ['Gold Coast', 'Brisbane'],
        typicalIntakes: 'Jan, Apr, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.imagineeducation.com.au',
    },
    {
        university: 'Kaplan Business School',
        location: ['Sydney', 'Melbourne', 'Adelaide', 'Brisbane', 'Perth', 'Gold Coast'],
        typicalIntakes: 'Mar, Jul, Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.kbs.edu.au',
    },
    {
        university: 'King’s School of Culinary Arts',
        location: ['Sydney'],
        typicalIntakes: 'Feb, Jul, Oct/Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://kingsculinary.nsw.edu.au/',
    },
    {
        university: 'Macallan College',
        location: ['Adelaide', 'Brisbane', 'Perth', 'Sydney'],
        typicalIntakes: 'Flexible monthly starts',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://macallan.edu.au',
    },
    {
        university: 'Melbourne Institute of Technology (MIT)',
        location: ['Melbourne', 'Sydney'],
        typicalIntakes: 'Mar, Jul, Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.mit.edu.au',
    },
    {
        university: 'Melbourne Polytechnic',
        location: ['Melbourne'],
        typicalIntakes: 'Feb, Apr/Mar, Jul, Oct/Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.melbournepolytechnic.edu.au',
    },
    {
        university: 'Navitas<ul style="font-weight: normal; color: gray; margin: 0; padding-left: 1.2em; list-style-type: disc;"><li>Curtin College</li><li>ACAP University College</li><li>Navitas English</li><li>Western Sydney University International College</li><li>La Trobe College Australia</li><li>SIBT</li><li>Deakin College</li><li>Griffith College</li><li>Centre for English Language at UniSA</li></ul>',
        location: ['Perth', 'Sydney', 'Melbourne', 'Brisbane'],
        typicalIntakes: 'Jan/Feb, Mar/Apr, Jul, Oct/Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.navitas.com'
    },
    {
        university: 'NIT Australia',
        location: ['Perth', 'Darwin', 'Melbourne'],
        typicalIntakes: 'Feb, Jul, Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.nitaustralia.edu.au'
    },
    {
        university: 'Nova Anglia College',
        location: ['Brisbane'],
        typicalIntakes: 'Feb, Jul, Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.nac.edu.au'
    },
    {
        university: 'Pax Institute of Education',
        location: ['Melbourne'],
        typicalIntakes: 'Jan, Apr, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.pax.edu.au'
    },
    {
        university: 'Salford College',
        location: ['Adelaide', 'Sydney'],
        typicalIntakes: 'Feb, Apr, Jun, Aug, Oct, Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.salfordcollege.edu.au',
    },
    {
        university: 'Sacred Heart International College',
        location: ['Melbourne'],
        typicalIntakes: 'Flexible monthly starts',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://www.shic.vic.edu.au',
    }
];
