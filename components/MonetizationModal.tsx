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
    const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
    const paypalRef = useRef<HTMLDivElement>(null);

    // PayPal Client ID - Using the one from Netlify environment
    const PAYPAL_CLIENT_ID = "AT54qoA2eRHuZYwXQ2DnkJlITjoocB37A_jRllw";

    useEffect(() => {
        console.log('🔍 PayPal Client ID:', PAYPAL_CLIENT_ID);
        
        // Load PayPal SDK for LIVE/PRODUCTION mode
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
        script.async = true;
        
        script.onload = () => {
            console.log('✅ PayPal SDK loaded successfully');
            setIsPayPalLoaded(true);
            renderPayPalButton();
        };
        
        script.onerror = (error) => {
            console.error('❌ Failed to load PayPal SDK:', error);
            console.error('❌ PayPal SDK URL:', script.src);
            console.error('❌ Client ID used:', PAYPAL_CLIENT_ID);
            
            // Try a simpler SDK URL as fallback
            const fallbackScript = document.createElement('script');
            fallbackScript.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}`;
            fallbackScript.async = true;
            
            fallbackScript.onload = () => {
                console.log('✅ PayPal SDK loaded with fallback URL');
                setIsPayPalLoaded(true);
                renderPayPalButton();
            };
            
            fallbackScript.onerror = () => {
                setPaymentError('PayPal failed to load. Your Client ID might be invalid. Please contact support.');
            };
            
            document.body.appendChild(fallbackScript);
        };
        
        document.body.appendChild(script);
        
        return () => {
            // Cleanup
            try {
                document.body.removeChild(script);
            } catch (e) {
                // Ignore if already removed
            }
        };
    }, []);

    const renderPayPalButton = () => {
        console.log('🎯 Attempting to render PayPal button');
        console.log('🔍 window.paypal exists:', !!(window as any).paypal);
        console.log('🔍 paypalRef.current exists:', !!paypalRef.current);
        
        if (!(window as any).paypal || !paypalRef.current) {
            console.error('❌ PayPal or ref not available');
            return;
        }
        
        try {
            (window as any).paypal.Buttons({
                createOrder: function(data: any, actions: any) {
                    console.log('🔄 Creating PayPal order...');
                    return fetch('/.netlify/functions/payments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'createOrder',
                            payload: { userId: currentUserId }
                        })
                    }).then(function(res) {
                        return res.json();
                    }).then(function(orderData) {
                        console.log('✅ Order created:', orderData);
                        return orderData.orderId;
                    });
                },
                
                onApprove: function(data: any, actions: any) {
                    console.log('💳 Payment approved, capturing...');
                    return fetch('/.netlify/functions/payments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'captureOrder',
                            payload: { orderId: data.orderID, userId: currentUserId }
                        })
                    }).then(function(res) {
                        return res.json();
                    }).then(function(orderData) {
                        console.log('🎉 Payment result:', orderData);
                        if (orderData.success) {
                            // Payment successful!
                            onUpgrade();
                            onClose();
                            alert('🎉 Payment successful! You now have Premium access!');
                        } else {
                            setPaymentError('Payment failed. Please try again.');
                        }
                    });
                },
                
                onError: function(err: any) {
                    console.error('❌ PayPal error:', err);
                    setPaymentError('Payment failed. Please try again.');
                },
                
                onCancel: function(data: any) {
                    console.log('❌ Payment cancelled');
                    setPaymentError('Payment was cancelled.');
                }
                
            }).render(paypalRef.current);
            
            console.log('✅ PayPal button rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering PayPal button:', error);
            setPaymentError('Failed to initialize PayPal. Please refresh and try again.');
        }
    };

    const handlePaymentComplete = () => {
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
                                {isPayPalLoaded ? (
                                    <div>
                                        <div ref={paypalRef} className="w-full"></div>
                                        <div className="text-center text-gray-500 text-sm mt-2">
                                            Secure PayPal checkout • $10.00 USD • Instant premium access
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 text-center">
                                        Loading PayPal checkout...
                                    </div>
                                )}
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