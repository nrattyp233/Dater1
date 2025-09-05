import React, { useState, useEffect } from 'react';
import { User, Gender } from '../types';
import { useToast } from '../contexts/ToastContext';
import { LightbulbIcon } from '../constants';
import ProfileDetailCard from './ProfileDetailCard';
import type { ColorTheme } from '../constants';

interface ProfileSettingsProps {
    currentUser: User;
    onSave: (updatedUser: User) => void;
    onGetFeedback: () => void;
    activeColorTheme: ColorTheme;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, onSave, onGetFeedback, activeColorTheme }) => {
    const [formData, setFormData] = useState<User>(currentUser);
    const [newInterest, setNewInterest] = useState('');
    const { showToast } = useToast();
    const MAX_PHOTOS = 6;

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

    const handleAddPhoto = () => {
        if (formData.photos.length < MAX_PHOTOS) {
            const newPhotoUrl = `https://picsum.photos/seed/${formData.name}${Date.now()}/400/600`;
            setFormData(prev => ({ ...prev, photos: [...prev.photos, newPhotoUrl] }));
        } else {
            showToast(`You can only have up to ${MAX_PHOTOS} photos.`, 'error');
        }
    };

    const handleRemovePhoto = (photoToRemove: string) => {
        setFormData(prev => ({ ...prev, photos: prev.photos.filter(p => p !== photoToRemove) }));
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

                        {/* Photo Management */}
                        <div className="space-y-4 pt-6 border-t border-dark-3">
                            <h3 className="text-xl font-semibold text-white">Your Photos</h3>
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
                                    <button
                                        type="button"
                                        onClick={handleAddPhoto}
                                        className="w-full h-28 bg-dark-3 rounded-lg flex items-center justify-center text-gray-400 hover:bg-dark-3/80 hover:text-white transition-colors"
                                        aria-label="Add new photo"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                )}
                            </div>
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
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;