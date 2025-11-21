
import React, { useState } from 'react';
import { XIcon, AlertTriangleIcon } from '../constants';

interface ReportModalProps {
    onClose: () => void;
    onReport: (reason: string, blockUser: boolean) => void;
    userName: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onReport, userName }) => {
    const [reason, setReason] = useState('');
    const [blockUser, setBlockUser] = useState(true);

    const reasons = [
        "Harassment or bullying",
        "Inappropriate content",
        "Fake profile / Spam",
        "Underage user",
        "Solicitation",
        "Other"
    ];

    const handleSubmit = () => {
        if (reason) {
            onReport(reason, blockUser);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-dark-2 rounded-2xl w-full max-w-sm border border-dark-3 shadow-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                        <AlertTriangleIcon className="w-6 h-6" />
                        Report User
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-gray-300 mb-4">Why are you reporting <span className="font-bold text-white">{userName}</span>?</p>
                
                <div className="space-y-2 mb-6">
                    {reasons.map((r) => (
                        <button 
                            key={r}
                            onClick={() => setReason(r)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${reason === r ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-dark-3 text-gray-300 hover:bg-dark-3/80'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 mb-6 p-3 bg-dark-3 rounded-lg">
                    <input 
                        type="checkbox" 
                        id="blockUser" 
                        checked={blockUser} 
                        onChange={e => setBlockUser(e.target.checked)}
                        className="w-5 h-5 rounded text-red-500 focus:ring-red-500 bg-dark-2 border-gray-600"
                    />
                    <label htmlFor="blockUser" className="text-sm text-gray-200">Block {userName} as well</label>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-500">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!reason}
                        className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
