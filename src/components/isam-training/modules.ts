export type ModuleItem = {
  id: string;
  title: string;
  duration?: string;
  type?: 'video' | 'reading';
};

export type Module = {
  id: string;
  title: string;
  items: ModuleItem[];
};

const modules: Module[] = [
  {
    id: 'm1',
    title: 'Module 1',
    items: [
      { id: 'm1-1', title: 'ISAM Introduction', duration: '1:06', type: 'video' },
      { id: 'm1-2', title: 'What is ISAM?', duration: undefined, type: 'reading' },
    ],
  },
  {
    id: 'm2',
    title: 'Module 2',
    items: [
      { id: 'm2-1', title: 'The Data Ecosystem', duration: '6:05' },
    ],
  },
  {
    id: 'm3',
    title: 'Module 3',
    items: [
      { id: 'm3-1', title: 'Gathering and Wrangling Data', duration: '8:30' },
    ],
  },
  {
    id: 'm4',
    title: 'Module 4',
    items: [
      { id: 'm4-1', title: 'Mining & Visualizing Data', duration: '7:10' },
    ],
  },
  {
    id: 'm5',
    title: 'Module 5',
    items: [
      { id: 'm5-1', title: 'Career Opportunities', duration: '5:42' },
    ],
  },
];

export default modules;
