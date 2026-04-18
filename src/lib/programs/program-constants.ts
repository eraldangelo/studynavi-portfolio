// @/lib/programs/program-constants.ts
export const ALL_PROGRAM_DURATIONS = [
  '1 Year', '1.5 Years', '2 Years', '2.5 Years', '3 Years',
  '3.5 Years', '4 Years', '4.5 Years', '5 Years',
];

export const ALL_MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

export const IELTS_SCORES = ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'];

export const IELTS_TO_PTE_MAP: Record<string, string> = {
  '5.0': '41', '5.5': '46', '6.0': '52', '6.5': '59',
  '7.0': '66', '7.5': '75', '8.0': '82',
};

export const IELTS_TO_TOEFL_MAP: Record<string, string> = {
  '5.0': '50', '5.5': '66', '6.0': '80', '6.5': '90',
  '7.0': '99', '7.5': '107', '8.0': '114',
};

export const IELTS_TO_DUOLINGO_MAP: Record<string, string> = {
  '5.0': '80-90', '5.5': '95-100', '6.0': '105-115', '6.5': '120-125',
  '7.0': '130-135', '7.5': '140-145', '8.0': '150-155',
};
