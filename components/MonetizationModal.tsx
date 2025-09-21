import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CrownIcon, XIcon } from '../constants';
import { paymentService } from '../services/paymentService';

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

    const paypalOptions = {
        clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || "AT54qoA2eRHuZYwXQ2DnkJlITjoocB37A_jRllw",
        currency: "USD",
        intent: "capture"
    };

    const createOrder = async () => {
        try {
            setPaymentError(null);
            setIsProcessing(true);
            const order = await paymentService.createOrder(currentUserId);
            return order.orderId;
        } catch (error: any) {
            setPaymentError(error.message || 'Failed to create payment order');
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const onApprove = async (data: any) => {
        try {
            setIsProcessing(true);
            setPaymentError(null);
            
            const result = await paymentService.captureOrder(data.orderID, currentUserId);
            
            if (result.success) {
                onUpgrade();
                onClose();
            } else {
                setPaymentError('Payment capture failed. Please try again.');
            }
        } catch (error: any) {
            setPaymentError(error.message || 'Payment processing failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const onError = (error: any) => {
        console.error('PayPal payment error:', error);
        setPaymentError('Payment failed. Please try again.');
        setIsProcessing(false);
    };

    const onCancel = () => {
        setPaymentError('Payment was cancelled');
        setIsProcessing(false);
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
                            </div>
                        )}
                        
                        {isProcessing && (
                            <div className="w-full mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 text-sm text-center">
                                Processing payment...
                            </div>
                        )}
                        
                        <div className="w-full">
                            <PayPalScriptProvider options={paypalOptions}>
                                <PayPalButtons
                                    style={{
                                        layout: "horizontal",
                                        color: "blue",
                                        shape: "rect",
                                        label: "pay"
                                    }}
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={onError}
                                    onCancel={onCancel}
                                    disabled={isProcessing}
                                />
                            </PayPalScriptProvider>
                        </div>
                        
                        <div className="text-center text-gray-500 text-sm mt-2">
                            $10.00 USD - One-time payment
                        </div>
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