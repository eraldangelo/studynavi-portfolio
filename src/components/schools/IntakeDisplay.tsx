
'use client';

import React from 'react';

interface IntakeDisplayProps {
  intakes: string;
}

const IntakeDisplay: React.FC<IntakeDisplayProps> = ({ intakes }) => {
  const months = intakes.split(/, |,|\/| /).map(m => m.trim()).filter(Boolean);
  const count = months.length;

  let label = '';
  if (count === 2) {
    label = 'Sem';
  } else if (count === 3) {
    label = 'Trimester';
  } else if (count >= 4) {
    label = 'Term';
  }

  if (!label) {
    return <span className="text-muted-foreground">{intakes}</span>;
  }

  return (
    <div>
      {months.map((month, index) => (
        <span key={index} className="mr-4">
          <span className="text-blue-600 font-semibold">{`${label} ${index + 1}:`}</span>
          <span className="text-gray-500 ml-1">{`[${month}]`}</span>
        </span>
      ))}
    </div>
  );
};

export default IntakeDisplay;
