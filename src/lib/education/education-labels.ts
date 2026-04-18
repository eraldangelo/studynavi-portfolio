export const EDUCATION_LABELS: Record<string, string> = {
  'Junior High School': 'Year 11',
  'Senior High School': 'Year 12',
};

export const getEducationLabel = (value: string | null | undefined): string => {
  if (!value) return '';
  return EDUCATION_LABELS[value] ?? value;
};
