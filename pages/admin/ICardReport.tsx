import React, { useState, useMemo } from 'react';
import { Student } from '../../types';

type EnrichedStudent = Student & { parentName: string };

interface ICardReportProps {
    students: EnrichedStudent[];
    onBack: () => void;
}

type CardTheme = 'Red' | 'Blue' | 'Green' | 'Yellow';

const THEMES: Record<CardTheme, { bg: string; text: string; header: string; }> = {
    Red: { bg: 'bg-rose-100', text: 'text-red-700', header: 'bg-red-600' },
    Blue: { bg: 'bg-blue-100', text: 'text-blue-700', header: 'bg-blue-600' },
    Green: { bg: 'bg-green-100', text: 'text-green-700', header: 'bg-green-600' },
    Yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', header: 'bg-yellow-600' },
};

const ICardComponent: React.FC<{ student: EnrichedStudent; year: string; theme: CardTheme }> = ({ student, year, theme }) => {
    const currentTheme = THEMES[theme];

    return (
        <div className="i-card w-[420px] h-[260px] flex flex-col rounded-lg shadow-lg overflow-hidden bg-white border border-gray-300">
            {/* Header */}
            <div className={`${currentTheme.bg} p-2`}>
                <div className="flex items-center justify-between">
                    {/* Logo part */}
                    <div className="flex items-center space-x-2">
                        <div className="relative text-center">
                            <div className="font-black text-3xl text-gray-700 flex items-end leading-none">
                                GMA
                            </div>
                             <p className="text-[7px] font-bold text-gray-600 -mt-1 tracking-tighter">Ghonse Maths Academy</p>
                        </div>
                    </div>
                    {/* Academy Info */}
                    <div className="text-right">
                        <h3 className={`font-bold ${currentTheme.text} text-lg leading-tight`}>Ghonse Maths Academy</h3>
                        <p className="text-[10px] text-gray-700 leading-tight">Rasane Nagar Road, Savedi</p>
                        <p className="text-[10px] text-gray-700 leading-tight">Email: ssghonse@gmail.com | Mob: 9423783250</p>
                    </div>
                </div>
                <div className={`h-1.5 ${currentTheme.header} mt-1.5`}></div>
            </div>

            {/* Body */}
            <div className="flex-grow flex p-3 space-x-3">
                {/* Photo */}
                <div className="w-1/4 flex flex-col justify-start items-center pt-1">
                    <div className="w-24 h-28 border-2 border-gray-400 bg-gray-200">
                         <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Details */}
                <div className="w-3/4 flex flex-col justify-between text-sm text-gray-800">
                    <div className="space-y-1.5">
                        <div className="flex items-center border-b border-gray-400 pb-1">
                            <strong className="w-24 font-semibold">Name :</strong>
                            <span className="font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center border-b border-gray-400 pb-1">
                            <strong className="w-24 font-semibold">Roll No. :</strong>
                            <span className="font-medium">{student.rollNo}</span>
                        </div>
                        <div className="flex items-center border-b border-gray-400 pb-1">
                            <strong className="w-24 font-semibold">Class :</strong>
                            <span className="font-medium">{student.batch}</span>
                        </div>
                        <div className="flex items-center border-b border-gray-400 pb-1">
                            <strong className="w-24 font-semibold">Batch :</strong>
                            <span className="font-medium">{student.batchTiming || 'N/A'}</span>
                        </div>
                         <div className="flex items-center border-b border-gray-400 pb-1">
                            <strong className="w-24 font-semibold">Mob. No. :</strong>
                            <span className="font-medium">{student.studentMobile}</span>
                        </div>
                         <div className="flex items-center border-b border-gray-400 pb-1">
                            <strong className="w-24 font-semibold">Year :</strong>
                            <span className="font-medium">{year}</span>
                        </div>
                    </div>
                    <div className="text-right text-xs mt-2 font-semibold">
                        Authorised Sign.
                    </div>
                </div>
            </div>
        </div>
    );
};


export const ICardReport: React.FC<ICardReportProps> = ({ students, onBack }) => {
    const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    const [cardTheme, setCardTheme] = useState<CardTheme>('Red');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = useMemo(() => {
        if (!searchQuery) {
            return students;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return students.filter(student =>
            student.name.toLowerCase().includes(lowercasedQuery) ||
            student.rollNo.toLowerCase().includes(lowercasedQuery)
        );
    }, [students, searchQuery]);

    const handlePrintCard = (studentId: string) => {
        const cardToPrint = document.getElementById(`icard-${studentId}`);
        if (!cardToPrint) return;

        const clonedCard = cardToPrint.cloneNode(true) as HTMLElement;
        
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container-single';
        printContainer.appendChild(clonedCard);
        
        document.body.appendChild(printContainer);

        const printStyle = document.createElement('style');
        printStyle.innerHTML = `
            @media print {
                @page {
                    size: landscape;
                    margin: 0;
                }
                body > *:not(#print-container-single) {
                    visibility: hidden;
                }
                #print-container-single, #print-container-single * {
                    visibility: visible;
                }
                #print-container-single {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                #print-container-single .i-card {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    transform: scale(1.8);
                }
                #print-container-single .i-card * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `;

        document.head.appendChild(printStyle);
        window.print();
        document.head.removeChild(printStyle);
        document.body.removeChild(printContainer);
    };

    const handlePrintAll = () => {
        const gridToPrint = document.getElementById('icard-grid');
        if (!gridToPrint) return;
    
        const clonedGrid = gridToPrint.cloneNode(true) as HTMLElement;
        clonedGrid.querySelectorAll('.individual-print-button').forEach(btn => btn.remove());
    
        const printContainer = document.createElement('div');
        printContainer.id = 'print-all-container';
        printContainer.appendChild(clonedGrid);
        document.body.appendChild(printContainer);
    
        const printStyle = document.createElement('style');
        printStyle.innerHTML = `
            @media print {
                @page {
                    size: A4 portrait;
                    margin: 1cm;
                }
                body > *:not(#print-all-container) {
                    visibility: hidden;
                }
                #print-all-container, #print-all-container * {
                    visibility: visible;
                }
                #print-all-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                #print-all-container #icard-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1cm;
                    justify-items: center;
                }
                .i-card-wrapper {
                    page-break-inside: avoid;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0; /* Remove gap for printing */
                }
                .i-card {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    transform: scale(0.85);
                    transform-origin: top center;
                    box-shadow: none;
                    border: 1px solid #ccc;
                }
            }
        `;
    
        document.head.appendChild(printStyle);
        window.print();
    
        document.head.removeChild(printStyle);
        document.body.removeChild(printContainer);
    };
    
    return (
        <div>
             <div className="no-print">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">&larr; Back to Reports</button>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">I-Card Generator</h1>
                     <button 
                        onClick={handlePrintAll} 
                        disabled={filteredStudents.length === 0}
                        className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:bg-teal-300 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Print All Filtered Cards
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex-1 w-full md:w-auto">
                        <h2 className="text-lg font-semibold text-center mb-3 md:text-left">Select Card Theme</h2>
                        <div className="flex justify-center md:justify-start flex-wrap gap-3">
                            {(Object.keys(THEMES) as CardTheme[]).map(themeName => (
                                <button 
                                    key={themeName} 
                                    onClick={() => setCardTheme(themeName)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                                        cardTheme === themeName
                                            ? `${THEMES[themeName].bg} ${THEMES[themeName].text} border-current ring-2 ring-offset-2 ring-current dark:ring-offset-slate-800`
                                            : 'bg-gray-100 dark:bg-slate-700 border-transparent hover:border-gray-300 dark:hover:border-slate-500'
                                    }`}
                                >
                                    {themeName}
                                </button>
                            ))}
                        </div>
                     </div>
                     <div className="w-full md:w-auto md:max-w-xs">
                        <label htmlFor="icard-search" className="sr-only">Search Students</label>
                        <input
                            id="icard-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or roll no..."
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                    </div>
                </div>
             </div>
            
            <div id="icard-grid" className="grid gap-8 justify-items-center grid-cols-1 lg:grid-cols-2">
                {filteredStudents.map(student => (
                    <div key={student.id} className="i-card-wrapper flex flex-col items-center gap-4">
                        <div id={`icard-${student.id}`}>
                            <ICardComponent student={student} year={academicYear} theme={cardTheme} />
                        </div>
                        <button 
                            onClick={() => handlePrintCard(student.id)} 
                            className="individual-print-button bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 flex items-center gap-2 no-print"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            Print Card
                        </button>
                    </div>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center">
                    <p>No students found for the current filter.</p>
                </div>
            )}
        </div>
    );
};