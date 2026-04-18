
import { formatNumber } from "@/lib/core/utils";

const TableRow = ({ label, value, isTotal = false, phpValue, symbol, isScholarship = false, isSubHeader = false }: { label: string | React.ReactNode, value?: string | number, isTotal?: boolean, phpValue?: number, symbol?: string, isScholarship?: boolean, isSubHeader?: boolean }) => {
    if (isSubHeader) {
      return (
        <tr className="border-b">
          <td colSpan={2} className="p-1.5 pt-3 font-bold" style={{color: '#004097'}}>{label}</td>
        </tr>
      );
    }
    
    const isNegative = typeof value === 'number' && value < 0;
    const displayValue = isNegative && typeof value === 'number' ? formatNumber(Math.abs(value)) : (typeof value === 'number' ? formatNumber(value) : value);
    const displayPhpValue = phpValue !== undefined ? formatNumber(Math.abs(phpValue)) : undefined;
  
    return (
      <tr className={`border-b ${isTotal ? 'bg-[#004097] text-white' : ''}`}>
        <td className={`p-1.5 font-bold w-[60%] ${isScholarship ? 'text-red-600' : 'text-gray-700'}`} style={{color: isScholarship ? 'crimson' : (isTotal ? 'white' : '')}}>{label}</td>
        <td className={`p-1.5 text-right`}>
          <div>
            <span className={`font-bold ${isTotal ? 'text-lg' : ''}`} style={{ color: isTotal ? 'white' : (isScholarship ? 'crimson' : '#004097') }}>
              {isNegative ? '- ' : ''}{symbol}{displayValue}
            </span>
            {phpValue !== undefined && (
              <span className="block text-xs font-normal" style={{ color: isTotal ? 'white' : (isScholarship ? 'crimson' : '#004097') }}>
                ({isNegative ? '- ' : ''}₱{displayPhpValue})
              </span>
            )}
          </div>
        </td>
      </tr>
    );
  };

export default TableRow;
