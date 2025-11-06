import React, { useState, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/api';
import { SkeletonLoader } from './SkeletonLoader';
import { CrownIcon } from '../constants';
import type { ColorTheme } from '../constants';

interface LeaderboardViewProps {
    activeColorTheme: ColorTheme;
    onViewProfile: (user: User) => void;
}

type LeaderboardUser = User & { score: number };

const LeaderboardRow: React.FC<{ user: LeaderboardUser, rank: number, onViewProfile: (user: User) => void }> = ({ user, rank, onViewProfile }) => {
    const isTopThree = rank <= 3;
    let rankColor = 'text-gray-400';
    if (rank === 1) rankColor = 'text-yellow-400';
    if (rank === 2) rankColor = 'text-gray-300';
    if (rank === 3) rankColor = 'text-orange-400';

    return (
        <div className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${isTopThree ? 'bg-dark-3' : ''}`}>
            <div className={`w-10 text-center text-xl font-bold ${rankColor}`}>{rank}</div>
            <button onClick={() => onViewProfile(user)} className="flex items-center gap-4 flex-grow text-left hover:opacity-80 transition-opacity">
                <img src={user.photos[0]} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-grow">
                    <p className="font-semibold text-white flex items-center gap-2">
                        {user.name}
                        {rank === 1 && <CrownIcon className="w-5 h-5 text-yellow-400" />}
                    </p>
                    <p className="text-sm text-gray-400">{user.score.toLocaleString()} points</p>
                </div>
            </button>
        </div>
    );
};

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ activeColorTheme, onViewProfile }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const data = await api.getLeaderboard();
                setLeaderboard(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const Skeleton = () => (
        <div className="flex items-center p-3">
            <SkeletonLoader className="w-10 h-8 rounded-md" />
            <div className="flex items-center gap-4 flex-grow ml-4">
                <SkeletonLoader className="w-12 h-12 rounded-full" />
                <div className="flex-grow">
                    <SkeletonLoader className="h-5 w-1/3 rounded" />
                    <SkeletonLoader className="h-4 w-1/4 mt-2 rounded" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-2 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>
                Top Planners
            </h2>
            <p className="text-center text-gray-400 mb-8">See who's creating the most popular dates this week.</p>

            <div className="bg-dark-2 p-4 rounded-2xl border border-dark-3 space-y-2">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                ) : (
                    leaderboard.map((user, index) => (
                        <LeaderboardRow key={user.id} user={user} rank={index + 1} onViewProfile={onViewProfile} />
                    ))
                )}
            </div>
        </div>
    );
};

export default LeaderboardView;
