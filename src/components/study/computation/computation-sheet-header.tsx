
'use client';

import type { Answers } from "@/lib/core/types";
import { format } from 'date-fns';

interface ComputationSheetHeaderProps {
    answers: Answers;
}

export default function ComputationSheetHeader({ answers }: ComputationSheetHeaderProps) {
    const formattedIntakeDate = answers.intakeYear && answers.intakeMonth
        ? `${new Date(Number(answers.intakeYear), Number(answers.intakeMonth) - 1).toLocaleString('default', { month: 'long' })} ${answers.intakeYear}`
        : '';

    return (
        <div className="pdf-section">
            <div className="flex justify-center items-center text-center mb-4">
                 <h1 className="text-lg font-bold">
                    <span style={{color: '#004097'}}>Study</span><span className="italic" style={{color: '#eab308'}}>Navi</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 p-1 text-xs mb-4 text-gray-700">
                <div className="truncate"><span className="font-bold" style={{color: '#004097'}}>Destination:</span> {answers.studyDestination}</div>
                <div className="truncate"><span className="font-bold" style={{color: '#004097'}}>School:</span> {answers.schoolName}</div>
                <div className="truncate"><span className="font-bold" style={{color: '#004097'}}>Campus:</span> {answers.campusLocation}</div>
                <div className="truncate"><span className="font-bold" style={{color: '#004097'}}>Program Type:</span> {answers.programCategory}</div>
                <div className="truncate"><span className="font-bold" style={{color: '#004097'}}>Course:</span> {answers.program}</div>
                <div className="truncate"><span className="font-bold" style={{color: '#004097'}}>Intake:</span> {formattedIntakeDate}</div>
            </div>
        </div>
    );
}
