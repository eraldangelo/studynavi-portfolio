
import React from 'react';

interface IntakeFormatterProps {
  intakes: string;
  className?: string;
  view?: 'list' | 'grid';
}

const IntakeFormatter: React.FC<IntakeFormatterProps> = ({ 
  intakes, 
  className = '',
  view = 'list'
}) => {
  if (!intakes) return null;

  const cleanIntakes = intakes.replace(/[\[\]]/g, '');
  const intakeMonths = cleanIntakes.split(',').map(month => month.trim());
  
  const renderIntakes = () => {
    const count = intakeMonths.length;

    if (view === 'grid') {
      if (count < 2) {
        return <div className={`text-gray-600 ${className}`}>{intakes}</div>;
      }

      return (
        <div className={`flex flex-wrap items-center ${className}`}>
          {intakeMonths.map((month, index) => {
            let label = '';
            if (count === 2) {
              label = `Sem ${index + 1}:`;
            } else if (count === 3) {
              label = `Trimester ${index + 1}:`;
            } else if (count >= 4) {
              label = `Term ${index + 1}:`;
            }

            return (
              <React.Fragment key={index}>
                <div>
                  <span className="text-blue-600 font-medium">{label}</span>{' '}
                  <span className="text-gray-600">{month}</span>
                </div>
                {index < intakeMonths.length - 1 && (
                  <span className="text-gray-600 mx-2">|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    }
    
    // List View (existing logic)
    if (count === 2) {
      return (
        <div className={`space-y-1 ${className}`}>
          <div>
            <span className="text-blue-600 font-medium">Sem 1:</span>{' '}
            <span className="text-gray-600">{intakeMonths[0]}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Sem 2:</span>{' '}
            <span className="text-gray-600">{intakeMonths[1]}</span>
          </div>
        </div>
      );
    }
    
    if (count === 3) {
      return (
        <div className={`space-y-1 ${className}`}>
          {intakeMonths.map((month, index) => (
            <div key={index}>
              <span className="text-blue-600 font-medium">Trimester {index + 1}:</span>{' '}
              <span className="text-gray-600">{month}</span>
            </div>
          ))}
        </div>
      );
    }
    
    if (count >= 4) {
      return (
        <div className={`space-y-1 ${className}`}>
          {intakeMonths.map((month, index) => (
            <div key={index}>
              <span className="text-blue-600 font-medium">Term {index + 1}:</span>{' '}
              <span className="text-gray-600">{month}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback for 0, 1, or malformed
    return (
      <div className={`text-gray-600 ${className}`}>
        {intakes}
      </div>
    );
  };

  return renderIntakes();
};

export default IntakeFormatter;
