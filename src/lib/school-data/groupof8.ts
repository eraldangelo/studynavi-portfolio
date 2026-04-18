type GroupOf8School = {
    university: string;
    location: string[];
    typicalIntakes: string;
    category: string;
    priorityLevel: 'High' | 'Low';
    website: string;
  partner?: boolean;
}

export const groupOf8: GroupOf8School[] = [
  {
    university: 'University of Melbourne (UniMelb)',
    location: ['Melbourne'],
    typicalIntakes: 'Feb, Jul',
    category: 'Group of 8',
    priorityLevel: 'High',
    partner: true,
    website: 'https://www.unimelb.edu.au/',
  },
  {
    university: 'UNSW Sydney',
    location: ['Sydney', 'Canberra'],
    typicalIntakes: 'Feb, May, Sep',
    category: 'Group of 8',
    priorityLevel: 'High',
    partner: true,
    website: 'https://www.unsw.edu.au/',
  },
  {
    university: 'University of Sydney (USYD)',
    location: ['Sydney'],
    typicalIntakes: 'Feb, Jul',
    category: 'Group of 8',
    priorityLevel: 'High',
    partner: true,
    website: 'https://www.sydney.edu.au/',
  },
  {
    university: 'Monash University',
    location: ['Melbourne'],
    typicalIntakes: 'Feb, Jul',
    category: 'Group of 8',
    priorityLevel: 'High',
    partner: true,
    website: 'https://www.monash.edu/',
  },
  {
    university: 'University of Queensland (UQ)',
    location: ['Brisbane'],
    typicalIntakes: 'Feb, Jul',
    category: 'Group of 8',
    priorityLevel: 'Low',
    partner: true,
    website: 'https://uq.edu.au/',
  },
  {
    university: 'University of Western Australia (UWA)',
    location: ['Perth'],
    typicalIntakes: 'Feb, Jul',
    category: 'Group of 8',
    priorityLevel: 'Low',
    partner: true,
    website: 'https://www.uwa.edu.au/home',
  },
  {
    university: 'Adelaide University (AU)',
    location: ['Adelaide'],
    typicalIntakes: 'Feb, Jul',
    category: 'Group of 8',
    priorityLevel: 'Low',
    partner: true,
    website: 'https://adelaideuni.edu.au/',
  },
  {
    university: 'Australian National University (ANU)',
    location: ['Canberra'],
    typicalIntakes: 'Feb, Jul',
    category: 'Group of 8',
    priorityLevel: 'Low',
    partner: true,
    website: 'https://www.anu.edu.au/',
  },
];
