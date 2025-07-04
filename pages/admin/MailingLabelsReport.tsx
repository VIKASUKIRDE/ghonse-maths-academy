import React from 'react';
import { Student } from '../../types';

type EnrichedStudent = Student & { parentName: string };

interface MailingLabelsReportProps {
    students: EnrichedStudent[];
    reportTitle: string;
    onBack: () => void;
}

const MailingLabelsReport: React.FC<MailingLabelsReportProps> = ({ students, reportTitle, onBack }) => {

    const handlePrint = () => {
        window.print();
    };

    const chunkArray = <T,>(arr: T[], size: number): T[][] => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );
    };

    const pagesOfStudents = chunkArray(students, 10);

    return (
        <div>
             <style>{`
                @media print {
                  @page {
                    size: A4;
                    margin: 1cm;
                  }
                  body * { visibility: hidden; }
                  .printable-area, .printable-area * { visibility: visible; }
                  .printable-area { 
                      position: absolute; 
                      left: 0; 
                      top: 0; 
                      width: 100%;
                  }
                  
                  .print-page {
                      page-break-after: always;
                      box-shadow: none !important;
                      border: none !important;
                      background-color: white !important;
                      height: 27.7cm; /* A4 height minus margins */
                      display: grid;
                      grid-template-columns: repeat(2, 1fr);
                      grid-template-rows: repeat(5, 1fr);
                      gap: 4px;
                  }
                  .print-page:last-child {
                      page-break-after: auto;
                  }
                  .mailing-label {
                      border: 1px dashed #999;
                      overflow: hidden;
                      padding: 10px;
                      display: flex;
                      flex-direction: column;
                      justify-content: flex-start;
                  }
                  .mailing-label * {
                      color: black !important;
                      line-height: 1.4;
                  }
                }
            `}</style>
            
            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Reports</button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mailing Labels</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{reportTitle}</p>
                </div>
                <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Labels</button>
            </div>
            
            <div className="printable-area">
                {pagesOfStudents.map((pageStudents, pageIndex) => (
                    <div key={pageIndex} className="print-page bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-6 grid grid-cols-2 grid-rows-5 gap-4">
                        {pageStudents.map(student => (
                            <div key={student.id} className="mailing-label border border-dashed dark:border-gray-600 rounded-lg p-3 flex flex-col justify-start">
                                <p className="text-sm dark:text-white">To,</p>
                                <p className="font-bold text-base dark:text-white">{student.parentName}</p>
                                <p className="text-sm dark:text-gray-300 mt-1">{student.address}</p>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                                    <p>Parent Mob: {student.parentMobile}</p>
                                    <p>Student Mob: {student.studentMobile}</p>
                                    <p>Roll No: {student.rollNo}</p>
                                </div>
                            </div>
                        ))}
                         {/* Add filler divs to maintain grid structure for printing if the last page is not full */}
                        {Array.from({ length: 10 - pageStudents.length }).map((_, i) => <div key={`filler-${i}`} className="mailing-label border border-dashed dark:border-gray-600 rounded-lg p-3"></div>)}
                    </div>
                ))}

                {students.length === 0 && (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center">
                        <p>No students found for the selected filters to generate labels.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MailingLabelsReport;