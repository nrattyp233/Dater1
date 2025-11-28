import React, { useState, useEffect } from 'react';
import { DatePost, User, Gender, LocationSuggestion, LocalEvent, Business, Deal } from '../types';
import { generateFullDateIdea, enhanceDateDescription, suggestLocations } from '../services/geminiService';
import { SparklesIcon, CrownIcon, MapPinIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';
import LocationSuggestionsModal from './LocationSuggestionsModal';
import type { ColorTheme } from '../constants';

interface CreateDateFormProps {
    onCreateDate: (newDate: Omit<DatePost, 'id' | 'createdBy' | 'applicants' | 'chosenApplicantId' | 'categories'>) => Promise<void>;
    onUpdateDate?: (updatedDate: DatePost) => Promise<void>;
    currentUser: User;
    activeColorTheme: ColorTheme;
    onPremiumFeatureClick: () => void;
    eventForDate: LocalEvent | null;
    onClearEventForDate: () => void;
    businessForDate: { business: Business, deal?: Deal } | null;
    onClearBusinessForDate: () => void;
    editingDate?: DatePost | null;
}

const CreateDateForm: React.FC<CreateDateFormProps> = ({ onCreateDate, onUpdateDate, currentUser, activeColorTheme, onPremiumFeatureClick, eventForDate, onClearEventForDate, businessForDate, onClearBusinessForDate, editingDate }) => {
    const [title, setTitle] = useState(editingDate?.title || '');
    const [idea, setIdea] = useState('');
    const [description, setDescription] = useState(editingDate?.description || '');
    const [location, setLocation] = useState(editingDate?.location || '');
    const [dateTime, setDateTime] = useState(editingDate?.dateTime || '');
    const [linkedBusinessId, setLinkedBusinessId] = useState(editingDate?.businessId || undefined);
    const [linkedDealId, setLinkedDealId] = useState(editingDate?.dealId || undefined);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingFull, setIsGeneratingFull] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    
    // New state for location suggestions
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

    const isMaleTheme = currentUser.gender === Gender.Male;
    const isEditMode = !!editingDate;
    
    const primaryButtonBg = isMaleTheme ? 'bg-green-700' : 'bg-brand-purple';
    const primaryButtonGradient = isMaleTheme ? 'from-green-700 to-green-800' : 'from-brand-pink to-brand-purple';
    const primaryGlow = isMaleTheme ? 'hover:shadow-glow-green' : 'hover:shadow-glow-pink';
    const focusRingClass = isMaleTheme ? 'focus:ring-lime-500 focus:border-lime-500' : 'focus:ring-brand-pink focus:border-brand-pink';

    useEffect(() => {
        if (eventForDate) {
            setTitle(eventForDate.title);
            const prefilledDescription = `Let's check out the "${eventForDate.title}" event! ${eventForDate.description}`;
            setDescription(prefilledDescription);
            setLocation(eventForDate.location);
            setIdea('');
            setLinkedBusinessId(undefined);
            setLinkedDealId(undefined);
            onClearEventForDate();
        }
    }, [eventForDate, onClearEventForDate]);

    useEffect(() => {
        if (businessForDate) {
            const { business, deal } = businessForDate;
            setTitle(`Date Night at ${business.name}`);
            let desc = `Let's have a date at ${business.name}! ${business.description}`;
            if (deal) {
                desc += `\n\nWe can even use their special offer: ${deal.title}! (${deal.description})`;
            }
            setDescription(desc);
            setLocation(business.address);
            setLinkedBusinessId(business.id);
            setLinkedDealId(deal?.id);
            setIdea('');
            onClearBusinessForDate();
        }
    }, [businessForDate, onClearBusinessForDate]);

    const handleGenerateFullDate = async () => {
        if (!currentUser.isPremium) {
            onPremiumFeatureClick();
            return;
        }
        setIsGeneratingFull(true);
        try {
            const { title, description, location } = await generateFullDateIdea(currentUser);
            setTitle(title);
            setDescription(description);
            setLocation(location);
            setIdea(''); // Clear the simple idea field as it's been superseded
            showToast("AI has planned a date for you!", 'success');
        } catch (error: any) {
            showToast(error.message || "Failed to generate date.", 'error');
        } finally {
            setIsGeneratingFull(false);
        }
    };

    const handleEnhance = async () => {
        if (!idea) {
            showToast("Please provide a simple date idea first.", 'error');
            return;
        }
        setIsGenerating(true);
        try {
            const enhancedDesc = await enhanceDateDescription(idea);
            setDescription(enhancedDesc);
            showToast("Description enhanced with AI!", 'success');
        } catch(error: any) {
            showToast(error.message || "Failed to generate description.", 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSuggestLocations = async () => {
        if (!title || !description) {
            showToast("Please provide a title and description for your date first.", 'error');
            return;
        }

        if (!currentUser.isPremium) {
            onPremiumFeatureClick();
            return;
        }

        setIsSuggestionsLoading(true);
        setSuggestionsError(null);
        setIsSuggestionsModalOpen(true);
        try {
            const result = await suggestLocations(title, description);
            setSuggestions(result);
        } catch (error: any) {
            setSuggestionsError(error.message || "Failed to get suggestions.");
        } finally {
            setIsSuggestionsLoading(false);
        }
    };
    
    const handleLocationSelect = (selectedLocation: string) => {
        setLocation(selectedLocation);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !description || !location || !dateTime) {
            showToast("Please fill all fields.", 'error');
            return;
        }
        setIsSubmitting(true);
        
        if (isEditMode && onUpdateDate && editingDate) {
            // Update existing date
            const updatedDate: DatePost = {
                ...editingDate,
                title,
                description,
                location,
                dateTime,
                businessId: linkedBusinessId,
                dealId: linkedDealId
            };
            await onUpdateDate(updatedDate);
            showToast('Date updated successfully!', 'success');
        } else {
            // Create new date
            await onCreateDate({ title, description, location, dateTime, businessId: linkedBusinessId, dealId: linkedDealId });
            showToast('Your date has been posted!', 'success');
        }
        
        // Reset form only if not in edit mode
        if (!isEditMode) {
            setTitle('');
            setIdea('');
            setDescription('');
            setLocation('');
            setDateTime('');
            setLinkedBusinessId(undefined);
            setLinkedDealId(undefined);
        }
        setIsSubmitting(false);
    };

    return (
        <>
            <div className="max-w-lg mx-auto bg-dark-2 p-6 rounded-2xl shadow-lg border border-dark-3">
                <h2 className={`text-2xl font-bold text-center mb-2 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>{isEditMode ? 'Edit Date' : 'Create-A-Date'}</h2>
                
                <div className="text-center mb-6">
                     <button 
                        type="button" 
                        onClick={handleGenerateFullDate} 
                        disabled={isGeneratingFull}
                        className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border-2 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-wait ${isMaleTheme ? 'border-lime-500/50 text-lime-400 hover:bg-lime-500/10 hover:border-lime-500' : 'border-brand-pink/50 text-brand-light hover:bg-brand-pink/10 hover:border-brand-pink'}`}
                    >
                         {!currentUser.isPremium && (
                            <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                                <CrownIcon className="w-3 h-3" />
                            </div>
                         )}
                         <SparklesIcon className="w-5 h-5"/>
                         {isGeneratingFull ? 'Generating...' : 'Generate with AI ✨'}
                     </button>
                </div>


                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="title" className="block text-xs font-medium text-gray-300 mb-1">Date Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Sunset Picnic in the Park" className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-1 text-white ${focusRingClass} transition`} />
                    </div>

                    <div>
                        <label htmlFor="idea" className="block text-xs font-medium text-gray-300 mb-1">Simple Idea (for AI description enhancement)</label>
                        <div className="flex gap-2">
                            <input type="text" id="idea" value={idea} onChange={e => setIdea(e.target.value)} placeholder="e.g., Coffee and a walk" className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-1 text-white ${focusRingClass} transition`} />
                            <button type="button" onClick={handleEnhance} disabled={isGenerating} className={`px-3 py-1 ${primaryButtonBg} text-white rounded-lg flex items-center gap-2 font-semibold disabled:bg-opacity-50 disabled:cursor-wait hover:opacity-90 transition`}>
                                <SparklesIcon className="w-4 h-4"/>
                                {isGenerating ? 'Enhancing...' : 'Enhance'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the date..." className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-2 text-white ${focusRingClass} transition`}></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                            <div className="flex gap-2">
                                <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Central Park" className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-2 text-white ${focusRingClass} transition`} />
                                <button
                                    type="button"
                                    onClick={handleSuggestLocations}
                                    className="relative px-3 py-2 bg-cyan-600/50 text-white rounded-lg flex items-center gap-2 font-semibold hover:bg-cyan-600/80 transition-colors disabled:opacity-50"
                                    aria-label="Suggest locations with AI"
                                >
                                    {!currentUser.isPremium && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                                            <CrownIcon className="w-3 h-3" />
                                        </div>
                                    )}
                                    <MapPinIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
                            <input type="datetime-local" id="dateTime" value={dateTime} onChange={e => setDateTime(e.target.value)} className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-2 text-white ${focusRingClass} transition`} />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className={`w-full py-2 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r ${primaryButtonGradient} text-white hover:opacity-90 ${primaryGlow} disabled:opacity-60 disabled:cursor-wait`}>
                        {isSubmitting ? (isEditMode ? 'Updating...' : 'Posting...') : (isEditMode ? 'Update Date' : 'Post Date')}
                    </button>
                </form>
            </div>
            <LocationSuggestionsModal
                isOpen={isSuggestionsModalOpen}
                isLoading={isSuggestionsLoading}
                suggestions={suggestions}
                error={suggestionsError}
                onClose={() => setIsSuggestionsModalOpen(false)}
                onSelect={handleLocationSelect}
                onRetry={handleSuggestLocations}
            />
        </>
    );
};

export default CreateDateForm;