import React, { useState } from 'react';
import { Business, Deal } from '../types';
import { XIcon, MapPinIcon } from '../constants';

interface BusinessDetailModalProps {
    business: Business | null;
    allDeals: Deal[];
    onClose: () => void;
    onCreateDate: (business: Business, deal?: Deal) => void;
}

const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({ business, allDeals, onClose, onCreateDate }) => {
    if (!business) return null;

    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const businessDeals = allDeals.filter(d => d.businessId === business.id);

    const handleNextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % business.photos.length);
    };

    const handlePrevPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev - 1 + business.photos.length) % business.photos.length);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="business-modal-title"
        >
            <div 
                className="bg-dark-2 rounded-2xl w-full max-w-lg flex flex-col border border-dark-3 shadow-lg overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                <div className="relative w-full h-64 bg-dark-3">
                    <img src={business.photos[currentPhotoIndex]} alt={business.name} className="w-full h-full object-cover"/>
                     {business.photos.length > 1 && (
                        <>
                            <button onClick={handlePrevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80">&lt;</button>
                            <button onClick={handleNextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80">&gt;</button>
                        </>
                    )}
                </div>

                <div className="p-6 flex-grow overflow-y-auto max-h-[calc(80vh-256px)]">
                    <h2 id="business-modal-title" className="text-3xl font-bold text-white">{business.name}</h2>
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold my-2">
                        <MapPinIcon className="w-5 h-5"/>
                        <span>{business.address}</span>
                    </div>
                    <p className="text-gray-300 mt-4">{business.description}</p>

                    {businessDeals.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-xl font-bold text-white mb-3">Exclusive Offers</h3>
                            <div className="space-y-3">
                                {businessDeals.map(deal => (
                                    <div key={deal.id} className="bg-dark-3 p-4 rounded-lg border border-yellow-400/20">
                                        <h4 className="font-bold text-yellow-400">{deal.title}</h4>
                                        <p className="text-sm text-gray-300">{deal.description}</p>
                                        <button 
                                            onClick={() => { onCreateDate(business, deal); onClose(); }}
                                            className="mt-3 w-full py-2 rounded-lg font-bold text-black bg-yellow-400 hover:bg-yellow-500 transition-colors"
                                        >
                                            Create Date with this Offer
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-dark-3 mt-auto">
                    <button 
                        onClick={() => { onCreateDate(business); onClose(); }} 
                        className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        Create-A-Date Here
                    </button>
                </div>

                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 bg-dark-3 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-dark-3/80"
                    aria-label="Close"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default BusinessDetailModal;