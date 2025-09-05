import React, { useState, useEffect } from 'react';
import { User, Gender, Badge } from '../types';
import { useToast } from '../contexts/ToastContext';
import { LightbulbIcon, SparklesIcon, CrownIcon, BADGES } from '../constants';
import ProfileDetailCard from './ProfileDetailCard';
import type { ColorTheme } from '../constants';
import { optimizePhotoOrder, generateAppBackground } from '../services/geminiService';
import { SkeletonLoader } from './SkeletonLoader';

// --- START: BadgeDisplay Component ---
// Defined here to avoid creating new files as per constraints
export const BadgeDisplay: React.FC<{ badgeId: Badge['id']; showName?: boolean }> = ({ badgeId, showName = false }) => {
    const badge = BADGES[badgeId];
    if (!badge) return null;

    const BadgeIcon = badge.icon;

    return (
        <div className="relative group flex items-center gap-2">
            <div className="w-10 h-10 bg-dark-3 rounded-full flex items-center justify-center border-2 border-amber-400/50">
                 <BadgeIcon className="w-6 h-6 text-amber-400" />
            </div>
            {showName && <span className="font-semibold text-gray-300">{badge.name}</span>}
            <div className="absolute bottom-full mb-2 w-max max-w-xs left-1/2 -translate-x-1/2 bg-dark-3 text-white text-xs rounded-lg py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <p className="font-bold">{badge.name}</p>
                <p className="text-gray-400">{badge.description}</p>
            </div>
        </div>
    );
};
// --- END: BadgeDisplay Component ---


interface ProfileSettingsProps {
    currentUser: User;
    onSave: (updatedUser: User) => void;
    onGetFeedback: () => void;
    activeColorTheme: ColorTheme;
    onSignOut: () => void;
    onPremiumFeatureClick: () => void;
    onSetAppBackground: (background: string | null) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, onSave, onGetFeedback, activeColorTheme, onSignOut, onPremiumFeatureClick, onSetAppBackground }) => {
    const [formData, setFormData] = useState<User>(currentUser);
    const [newInterest, setNewInterest] = useState('');
    const { showToast } = useToast();
    const MAX_PHOTOS = 6;
    const [isOptimizingPhotos, setIsOptimizingPhotos] = useState(false);

    // State for background generation
    const [backgroundPrompt, setBackgroundPrompt] = useState('');
    const [generatedBackground, setGeneratedBackground] = useState<string | null>(null);
    const [isGeneratingBg, setIsGeneratingBg] = useState(false);

    useEffect(() => {
        setFormData(currentUser);
    }, [currentUser]);

    const isMaleTheme = currentUser.gender === Gender.Male;
    const primaryButtonGradient = isMaleTheme ? 'from-green-700 to-green-800' : 'from-brand-pink to-brand-purple';
    const primaryGlow = isMaleTheme ? 'hover:shadow-glow-green' : 'hover:shadow-glow-pink';
    const focusRingClass = isMaleTheme ? 'focus:ring-lime-500 focus:border-lime-500' : 'focus:ring-brand-pink focus:border-brand-pink';
    const checkboxClass = isMaleTheme ? 'text-green-600 focus:ring-green-600' : 'text-brand-pink focus:ring-brand-pink';
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) : value }));
    };
    
    const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        
        if (name === "interestedIn") {
            const currentInterests = formData.preferences.interestedIn;
            const newInterests = checked ? [...currentInterests, value as Gender] : currentInterests.filter(g => g !== value);
            setFormData(prev => ({...prev, preferences: { ...prev.preferences, interestedIn: newInterests }}));
        } else {
            setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, ageRange: { ...prev.preferences.ageRange, [name]: parseInt(value) } } }));
        }
    };

    const handleAddInterest = () => {
        if (newInterest && !formData.interests.includes(newInterest)) {
            setFormData(prev => ({ ...prev, interests: [...prev.interests, newInterest] }));
            setNewInterest('');
        }
    };

    const handleRemoveInterest = (interestToRemove: string) => {
        setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interestToRemove) }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (formData.photos.length >= MAX_PHOTOS) {
                showToast(`You can only have up to ${MAX_PHOTOS} photos.`, 'error');
                return;
            }
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                showToast('Please upload a valid image file.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photos: [...prev.photos, reader.result as string] }));
                showToast('Photo uploaded!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = (photoToRemove: string) => {
        setFormData(prev => ({ ...prev, photos: prev.photos.filter(p => p !== photoToRemove) }));
    };

    const handleOptimizePhotos = async () => {
        if (!currentUser.isPremium) {
            onPremiumFeatureClick();
            return;
        }

        if (formData.photos.length < 2) {
            showToast("You need at least two photos to optimize their order.", 'info');
            return;
        }

        setIsOptimizingPhotos(true);
        try {
            const reorderedPhotos = await optimizePhotoOrder(formData.photos);
            setFormData(prev => ({ ...prev, photos: reorderedPhotos }));
            showToast("Your photos have been optimized by AI!", 'success');
        } catch (error: any) {
            showToast(error.message || "Failed to optimize photos.", 'error');
        } finally {
            setIsOptimizingPhotos(false);
        }
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                showToast('Please upload a valid image file.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                onSetAppBackground(reader.result as string);
                showToast('Background updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateBackground = async (prompt: string) => {
        if (!prompt) {
            showToast('Please provide a prompt for the background.', 'error');
            return;
        }
        setIsGeneratingBg(true);
        setGeneratedBackground(null);
        try {
            const result = await generateAppBackground(prompt);
            setGeneratedBackground(result);
            showToast('AI background generated!', 'success');
        } catch (error: any) {
            showToast(error.message || "Failed to generate background.", 'error');
        } finally {
            setIsGeneratingBg(false);
        }
    };

    const handleGenerateFromProfile = () => {
        const prompt = `An atmospheric, abstract, beautiful background image suitable for a dating app, inspired by these themes: ${currentUser.interests.join(', ')}. Style: elegant, modern, subtle.`;
        handleGenerateBackground(prompt);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center mb-8 gap-4">
                 <h2 className={`text-3xl font-bold text-center bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>Edit Your Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 {/* Preview Column */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                    <div className="sticky top-28">
                        <h3 className="text-xl font-bold text-center mb-4 text-gray-300">Live Preview</h3>
                        <div className="aspect-[9/16] max-w-sm mx-auto shadow-2xl rounded-2xl overflow-hidden border-2 border-dark-3">
                             <ProfileDetailCard user={formData} />
                        </div>
                    </div>
                </div>

                {/* Form Column */}
                <div className="lg:col-span-3 bg-dark-2 p-8 rounded-2xl shadow-lg border border-dark-3 order-2 lg:order-1">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white ${focusRingClass} transition`} />
                            </div>
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                                <input type="number" id="age" name="age" value={formData.age} onChange={handleInputChange} className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white ${focusRingClass} transition`} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Bio</label>
                                <button type="button" onClick={onGetFeedback} className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 font-semibold">
                                    <LightbulbIcon className="w-4 h-4" />
                                    Get AI Feedback
                                </button>
                            </div>
                            <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white ${focusRingClass} transition`}></textarea>
                        </div>
                        
                        {/* Badges */}
                        <div className="pt-6 border-t border-dark-3">
                            <h3 className="text-xl font-semibold text-white mb-3">Your Badges</h3>
                            <div className="flex flex-wrap gap-4">
                                {(formData.earnedBadgeIds && formData.earnedBadgeIds.length > 0) ? formData.earnedBadgeIds.map(badgeId => (
                                    <BadgeDisplay key={badgeId} badgeId={badgeId} showName />
                                )) : <p className="text-gray-500">Earn badges by using the app!</p>}
                            </div>
                        </div>


                        {/* Photo Management */}
                        <div className="space-y-4 pt-6 border-t border-dark-3">
                             <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-white">Your Photos</h3>
                                <button
                                    type="button"
                                    onClick={handleOptimizePhotos}
                                    disabled={isOptimizingPhotos}
                                    className={`relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-wait ${isMaleTheme ? 'border-lime-500/50 text-lime-400 hover:bg-lime-500/10 hover:border-lime-500' : 'border-brand-pink/50 text-brand-light hover:bg-brand-pink/10 hover:border-brand-pink'}`}
                                >
                                    {!currentUser.isPremium && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                                            <CrownIcon className="w-2.5 h-2.5" />
                                        </div>
                                    )}
                                    <SparklesIcon className="w-4 h-4"/>
                                    {isOptimizingPhotos ? 'Optimizing...' : 'Optimize with AI'}
                                </button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {formData.photos.map((photo, index) => (
                                    <div key={photo} className="relative group">
                                        <img src={photo} alt={`Profile photo ${index + 1}`} className="w-full h-28 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(photo)}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Remove photo"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                {formData.photos.length < MAX_PHOTOS && (
                                    <>
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            className="hidden"
                                            accept="image/png, image/jpeg"
                                            onChange={handlePhotoUpload}
                                        />
                                        <label
                                            htmlFor="photo-upload"
                                            role="button"
                                            className="w-full h-28 bg-dark-3 rounded-lg flex items-center justify-center text-gray-400 hover:bg-dark-3/80 hover:text-white transition-colors cursor-pointer"
                                            aria-label="Add new photo"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* App Background */}
                        <div className="space-y-4 pt-6 border-t border-dark-3">
                            <h3 className="text-xl font-semibold text-white">App Background</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <button type="button" onClick={() => onSetAppBackground(null)} className="bg-dark-3 text-white py-2 rounded-lg font-semibold hover:bg-opacity-80 transition">Default</button>
                                <label htmlFor="background-upload" role="button" className="bg-dark-3 text-white text-center py-2 rounded-lg font-semibold hover:bg-opacity-80 transition cursor-pointer">Upload Your Own</label>
                                <input type="file" id="background-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleBackgroundUpload} />
                                <button type="button" onClick={handleGenerateFromProfile} className="bg-cyan-600 text-white py-2 rounded-lg font-semibold hover:bg-cyan-700 transition col-span-2 sm:col-span-1">AI Gen from Profile</button>
                            </div>
                             <div className="flex gap-2">
                                <input type="text" value={backgroundPrompt} onChange={e => setBackgroundPrompt(e.target.value)} placeholder="Describe a background..." className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white ${focusRingClass} transition`} />
                                <button type="button" onClick={() => handleGenerateBackground(backgroundPrompt)} disabled={isGeneratingBg} className="px-4 py-2 bg-brand-purple text-white rounded-lg flex items-center gap-2 font-semibold disabled:bg-opacity-50 disabled:cursor-wait hover:opacity-90 transition">
                                    <SparklesIcon className="w-5 h-5"/>
                                    {isGeneratingBg ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                             {(isGeneratingBg || generatedBackground) && (
                                <div className="p-3 bg-dark-3 rounded-lg">
                                    {isGeneratingBg && (
                                        <div className="flex flex-col items-center justify-center h-48">
                                            <SparklesIcon className="w-8 h-8 text-brand-purple animate-pulse mx-auto" />
                                            <p className="mt-2 text-gray-400">AI is creating your background...</p>
                                        </div>
                                    )}
                                    {generatedBackground && (
                                        <div className="flex flex-col items-center gap-3">
                                            <img src={generatedBackground} alt="AI generated background" className="w-full h-48 object-cover rounded-md" />
                                            <button type="button" onClick={() => onSetAppBackground(generatedBackground)} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">Set as Background</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Interests */}
                        <div className="pt-6 border-t border-dark-3">
                            <label className="block text-xl font-semibold text-white mb-3">Interests</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.interests.map(interest => (
                                    <span key={interest} className="flex items-center bg-dark-3 px-3 py-1 rounded-full text-sm">
                                        {interest}
                                        <button type="button" onClick={() => handleRemoveInterest(interest)} className="ml-2 text-gray-500 hover:text-white">&times;</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={newInterest} onChange={e => setNewInterest(e.target.value)} placeholder="Add an interest" className={`w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white ${focusRingClass} transition`} />
                                <button type="button" onClick={handleAddInterest} className={`px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition`}>Add</button>
                            </div>
                        </div>

                        {/* Dating Preferences */}
                        <div className="space-y-4 pt-6 border-t border-dark-3">
                            <h3 className="text-xl font-semibold text-white">I'm interested in...</h3>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" name="interestedIn" value={Gender.Male} checked={formData.preferences.interestedIn.includes(Gender.Male)} onChange={handlePreferenceChange} className={`w-5 h-5 rounded ${checkboxClass} bg-dark-3 border-dark-3`} />
                                    Males
                                </label>
                                 <label className="flex items-center gap-2">
                                    <input type="checkbox" name="interestedIn" value={Gender.Female} checked={formData.preferences.interestedIn.includes(Gender.Female)} onChange={handlePreferenceChange} className={`w-5 h-5 rounded ${checkboxClass} bg-dark-3 border-dark-3`} />
                                    Females
                                </label>
                            </div>

                            <h3 className="text-xl font-semibold text-white pt-4">Age Range</h3>
                            <div className="flex items-center gap-4">
                                 <input type="number" name="min" value={formData.preferences.ageRange.min} onChange={handlePreferenceChange} className={`w-24 bg-dark-3 border border-dark-3 rounded-lg p-3 text-white ${focusRingClass} transition`} />
                                 <span className="text-gray-400">to</span>
                                 <input type="number" name="max" value={formData.preferences.ageRange.max} onChange={handlePreferenceChange} className={`w-24 bg-dark-3 border border-dark-3 rounded-lg p-3 text-white ${focusRingClass} transition`} />
                            </div>
                        </div>
                        
                        <button type="submit" className={`w-full py-3 mt-4 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r ${primaryButtonGradient} text-white hover:opacity-90 ${primaryGlow}`}>Save Changes</button>
                        <button 
                            type="button" 
                            onClick={onSignOut}
                            className="w-full py-3 mt-4 rounded-lg font-bold transition-all duration-300 bg-dark-3 text-gray-400 hover:bg-red-900/50 hover:text-red-400"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;