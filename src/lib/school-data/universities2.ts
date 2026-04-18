type University = {
    university: string;
    location: string[];
    typicalIntakes: string;
    category: string;
    priorityLevel: 'High' | 'Low';
    website: string;
    partner?: boolean;
}

export const universities2: University[] = [
    {
        university: 'Southern Cross University (SCU)',
        location: [
            'Sydney',
            'Melbourne',
            'Perth',
            'Brisbane',
            '**Regional NSW**',
            '• Northern Rivers',
            '**Regional QLD**',
            '• Coffs Harbour',
            '• Gold Coast'
        ],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.scu.edu.au'
    },
    {
        university: 'Swinburne University',
        location: ['Melbourne'],
        typicalIntakes: 'Mar, Aug',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.swinburne.edu.au/'
    },
    {
        university: 'Torrens University Australia (TUA)',
        location: ['Sydney', 'Melbourne', 'Brisbane', 'Adelaide', '**Regional NSW**', '• Blue Mountains'],
        typicalIntakes: 'Feb, Jun, Sep',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.torrens.edu.au/'
    },
    {
        university: 'University of Canberra (UC)',
        location: ['Canberra', 'Sydney'],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.canberra.edu.au/'
    },
    {
        university: 'University of Newcastle (UON)',
        location: ['Sydney', '**Regional NSW**', '• Newcastle – Callaghan Campus', '• Newcastle City Campus', '• Central Coast'],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.newcastle.edu.au/'
    },
    {
        university: 'University of Notre Dame (UND)',
        location: ['Perth', 'Sydney', '**Regional WA**', '• Broome'],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'Low',
        website: 'https://www.notredame.edu.au/'
    },
    {
        university: 'University of Southern Queensland (USQ)',
        location: ['Brisbane', '**Regional QLD**', '• Toowoomba'],
        typicalIntakes: 'Feb, Jun, Sep',
        category: 'Universities',
        priorityLevel: 'Low',
        website: 'https://www.unisq.edu.au/'
    },
    {
        university: 'University of the Sunshine Coast (USC)',
        location: ['Adelaide', '**Regional QLD**', '• Sunshine Coast – Sippy Downs', '• Fraser Coast – Hervey Bay', '• Gympie Campus', '• Caboolture Campus', '• Moreton Bay – Petrie Campus'],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'Low',
        website: 'https://www.unisc.edu.au/'
    },
    {
        university: 'University of Tasmania (UTAS)',
        location: ['Tasmania', 'Sydney'],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.utas.edu.au/'
    },
    {
        university: 'University of Technology Sydney (UTS)',
        location: ['Sydney'],
        typicalIntakes: 'Feb, Jul, Nov',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.uts.edu.au/'
    },
    {
        university: 'University of Wollongong (UoW)',
        location: ['**Regional NSW**', '• Wollongong'],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.uow.edu.au/'
    },
    {
        university: 'Victoria University (VU)',
        location: ['Melbourne', 'Sydney', 'Brisbane'],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.vu.edu.au/'
    },
    {
        university: 'Western Sydney University (WSU)',
        location: ['Sydney', '**Regional NSW**', '• Parramatta'],
        typicalIntakes: 'Feb, Jul',
        category: 'Universities',
        priorityLevel: 'High',
        website: 'https://www.westernsydney.edu.au/'
    }
];
