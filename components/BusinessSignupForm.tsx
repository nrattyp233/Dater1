import React, { useState } from 'react';
import { DateCategory } from '../types';
import { DATE_CATEGORIES } from '../constants';
import * as api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import type { ColorTheme } from '../constants';

interface BusinessSignupFormProps {
    activeColorTheme: ColorTheme;
}

const BusinessSignupForm: React.FC<BusinessSignupFormProps> = ({ activeColorTheme }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [category, setCategory] = useState<DateCategory>('Food & Drink');
    const [website, setWebsite] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !address || photos.length === 0) {
            showToast('Please fill all required fields and upload at least one photo.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.submitBusinessApplication({
                name,
                description,
                address,
                category,
                website,
                photos,
            });
            showToast('Application submitted! We will review it shortly.', 'success');
            // Reset form
            setName('');
            setDescription('');
            setAddress('');
            setCategory('Food & Drink');
            setWebsite('');
            setPhotos([]);
        } catch (error) {
            showToast('Failed to submit application. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotos(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="lg:pr-8">
                 <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>Partner with Create-A-Date</h2>
                 <p className="text-gray-300 mb-6">Drive more customers to your venue by featuring it as a premier date spot for thousands of users planning their next romantic outing.</p>
                 
                 <div className="bg-dark-2 p-6 rounded-2xl border border-dark-3">
                    <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
                    <ol className="space-y-4">
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center">1</div>
                            <div>
                                <h4 className="font-semibold text-gray-200">List for Free</h4>
                                <p className="text-sm text-gray-400">Sign up and create your business profile. There are no subscription fees to be featured on our platform.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center">2</div>
                            <div>
                                <h4 className="font-semibold text-gray-200">Offer a Deal</h4>
                                <p className="text-sm text-gray-400">Create an exclusive offer for our users (e.g., '20% off drinks'). This is optional but highly recommended to attract daters.</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center">3</div>
                            <div>
                                <h4 className="font-semibold text-gray-200">Pay for Performance</h4>
                                <p className="text-sm text-gray-400">We take a small 15% commission only when a user successfully redeems your offer on a date. You only pay for the customers we bring you.</p>
                            </div>
                        </li>
                    </ol>
                 </div>
            </div>
            <div className="bg-dark-2 p-8 rounded-2xl shadow-lg border border-dark-3">
                 <h3 className="text-2xl font-bold text-center text-white mb-6">Business Application</h3>
                 <form onSubmit={handleSubmit} className="space-y-6">
                     <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Business Name" required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink" />
                     <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={4} required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink"></textarea>
                     <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink" />
                     <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="Website (optional)" className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink" />
                     <select value={category} onChange={e => setCategory(e.target.value as DateCategory)} className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink">
                        {Object.keys(DATE_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload Photos</label>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-pink/20 file:text-brand-light hover:file:bg-brand-pink/30"/>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {photos.map((photo, index) => <img key={index} src={photo} className="w-16 h-16 rounded-md object-cover" />)}
                        </div>
                     </div>
                     <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 disabled:opacity-50`}>
                        {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                     </button>
                 </form>
            </div>
        </div>
    );
};

export default BusinessSignupForm;