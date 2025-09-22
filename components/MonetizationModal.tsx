import React, { useState, useEffect, useRef } from 'react';
import { CrownIcon, XIcon } from '../constants';

interface MonetizationModalProps {
    onClose: () => void;
    onUpgrade: () => void;
    currentUserId: number;
}

const FeatureListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-center gap-3">
        <div className="bg-green-500/20 p-1 rounded-full">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <span className="text-gray-300">{children}</span>
    </li>
);

const MonetizationModal: React.FC<MonetizationModalProps> = ({ onClose, onUpgrade, currentUserId }) => {
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayPalPayment = () => {
        // Direct PayPal.me payment to your @jluc92 account
        const paypalUrl = `https://www.paypal.me/jluc92/10.00`;
        
        // Open PayPal payment in new window
        window.open(paypalUrl, '_blank', 'width=600,height=700');
        
        // Show completion instructions
        setIsProcessing(true);
    };

    const handlePaymentComplete = () => {
        // Grant premium access after user confirms payment
        onUpgrade();
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="monetization-title"
        >
            <div 
                className="bg-dark-2 rounded-2xl w-full max-w-sm border border-dark-3 shadow-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-dark-2/0">
                    <div className="flex justify-center items-center gap-3 mb-3">
                        <CrownIcon className="w-8 h-8 text-yellow-400" />
                        <h2 id="monetization-title" className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">
                            Create-A-Date Premium
                        </h2>
                    </div>
                    <p className="text-center text-gray-400">
                        Supercharge your dating experience and get ahead of the competition.
                    </p>
                </div>
                
                <div className="p-6">
                    <ul className="space-y-4 mb-8">
                        <FeatureListItem>
                            <strong>Unlimited Recalls:</strong> Undo your last swipe.
                        </FeatureListItem>
                        <FeatureListItem>
                            <strong>AI-Powered Features:</strong> Full access to AI date planner, icebreakers, and more.
                        </FeatureListItem>
                         <FeatureListItem>
                            <strong>See Who Likes You:</strong> Unlock all your matches immediately.
                        </FeatureListItem>
                        <FeatureListItem>
                            <strong>Unlimited Messages:</strong> Chat without limits.
                        </FeatureListItem>
                    </ul>
                    
                    <div className="min-h-[120px] flex flex-col items-center justify-center">
                        {paymentError && (
                            <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                                {paymentError}
                                <button 
                                    onClick={() => setPaymentError(null)}
                                    className="ml-2 text-red-300 hover:text-red-100"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        
                        {isProcessing ? (
                            <div className="w-full space-y-4">
                                <div className="w-full p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 text-center">
                                    <p className="font-semibold">Payment Window Opened!</p>
                                    <p className="text-sm mt-2">Complete your $10.00 payment in the PayPal window, then click below:</p>
                                </div>
                                <button 
                                    onClick={handlePaymentComplete}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                                >
                                    ✅ I Completed the Payment
                                </button>
                                <button 
                                    onClick={() => setIsProcessing(false)}
                                    className="w-full py-2 text-gray-400 hover:text-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="w-full space-y-4">
                                <button 
                                    onClick={handlePayPalPayment}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition flex items-center justify-center gap-2"
                                >
                                    <span>💳</span>
                                    Pay $10.00 with PayPal
                                </button>
                                <div className="text-center text-gray-500 text-sm">
                                    Opens PayPal.me/jluc92 • Secure payment • Instant premium access
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={onClose} 
                        className="w-full mt-3 text-gray-500 font-semibold hover:text-gray-300 transition"
                        disabled={isProcessing}
                    >
                        Not Now
                    </button>
                </div>

                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-500 hover:text-white"
                    aria-label="Close"
                    disabled={isProcessing}
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default MonetizationModal;