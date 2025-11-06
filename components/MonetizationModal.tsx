import React, { useState } from 'react';
import { CrownIcon, XIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';
// We would use the Supabase client to call our Edge Functions
// import { supabase } from '../services/supabaseClient';

interface MonetizationModalProps {
    onClose: () => void;
    onUpgrade: () => void;
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

const MonetizationModal: React.FC<MonetizationModalProps> = ({ onClose, onUpgrade }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paypalOrderID, setPaypalOrderID] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleCreateOrder = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // STEP 1: Call a server-side function to create a PayPal order.
            // This function would securely communicate with PayPal and store a 'PENDING'
            // order in your `paypal_orders` database table.
            //
            // Example of real code:
            // const { data, error } = await supabase.functions.invoke('create-paypal-order');
            // if (error) throw error;
            // setPaypalOrderID(data.orderID);

            // --- SIMULATION ---
            showToast('Connecting to payment service...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
            const mockOrderID = `SIMULATED_ORDER_${Date.now()}`;
            console.log("Simulated PayPal order created:", mockOrderID);
            setPaypalOrderID(mockOrderID);
            // --- END SIMULATION ---
        } catch (err: any) {
            console.error("Failed to create PayPal order:", err);
            const errorMessage = "Could not connect to PayPal. Please try again.";
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCaptureOrder = async () => {
        if (!paypalOrderID) return;
        setIsLoading(true);
        setError(null);
        try {
            // STEP 2: Call a server-side function to capture the payment.
            // This function confirms the payment with PayPal. If successful, it updates
            // the `paypal_orders` table status to 'COMPLETED' and updates the
            // `users` table to set `is_premium = true`.
            //
            // Example of real code:
            // const { error } = await supabase.functions.invoke('capture-paypal-order', {
            //     body: { orderID: paypalOrderID },
            // });
            // if (error) throw error;
            
            // --- SIMULATION ---
            showToast('Verifying your payment...', 'info');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
            console.log("Simulated PayPal order captured:", paypalOrderID);
            // --- END SIMULATION ---

            // Only if the server-side verification is successful, do we call onUpgrade.
            onUpgrade();

        } catch (err: any) {
            console.error("Failed to capture PayPal payment:", err);
            const errorMessage = "Payment verification failed. Please try again.";
            setError(errorMessage);
            showToast(errorMessage + " You have not been charged.", 'error');
            setPaypalOrderID(null); // Reset the flow
        } finally {
            setIsLoading(false);
        }
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
                    </ul>
                    
                    <div className="min-h-[76px] flex flex-col items-center justify-center">
                        {error && <p className="text-red-400 text-center text-sm mb-2">{error}</p>}

                        {!paypalOrderID ? (
                            <button 
                                onClick={handleCreateOrder}
                                disabled={isLoading}
                                className="w-full bg-[#0070ba] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#005ea6] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
                            >
                                {isLoading ? (
                                    'Connecting...'
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7.525 2.5h8.95c.588 0 .95.637.747 1.183l-1.99 5.308.204.075c1.23.454 2.055 1.55 2.055 2.822 0 1.65-1.34 2.99-2.99 2.99h-1.28c-.52 0-.964.388-1.03.905l-.33 2.64H8.818l.84-6.723c.06-.48-.31-.905-.79-.905H6.28c-1.65 0-2.99-1.34-2.99-2.99 0-1.47 1.058-2.69 2.455-2.93l.38-.065L7.525 2.5zm1.51 1.042H7.9l-1.12 2.986.32-.054c1.78-.3 3.32 1.01 3.32 2.805 0 .1-.01.2-.02.3l-.32 2.56h.97c.54 0 .99-.45.99-.99s-.45-.99-.99-.99h-.2L13.116 5.3l-4.08-1.758z"></path></svg>
                                        <span>Pay with PayPal</span>
                                    </>
                                )}
                            </button>
                        ) : (
                             <button 
                                onClick={handleCaptureOrder}
                                disabled={isLoading}
                                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
                            >
                                {isLoading ? 'Verifying Payment...' : 'Confirm Premium Purchase'}
                            </button>
                        )}
                    </div>

                    <button 
                        onClick={onClose} 
                        className="w-full mt-3 text-gray-500 font-semibold hover:text-gray-300 transition"
                    >
                        Not Now
                    </button>
                </div>

                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-500 hover:text-white"
                    aria-label="Close"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default MonetizationModal;