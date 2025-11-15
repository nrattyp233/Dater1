

import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { CalendarIcon, BrainIcon, MapPinIcon, SparklesIcon, HeartIcon, XIcon, CheckCircleIcon, CrownIcon, StarIcon, UndoIcon, PlusIcon, TrophyIcon, ChatIcon, UserIcon, BuildingIcon, CogIcon } from '../constants';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-dark-2 p-6 rounded-2xl border border-dark-3 transform transition-transform duration-300 hover:-translate-y-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{children}</p>
    </div>
);

const AppMockup: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`aspect-[9/18.5] w-72 bg-dark-2 rounded-3xl border-4 border-dark-3 p-2 shadow-2xl shadow-brand-purple/20 ${className}`}>
        <div className="w-full h-full bg-dark-1 rounded-[20px] flex flex-col items-center justify-start text-center p-0 overflow-hidden">
            {children}
        </div>
    </div>
);


// --- EXACT REPLICA PREVIEWS ---
type PreviewView = 'Swipe' | 'Dates' | 'Create';

const PreviewNavButton: React.FC<{ isActive: boolean; children: React.ReactNode }> = ({ isActive, children }) => (
    <button className={`p-1 rounded-full transition-all duration-300 ${isActive ? `bg-brand-pink text-white` : 'text-gray-500'}`}>
        {children}
    </button>
);

const PreviewHeader: React.FC<{ activeView: PreviewView }> = ({ activeView }) => (
    <div className="w-full bg-dark-2/80 backdrop-blur-sm p-2 flex justify-between items-center flex-shrink-0 z-10 border-b border-dark-3">
        <div className="flex items-center gap-1.5">
            <div className="w-5 h-5">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F91880"/>
                    <path d="M12 6l1.06 2.54L15.5 9.5l-2.54 1.06L12 13l-1.06-2.54L8.5 9.5l2.54-1.06L12 6z" fill="white"/>
                </svg>
            </div>
            <h1 className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-cyan-400">
                Create-A-Date
            </h1>
        </div>
        <nav className="flex items-center space-x-0.5 bg-dark-3 p-0.5 rounded-full">
            <PreviewNavButton isActive={activeView === 'Swipe'}>
                <HeartIcon className="w-3.5 h-3.5" />
            </PreviewNavButton>
            <PreviewNavButton isActive={activeView === 'Dates'}>
                <CalendarIcon className="w-3.5 h-3.5" />
            </PreviewNavButton>
            <PreviewNavButton isActive={activeView === 'Create'}>
                <PlusIcon className="w-3.5 h-3.5" />
            </PreviewNavButton>
            <PreviewNavButton isActive={false}>
                <TrophyIcon className="w-3.5 h-3.5" />
            </PreviewNavButton>
            <PreviewNavButton isActive={false}>
                <ChatIcon className="w-3.5 h-3.5" />
            </PreviewNavButton>
            <PreviewNavButton isActive={false}>
                <UserIcon className="w-3.5 h-3.5" />
            </PreviewNavButton>
            <PreviewNavButton isActive={false}>
                <BuildingIcon className="w-3.5 h-3.5" />
            </PreviewNavButton>
            <PreviewNavButton isActive={false}>
                <CogIcon className="w-3.5 h-3.5" />
            </PreviewNavButton>
        </nav>
    </div>
);


const DateMarketplacePreview: React.FC = () => (
    <>
        <PreviewHeader activeView="Dates" />
        <div className="p-1.5 w-full space-y-1.5 overflow-y-auto scrollbar-hide flex-grow">
            <h2 className="text-base font-bold text-center bg-gradient-to-r from-brand-pink to-brand-purple text-transparent bg-clip-text">
                Date Marketplace
            </h2>
            {/* Date Card 1 - Replica of DateCard.tsx */}
            <div className="bg-dark-2 rounded-md p-2 flex flex-col gap-1 border border-dark-3 text-left">
                <div className="flex items-center gap-1.5">
                    <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=100" className="w-6 h-6 rounded-full object-cover"/>
                    <div>
                        <p className="font-semibold text-white text-[10px]">Diana, 29</p>
                        <p className="text-[10px] text-gray-500">Posted a date idea</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-brand-light">Stargazing & S'mores Night</h3>
                    <p className="text-[9px] text-gray-300 mt-0.5 line-clamp-2">Let's escape the city lights. I'll bring the telescope and s'mores if you bring a cozy blanket...</p>
                </div>
                <div className="flex flex-wrap gap-1">
                    <div className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Outdoors & Adventure</div>
                    <div className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">Relaxing & Casual</div>
                </div>
                <div className="mt-1 flex gap-1">
                    <button className="flex-1 text-[10px] py-1 rounded-sm font-bold bg-blue-600 text-white">I'm Interested!</button>
                    <button className="relative flex-1 text-[10px] py-1 rounded-sm font-bold bg-brand-light/20 text-brand-light flex items-center justify-center gap-1">
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md"><CrownIcon className="w-2 h-2" /></div>
                        <StarIcon className="w-2.5 h-2.5"/> Priority
                    </button>
                </div>
            </div>
            {/* Date Card 2 */}
             <div className="bg-dark-2 rounded-md p-2 flex flex-col gap-1 border border-dark-3 text-left">
                <div className="flex items-center gap-1.5">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" className="w-6 h-6 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-white text-[10px]">Alex, 28</p>
                        <p className="text-[10px] text-gray-500">Posted a date idea</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-brand-light">Competitive Board Games</h3>
                    <p className="text-[9px] text-gray-300 mt-0.5 line-clamp-2">Ready for a challenge? Let's battle it out over a game of Catan or Ticket to Ride. Loser buys...</p>
                </div>
                 <div className="mt-1 flex gap-1">
                    <button className="flex-1 text-[10px] py-1 rounded-sm font-bold bg-blue-600 text-white">I'm Interested!</button>
                    <button className="relative flex-1 text-[10px] py-1 rounded-sm font-bold bg-brand-light/20 text-brand-light flex items-center justify-center gap-1">
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md"><CrownIcon className="w-2 h-2" /></div>
                        <StarIcon className="w-2.5 h-2.5"/> Priority
                    </button>
                </div>
            </div>
            {/* Date Card 3 */}
             <div className="bg-dark-2 rounded-md p-2 flex flex-col gap-1 border border-dark-3 text-left">
                <div className="flex items-center gap-1.5">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" className="w-6 h-6 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-white text-[10px]">Brenda, 26</p>
                        <p className="text-[10px] text-gray-500">Posted a date idea</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-brand-light">Explore the Art Museum</h3>
                    <p className="text-[9px] text-gray-300 mt-0.5 line-clamp-2">Let's wander through the museum and pretend we're fancy art critics. Followed by a walk and ice cream.</p>
                </div>
                 <div className="mt-1 flex gap-1">
                    <button className="flex-1 text-[10px] py-1 rounded-sm font-bold bg-blue-600 text-white">I'm Interested!</button>
                    <button className="relative flex-1 text-[10px] py-1 rounded-sm font-bold bg-brand-light/20 text-brand-light flex items-center justify-center gap-1">
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md"><CrownIcon className="w-2 h-2" /></div>
                        <StarIcon className="w-2.5 h-2.5"/> Priority
                    </button>
                </div>
            </div>
        </div>
    </>
);

const AICreationPreview: React.FC = () => (
     <>
        <PreviewHeader activeView="Create" />
        <div className="p-2 w-full text-left space-y-2 flex-grow overflow-y-auto scrollbar-hide">
            <h2 className="text-lg font-bold text-center bg-gradient-to-r from-brand-pink to-brand-purple text-transparent bg-clip-text">
                Create-A-Date
            </h2>
            <button className="relative w-full text-xs font-semibold py-1.5 rounded-full flex items-center justify-center gap-1 border-2 border-brand-pink/50 text-brand-light hover:bg-brand-pink/10">
                <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full shadow-md"><CrownIcon className="w-2 h-2" /></div>
                <SparklesIcon className="w-3 h-3" />
                Generate with AI ✨
            </button>
            <div className="space-y-3">
                <div>
                    <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Date Title</label>
                    <input type="text" readOnly value="Sunset Picnic in the Park" className="w-full bg-dark-3 text-white text-xs p-1.5 rounded-md border border-dark-3 focus:ring-2 focus:ring-brand-pink" />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Simple Idea</label>
                    <div className="flex gap-1">
                        <input type="text" readOnly value="picnic" className="w-full bg-dark-3 text-white text-xs p-1.5 rounded-md border border-dark-3 focus:ring-2 focus:ring-brand-pink" />
                        <button className="bg-brand-pink text-white text-xs font-semibold px-2 rounded-md flex items-center justify-center gap-0.5"><SparklesIcon className="w-3 h-3"/>Enhance</button>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Description</label>
                    <textarea readOnly className="w-full bg-dark-3 text-white text-xs p-1.5 rounded-md h-16 resize-none border border-dark-3 focus:ring-2 focus:ring-brand-pink" value="Let's find a perfect spot to watch the sunset with some great food and even better conversation..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Location</label>
                        <div className="flex gap-1">
                            <input type="text" readOnly value="Central Park" className="w-full bg-dark-3 text-white text-xs p-1.5 rounded-md border border-dark-3 focus:ring-2 focus:ring-brand-pink" />
                            <button className="relative px-2 bg-cyan-600/50 rounded-md"><div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full"><CrownIcon className="w-2 h-2" /></div><MapPinIcon className="w-3 h-3 text-white"/></button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Date & Time</label>
                        <input type="text" readOnly value="10/27, 5:30 PM" className="w-full bg-dark-3 text-white text-xs p-1.5 rounded-md border border-dark-3 focus:ring-2 focus:ring-brand-pink" />
                    </div>
                </div>
                 <button className="w-full bg-gradient-to-r from-brand-pink to-brand-purple text-white text-sm font-bold py-2 rounded-lg">Post Date</button>
            </div>
        </div>
    </>
);

const SwipeDeckPreview: React.FC = () => (
    <>
        <PreviewHeader activeView="Swipe" />
        <div className="relative w-full flex-grow p-2">
            <div className="absolute inset-2 w-auto h-auto rounded-lg overflow-hidden bg-dark-2 select-none group">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800" alt="Brenda profile photo 1" className="w-full h-full object-cover" />

                <div className="absolute top-0 left-0 right-0 p-1 z-10 pointer-events-none">
                    <div className="flex gap-1">
                        <div className="h-0.5 flex-1 rounded-full bg-white/90"></div>
                        <div className="h-0.5 flex-1 rounded-full bg-white/40"></div>
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none rounded-lg" />
                
                <div className="absolute bottom-0 left-0 right-0 p-2 text-white pointer-events-none space-y-1">
                    <h2 className="text-lg font-bold flex items-center gap-1.5">
                        <span>Brenda, 26</span>
                    </h2>
                    <div className="min-h-[16px]">
                        <div className="flex items-center gap-1.5">
                            <SparklesIcon className="w-3 h-3 text-cyan-300 flex-shrink-0" />
                            <p className="text-[10px] italic text-cyan-200">"Creative & Adventurous"</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-light-2 line-clamp-2">Graphic designer with a love for all things vintage...</p>
                    <div className="flex flex-wrap gap-1">
                        <span className="bg-white/20 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">Art</span>
                        <span className="bg-white/20 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">Vintage</span>
                    </div>
                    
                    <div className="pt-1.5 border-t border-white/20">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
                            <SparklesIcon className="w-3.5 h-3.5" />
                            AI Vibe Check
                        </div>
                        <div className="mt-0.5">
                            <p className="text-[10px] text-gray-200 italic line-clamp-2">"You both seem to have a creative side..."</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-full bg-dark-3 rounded-full h-1.5">
                                    <div className="bg-gradient-to-r from-cyan-400 to-emerald-500 h-1.5 rounded-full" style={{ width: `82%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-white">82%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="w-full flex justify-center items-center gap-3 p-2 flex-shrink-0">
            <button className="bg-white/10 p-2 rounded-full text-amber-400"><UndoIcon className="w-4 h-4"/></button>
            <button className="bg-white/10 p-2.5 rounded-full text-red-500"><XIcon className="w-5 h-5"/></button>
            <button className="bg-white/10 p-2 rounded-full text-blue-400"><StarIcon className="w-4 h-4"/></button>
            <button className="bg-white/10 p-2.5 rounded-full text-green-400"><HeartIcon className="w-5 h-5"/></button>
        </div>
    </>
);


const LandingPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { showToast } = useToast();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.log('Email submitted for early access:', email);
            setIsSubmitted(true);
            showToast('Thank you! You\'re on the list for early access.', 'success');
        } else {
            showToast('Please enter a valid email address.', 'error');
        }
    };

    return (
        <div className="bg-dark-1 font-montserrat text-light-1 overflow-x-hidden">
            {/* Header */}
            <header className="py-4 px-6 md:px-12 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F91880"/>
                            <path d="M12 6l1.06 2.54L15.5 9.5l-2.54 1.06L12 13l-1.06-2.54L8.5 9.5l2.54-1.06L12 6z" fill="white"/>
                        </svg>
                    </div>
                    <h1 className="text-xl font-medium tracking-wide">Create-A-Date</h1>
                </div>
                <a href="#early-access" className="bg-brand-pink text-white font-semibold px-4 py-2 rounded-full text-sm hover:opacity-90 transition-opacity">
                    Get Early Access
                </a>
            </header>

            {/* Hero Section */}
            <section className="relative text-center py-20 md:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/10 to-dark-1 z-0 animate-hue-cycle"></div>
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#F91880 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-light to-white">
                        Stop Swiping. Start Dating.
                    </h2>
                    <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-xl mx-auto">
                        Tired of endless chats that go nowhere? Create-A-Date is the first app that puts the date first. Propose an idea, find someone interested, and actually meet up.
                    </p>
                    <form onSubmit={handleEmailSubmit} id="early-access" className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email for early access"
                            className="flex-grow bg-dark-3 border border-dark-3 rounded-full p-3 px-6 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition"
                            disabled={isSubmitted}
                        />
                        <button type="submit" disabled={isSubmitted} className="bg-brand-pink text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-glow-pink disabled:bg-gray-500 disabled:shadow-none">
                            {isSubmitted ? 'You\'re on the list!' : 'Get Notified'}
                        </button>
                    </form>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-dark-1">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">An entirely new way to date.</h2>
                    <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">We solve the biggest problems in online dating with features designed to get you on real, interesting dates.</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard icon={<CalendarIcon className="w-6 h-6 text-white"/>} title="The Date Marketplace">
                            Instead of just swiping, browse a feed of actual date ideas posted by people near you. Show your interest and get chosen.
                        </FeatureCard>
                        <FeatureCard icon={<BrainIcon className="w-6 h-6 text-white"/>} title="Your AI Wingman">
                            Never get stuck for words. Our AI helps you craft the perfect date description, generate witty icebreakers, and even suggests replies in chat.
                        </FeatureCard>
                        <FeatureCard icon={<MapPinIcon className="w-6 h-6 text-white"/>} title="Local Discovery">
                            Find cool, real-time local events—concerts, markets, workshops—and create a date post from them in one tap.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* Deep Dive 1 */}
            <section className="py-20 px-4 bg-dark-2/50">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-3xl font-bold mb-4">Plan First. Match Second.</h3>
                        <p className="text-gray-300 mb-4">
                            The "Date Marketplace" is our core feature. It flips the script on dating apps. By focusing on a shared activity, you connect with people based on genuine, shared interests from the very beginning.
                        </p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">✓ Filter for intent and initiative.</li>
                            <li className="flex items-center gap-2">✓ Eliminate the endless "talking stage".</li>
                            <li className="flex items-center gap-2">✓ Go on dates you're actually excited about.</li>
                        </ul>
                    </div>
                    <div className="flex justify-center">
                        <AppMockup>
                           <DateMarketplacePreview />
                        </AppMockup>
                    </div>
                </div>
            </section>
            
             {/* Deep Dive 2 */}
            <section className="py-20 px-4 bg-dark-1">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                     <div className="flex justify-center order-2 md:order-1">
                        <AppMockup>
                           <AICreationPreview />
                        </AppMockup>
                    </div>
                    <div className="order-1 md:order-2">
                        <h3 className="text-3xl font-bold mb-4">Overcome Dating Fatigue.</h3>
                        <p className="text-gray-300 mb-4">
                           Our suite of AI tools is like having a dating coach in your pocket. From enhancing your simple date ideas into compelling invitations to suggesting clever replies when you're stuck, we help you put your best foot forward.
                        </p>
                    </div>
                </div>
            </section>

            {/* Deep Dive 3 */}
            <section className="py-20 px-4 bg-dark-2/50">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-3xl font-bold mb-4">Familiar, But Better.</h3>
                        <p className="text-gray-300 mb-4">
                            Enjoy the classic swiping experience, supercharged with AI. Our "Vibe Check" gives you instant, AI-generated insights into a person's personality and your potential compatibility before you even swipe.
                        </p>
                    </div>
                    <div className="relative flex justify-center">
                        <AppMockup>
                           <SwipeDeckPreview />
                        </AppMockup>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-4 bg-dark-1 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-purple-500 to-cyan-400 bg-[length:200%_auto] animate-text-gradient-flow">
                        The Future of Dating is About Doing.
                    </h2>
                    <p className="mt-4 text-lg text-gray-300">
                        Be the first to experience a dating app that values your time and helps you create memories. Sign up now and we'll let you know the moment we launch.
                    </p>
                     <form onSubmit={handleEmailSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="flex-grow bg-dark-3 border border-dark-3 rounded-full p-3 px-6 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition"
                            disabled={isSubmitted}
                        />
                        <button type="submit" disabled={isSubmitted} className="bg-brand-pink text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-glow-pink disabled:bg-gray-500 disabled:shadow-none">
                            {isSubmitted ? '✓ On The List' : 'Get Early Access'}
                        </button>
                    </form>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="text-center py-6 px-4 bg-dark-2 border-t border-dark-3">
                <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Create-A-Date. All rights reserved. Let's make dating fun again.</p>
            </footer>

        </div>
    );
};

export default LandingPage;