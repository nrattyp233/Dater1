import React from 'react';
import { LocationSuggestion } from '../types';
import { MapPinIcon, XIcon, SparklesIcon } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';

interface LocationSuggestionsModalProps {
    isOpen: boolean;
    isLoading: boolean;
    suggestions: LocationSuggestion[];
    error: string | null;
    onClose: () => void;
    onSelect: (location: string) => void;
    onRetry: () => void;
}

const LocationSuggestionsModal: React.FC<LocationSuggestionsModalProps> = ({
    isOpen,
    isLoading,
    suggestions,
    error,
    onClose,
    onSelect,
    onRetry,
}) => {
    if (!isOpen) return null;

    const handleSelect = (suggestion: LocationSuggestion) => {
        onSelect(`${suggestion.name}, ${suggestion.address}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="location-suggestion-title">
            <div className="bg-dark-2 rounded-2xl w-full max-w-md p-6 border border-dark-3 shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="location-suggestion-title" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-500 text-transparent bg-clip-text">
                        AI Location Suggestions
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {isLoading && (
                    <div className="space-y-3 py-4" aria-live="polite">
                        {[...Array(3)].map((_, i) => (
                           <div key={i} className="flex items-center gap-3 bg-dark-3 p-3 rounded-lg">
                               <SkeletonLoader className="w-8 h-8 rounded-full flex-shrink-0" />
                               <div className="flex-1">
                                   <SkeletonLoader className="h-5 w-3/4 rounded" />
                                   <SkeletonLoader className="h-4 w-1/2 mt-2 rounded" />
                               </div>
                           </div>
                        ))}
                    </div>
                )}
                
                {error && (
                     <div className="text-center py-8 text-red-400" role="alert">
                        <p>Oops! Could not get suggestions.</p>
                        <p className="text-sm">{error}</p>
                        <button onClick={onRetry} className="mt-4 bg-brand-pink text-white px-4 py-2 rounded-lg font-semibold">Try Again</button>
                    </div>
                )}

                {!isLoading && !error && suggestions.length > 0 && (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {suggestions.map((suggestion, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleSelect(suggestion)}
                                className="w-full text-left bg-dark-3 p-4 rounded-lg flex items-start gap-4 hover:bg-dark-3/80 transition-colors"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <MapPinIcon className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{suggestion.name}</p>
                                    <p className="text-sm text-gray-400">{suggestion.address}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                 {!isLoading && !error && suggestions.length === 0 && (
                     <div className="text-center py-8 text-gray-400">
                        <p>No suggestions found for this idea.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationSuggestionsModal;