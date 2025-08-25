
import React, { useState } from 'react';
import { StudyLevel } from '../types';
import { TOPICS } from '../constants';

interface SetupScreenProps {
    onSetupComplete: (grade: string, level: StudyLevel, topic: string) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete }) => {
    const [grade, setGrade] = useState<string>('ח');
    const [level, setLevel] = useState<StudyLevel>(StudyLevel.REGULAR);
    const [topic, setTopic] = useState<string>('');
    const [step, setStep] = useState(1);

    const handleNext = () => {
        if (step === 2 && topic) {
            onSetupComplete(grade, level, topic);
        } else if (step < 2) {
            setStep(s => s + 1);
        }
    };
    
    const canProceed = step === 1 || (step === 2 && topic !== '');

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800 p-4 text-center">
            <div className="w-full max-w-2xl">
                <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">ברוכים הבאים!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">אני 'אישימתי', העוזר הדיגיטלי שלכם ללימודי מתמטיקה. בואו נגדיר ביחד את סביבת הלמידה.</p>

                <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg transition-all duration-500">
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6">שלב 1: הגדרת כיתה ורמה</h2>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <div className="flex-1">
                                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">כיתה</label>
                                    <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500">
                                        <option value="ז">ז'</option>
                                        <option value="ח">ח'</option>
                                        <option value="ט">ט'</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">רמת לימוד</label>
                                    <div className="grid grid-cols-2 gap-2 rounded-md p-1 bg-gray-200 dark:bg-gray-600">
                                        <button onClick={() => setLevel(StudyLevel.REGULAR)} className={`px-4 py-2 text-sm font-semibold rounded ${level === StudyLevel.REGULAR ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-200'}`}>רגילה</button>
                                        <button onClick={() => setLevel(StudyLevel.ADVANCED)} className={`px-4 py-2 text-sm font-semibold rounded ${level === StudyLevel.ADVANCED ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-200'}`}>מוגברת</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                         <div>
                            <h2 className="text-2xl font-semibold mb-6">שלב 2: בחירת נושא למידה</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {TOPICS.map(t => (
                                    <button key={t} onClick={() => setTopic(t)} className={`p-3 text-center text-sm font-medium border-2 rounded-lg transition-colors ${topic === t ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mt-8 flex justify-between items-center">
                         <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="px-6 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50">
                            חזור
                        </button>
                        <button onClick={handleNext} disabled={!canProceed} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                            {step === 1 ? 'המשך' : 'התחל ללמוד'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupScreen;
