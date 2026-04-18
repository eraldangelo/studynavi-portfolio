type PrivateCollege = {
    university: string;
    location: string[];
    typicalIntakes: string;
    category: string;
    priorityLevel: 'High' | 'Low';
    website: string;
    partner?: boolean;
}

export const privateColleges2: PrivateCollege[] = [
    {
        university: 'The Hotel School Australia',
        location: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
        typicalIntakes: 'Mar, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://hotelschool.scu.edu.au/'
    },
    {
        university: 'Shafston International College',
        location: ['Sydney', 'Brisbane', 'Gold Coast'],
        typicalIntakes: 'Flexible monthly starts',
        category: 'Private Institution & Colleges',
        priorityLevel: 'Low',
        website: 'https://shafston.edu/'
    },
    {
        university: 'Southern Cross Education Institute (SCEi)',
        location: ['Adelaide', 'Melbourne'],
        typicalIntakes: 'Mar, Jun, Aug, Nov',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.scei.edu.au/'
    },
    {
        university: 'Stanley College',
        location: ['Adelaide', 'Perth'],
        typicalIntakes: 'Jan, Apr, Jul, Sep',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.stanleycollege.edu.au/'
    },
    {
        university: 'TAFE International Western Australia (TIWA)',
        location: ['Perth','**Regional WA**','• Geraldton','• Kalgoorlie','• Northam','• Bunbury','• Albany'],
        typicalIntakes: 'Feb, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.tafeinternational.wa.edu.au/'
    },
    {
        university: 'TAFE NSW',
        location: ['Sydney', '**Regional NSW**', '• Albury', '• Armidale', '• Ballina', '• Bathurst', '• Coffs Harbour', '• Dubbo', '• Griffith', '• Lismore', '• Port Macquarie', '• Tamworth', '• Wagga Wagga', '• Orange', '• Moree', '• Broken Hill', '• Glen Innes'],
        typicalIntakes: 'Feb, Jul',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.tafensw.edu.au'
    },
    {
        university: 'TAFE Queensland (TAFE QLD)',
        location: ['Brisbane', '**Regional QLD**', '• Bundaberg', '• Maryborough', '• Toowoomba', '• Townsville', '• Cairns', '• Bowen', '• Whitsundays', '• Charters Towers', '• Atherton', '• Innisfail', '• Palm Island', '• Normanton', '• Mount Isa', '• Burdekin', '• Roma', '• Dalby', '• Gympie', '• Kingaroy', '• Warwick', '• Charleville'],
        typicalIntakes: 'Jan, Apr, Jul, Oct',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://tafeqld.edu.au/'
    },
    {
        university: 'TAFE South Australia',
        location: ['Adelaide', '**Regional SA**', '• Mount Barker', '• Victor Harbor', '• Nuriootpa', '• Berri', '• Murray Bridge', '• Port Lincoln', '• Port Pirie', '• Ceduna', '• Port Augusta', '• Kadina', '• Mount Gambier'],
        typicalIntakes: 'Jan, Jul',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.tafesa.edu.au/'
    },
    {
        university: 'TAFE Tasmania (TAS TAFE)',
        location: ['Tasmania'],
        typicalIntakes: 'Feb, Jul',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.tastafe.tas.edu.au/'
    },
    {
        university: 'The Trinity College (Melbourne)',
        location: ['Melbourne'],
        typicalIntakes: 'Jun, Jul, Aug, Sep',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.trinity.unimelb.edu.au/'
    },
    {
        university: 'William Angliss Institute (WAI)',
        location: ['Sydney', 'Melbourne'],
        typicalIntakes: 'Feb, Jul',
        category: 'Private Institution & Colleges',
        priorityLevel: 'High',
        website: 'https://www.angliss.edu.au/'
    }
];
