import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// --- Helper for API calls ---
const PROD_API_URL = "https://ai-music-recommender-backend.onrender.com" // <-- REPLACE THIS WITH YOUR RENDER URL
const DEV_API_URL = 'http://localhost:5000';
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('192');
const api = axios.create({ baseURL: isProduction ? PROD_API_URL : DEV_API_URL });

const setAuthToken = (token) => {
    if (token) api.defaults.headers.common['x-auth-token'] = token;
    else delete api.defaults.headers.common['x-auth-token'];
};

// --- Mock Data ---
const languages = ["Any", "Hindi", "English", "Bengali", "Punjabi", "Tamil", "Telugu", "Other"];
const genres = ["Any", "Bollywood", "Pop", "Rock", "Hip-Hop", "Indie", "Classical", "Folk", "Electronic", "Other"];
const moods = ["Any", "Happy", "Sad", "Energetic", "Calm", "Romantic", "Melancholic", "Other"];
const themes = ["Any", "Love", "Friendship", "Travel", "Party", "Motivation", "Heartbreak", "Other"];
const occasions = ["Any", "Workout", "Studying", "Road Trip", "Dinner Party", "Relaxing at Home", "Other"];
const eras = ["Any", "2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "Other"];

// --- Modal Component ---
const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-400">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            {children}
        </div>
    </div>
);

// --- Full-Screen Auth Page Component ---
const AuthPage = ({ setToken, setView, initialMode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const googleAuthUrl = `${isProduction ? PROD_API_URL : DEV_API_URL}/auth/google`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { name, email, password };
        try {
            const res = await api.post(endpoint, payload);
            setToken(res.data.token);
            setView('main');
        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'An error occurred';
            setError(errorMsg);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        🎵 AI Music Recommender
                    </h1>
                    <p className="text-gray-400 mt-2">{isLogin ? 'Welcome back!' : 'Create an account'}</p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                             <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                        )}
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                        <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full p-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition">{isLogin ? 'Login' : 'Register'}</button>
                    </form>
                    <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-800 text-gray-400">OR</span></div></div>
                    <a href={googleAuthUrl} className="w-full p-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.904 36.162 44 30.638 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                        <span>Continue with Google</span>
                    </a>
                </div>
                <button onClick={() => setView('main')} className="mt-6 text-gray-400 hover:text-white transition">&larr; Back to Guest View</button>
            </div>
        </div>
    );
};


const CustomizableDropdown = ({ label, name, dropdownValue, textValue, options, onDropdownChange, onTextChange }) => {
    const isOtherSelected = dropdownValue === 'Other';
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-400">{label}</label>
            <select id={name} name={name} value={dropdownValue || 'Any'} onChange={onDropdownChange} className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
                {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            {isOtherSelected && (
                <input type="text" name={name} value={textValue} onChange={onTextChange} placeholder={`Specify ${label.toLowerCase()}...`} className="mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
            )}
        </div>
    );
};


function App() {
    const [criteria, setCriteria] = useState({ language: '', genre: '', mood: '', theme: '', occasion: '', era: '', artist: '', culturalOrigin: '' });
    const [customCriteria, setCustomCriteria] = useState({ language: '', genre: '', mood: '', theme: '', occasion: '', era: '' });
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentSearch, setCurrentSearch] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [history, setHistory] = useState([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [artistModal, setArtistModal] = useState({ isVisible: false, artistName: '', bio: '', isLoading: false });
    const [view, setView] = useState('main');
    const [userProfile, setUserProfile] = useState(null);
    const [authMode, setAuthMode] = useState('login');
    const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
    const [isAutoplayOn, setIsAutoplayOn] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);

    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            window.onYouTubeIframeAPIReady = () => {};
            const firstScriptTag = document.getElementsByTagName('script')[0];
            if (firstScriptTag) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            } else {
                document.head.appendChild(tag);
            }
        }
    }, []);

    useEffect(() => {
        if (currentTrackIndex !== null && recommendations[currentTrackIndex]?.youtube_url && window.YT) {
            const videoId = recommendations[currentTrackIndex].youtube_url.split('/embed/')[1];
            if (playerRef.current && playerRef.current.loadVideoById) {
                playerRef.current.loadVideoById(videoId);
            } else {
                playerRef.current = new window.YT.Player('youtube-player', {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: { 'autoplay': 1, 'controls': 1 },
                    events: { 'onStateChange': onPlayerStateChange }
                });
            }
        }
    }, [currentTrackIndex]);

    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
        else setIsPlaying(false);
        if (event.data === window.YT.PlayerState.ENDED && isAutoplayOn) handleNextSong();
    };

    const handlePlayVideo = (index) => setCurrentTrackIndex(index);

    const handleTogglePlayPause = () => {
        if (!playerRef.current || !playerRef.current.getPlayerState) return;
        const playerState = playerRef.current.getPlayerState();
        if (playerState === window.YT.PlayerState.PLAYING) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
    };

    const handleNextSong = () => {
        setCurrentTrackIndex(prevIndex => (prevIndex === null || prevIndex >= recommendations.length - 1) ? prevIndex : prevIndex + 1);
    };

    const handlePreviousSong = () => {
        setCurrentTrackIndex(prevIndex => (prevIndex === null || prevIndex <= 0) ? prevIndex : prevIndex - 1);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        setAuthToken(token);
        setIsAuthenticated(!!token);
        if (token) {
            localStorage.setItem('token', token);
            const fetchUserProfile = async () => {
                try {
                    const res = await api.get('/api/auth/me');
                    setUserProfile(res.data);
                } catch (err) {
                    console.error("Could not fetch user profile, token might be expired.", err);
                    handleLogout();
                }
            };
            fetchUserProfile();
        } else {
            localStorage.removeItem('token');
            setUserProfile(null);
        }
    }, [token]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (!params.get('token') && params.toString()) {
            const criteriaFromUrl = {};
            for (const [key, value] of params.entries()) criteriaFromUrl[key] = value;
            setCriteria(prev => ({ ...prev, ...criteriaFromUrl }));
            handleRequest('/api/recommendations', criteriaFromUrl);
            localStorage.removeItem('musicRecommenderState');
        } else if (!params.get('token')) {
            const savedState = localStorage.getItem('musicRecommenderState');
            if (savedState) {
                try {
                    const { recommendations, currentSearch, currentTrackIndex, criteria, customCriteria } = JSON.parse(savedState);
                    setRecommendations(recommendations || []);
                    setCurrentSearch(currentSearch || null);
                    setCurrentTrackIndex(currentTrackIndex !== undefined ? currentTrackIndex : null);
                    setCriteria(criteria || { language: '', genre: '', mood: '', theme: '', occasion: '', era: '', artist: '', culturalOrigin: '' });
                    setCustomCriteria(customCriteria || { language: '', genre: '', mood: '', theme: '', occasion: '', era: '' });
                } catch (e) {
                    console.error("Failed to parse saved state", e);
                    localStorage.removeItem('musicRecommenderState');
                }
            }
        }
    }, []);

    useEffect(() => {
        if (recommendations.length > 0 || currentSearch) {
            const stateToSave = { recommendations, currentSearch, currentTrackIndex, criteria, customCriteria };
            localStorage.setItem('musicRecommenderState', JSON.stringify(stateToSave));
        }
    }, [recommendations, currentSearch, currentTrackIndex, criteria, customCriteria]);

    const handleDropdownChange = (e) => setCriteria(prev => ({ ...prev, [e.target.name]: e.target.value === "Any" ? "" : e.target.value }));
    const handleCustomTextChange = (e) => setCustomCriteria(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleTextChange = (e) => setCriteria(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const buildFinalPayload = (payload) => {
        const finalPayload = { ...payload };
        for (const key in customCriteria) {
            if (finalPayload[key] === 'Other') finalPayload[key] = customCriteria[key];
        }
        return finalPayload;
    };
    const handleRequest = async (url, payload) => {
        setIsLoading(true);
        setError(null);
        setRecommendations([]);
        setCurrentTrackIndex(null);
        const finalPayload = buildFinalPayload(payload);
        setCurrentSearch(finalPayload);
        try {
            const response = await api.post(url, finalPayload);
            if (response.data.error) setError(response.data.error);
            else {
                const tracks = response.data.recommendations || response.data;
                setRecommendations(tracks);
                if (response.data.criteria) setCriteria(prev => ({ ...prev, ...response.data.criteria }));
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleMoreSongs = async () => {
        if (!currentSearch) return;
        setIsMoreLoading(true);
        setError(null);
        const excludeList = recommendations.map(track => `${track.song} by ${track.artist}`);
        const payload = { ...currentSearch, excludeList };
        try {
            const response = await api.post('/api/recommendations', payload);
            if (response.data.error) setError(response.data.error);
            else setRecommendations(prev => [...prev, ...response.data]);
        } catch (err) {
            setError('An error occurred while fetching more songs.');
        } finally {
            setIsMoreLoading(false);
        }
    };
    const handleSubmit = (e) => { e.preventDefault(); handleRequest('/api/recommendations', criteria); };
    const handleFeelingLucky = () => handleRequest('/api/lucky', {});
    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('musicRecommenderState');
        setRecommendations([]);
        setCurrentTrackIndex(null);
        setCurrentSearch(null);
        handleReset();
    };
    const handleViewHistory = async () => {
        if (!isAuthenticated) return setView('auth');
        setIsHistoryVisible(true);
        try {
            const res = await api.get('/api/playlists');
            setHistory(res.data);
        } catch (err) {
            setError("Could not fetch history. Your session might have expired. Please log in again.");
        }
    };
    const handleSavePlaylist = async () => {
        if (!isAuthenticated) return setView('auth');
        const playlistName = prompt("Enter a name for this playlist:", "My Awesome Mix");
        if (playlistName && currentSearch && recommendations.length > 0) {
            const payload = { name: playlistName, criteria: currentSearch, songs: recommendations };
            try {
                await api.post('/api/playlists', payload);
                alert('Playlist saved to your account!');
            } catch (err) {
                alert('Failed to save playlist. Your session might have expired.');
            }
        }
    };
    const handleShare = () => {
        if (!currentSearch) return;
        const params = new URLSearchParams(Object.fromEntries(Object.entries(currentSearch).filter(([_, v]) => v !== ''))).toString();
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params}`;
        navigator.clipboard.writeText(shareUrl).then(() => alert('Share link copied!'), () => alert('Failed to copy link.'));
    };
    const handleViewArtist = async (artistName) => {
        setArtistModal({ isVisible: true, artistName, bio: '', isLoading: true });
        try {
            const response = await api.post('/api/artist-bio', { artistName });
            setArtistModal({ isVisible: true, artistName, bio: response.data.bio, isLoading: false });
        } catch (err) {
            setArtistModal({ isVisible: true, artistName, bio: 'Could not fetch biography.', isLoading: false });
        }
    };
    const handleReset = () => {
        setCriteria({ language: '', genre: '', mood: '', theme: '', occasion: '', era: '', artist: '', culturalOrigin: '' });
        setCustomCriteria({ language: '', genre: '', mood: '', theme: '', occasion: '', era: '' });
    };
    const getWatchUrl = (embedUrl) => embedUrl ? embedUrl.replace('/embed/', '/watch?v=') : '';

    if (view === 'auth') {
        return <AuthPage setToken={setToken} setView={setView} initialMode={authMode} />;
    }

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6">
                <div className="w-full max-w-4xl mx-auto">
                    <header className="text-center my-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex-1 text-center sm:text-left">
                          {isAuthenticated && userProfile ? (
                              <div className="flex items-center justify-center sm:justify-start space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg">
                                      {userProfile.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-white hidden md:inline">{userProfile.name}</span>
                                  <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-full text-sm transition">Logout</button>
                              </div>
                          ) : (
                              <div className="flex items-center justify-center sm:justify-start space-x-2">
                                <button onClick={() => { setAuthMode('login'); setView('auth'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition">Login</button>
                                <button onClick={() => { setAuthMode('register'); setView('auth'); }} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full text-sm transition">Register</button>
                              </div>
                          )}
                        </div>
                      <div className="flex-1 order-first sm:order-none">
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                          🎵 AI Music Recommender
                        </h1>
                        <p className="text-gray-400 mt-2">Craft your perfect playlist</p>
                      </div>
                      <div className="flex-1 text-center sm:text-right">
                          <button onClick={handleViewHistory} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full text-sm transition">
                            History
                          </button>
                      </div>
                    </header>

                    <main>
                        <form onSubmit={handleSubmit} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 mb-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              <CustomizableDropdown label="Language" name="language" dropdownValue={criteria.language} textValue={customCriteria.language} options={languages} onDropdownChange={handleDropdownChange} onTextChange={handleCustomTextChange} />
                              <CustomizableDropdown label="Genre" name="genre" dropdownValue={criteria.genre} textValue={customCriteria.genre} options={genres} onDropdownChange={handleDropdownChange} onTextChange={handleCustomTextChange} />
                              <CustomizableDropdown label="Mood" name="mood" dropdownValue={criteria.mood} textValue={customCriteria.mood} options={moods} onDropdownChange={handleDropdownChange} onTextChange={handleCustomTextChange} />
                              <CustomizableDropdown label="Theme" name="theme" dropdownValue={criteria.theme} textValue={customCriteria.theme} options={themes} onDropdownChange={handleDropdownChange} onTextChange={handleCustomTextChange} />
                              <CustomizableDropdown label="Occasion" name="occasion" dropdownValue={criteria.occasion} textValue={customCriteria.occasion} options={occasions} onDropdownChange={handleDropdownChange} onTextChange={handleCustomTextChange} />
                              <CustomizableDropdown label="Era / Decade" name="era" dropdownValue={criteria.era} textValue={customCriteria.era} options={eras} onDropdownChange={handleDropdownChange} onTextChange={handleCustomTextChange} />
                              <div className="flex flex-col">
                                  <label htmlFor="culturalOrigin" className="mb-1 text-sm font-medium text-gray-400">Cultural Origin / Region</label>
                                  <input type="text" id="culturalOrigin" name="culturalOrigin" value={criteria.culturalOrigin} onChange={handleTextChange} placeholder="e.g., Rajasthani Folk, K-Pop" className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"/>
                              </div>
                              <div className="flex flex-col">
                                  <label htmlFor="artist" className="mb-1 text-sm font-medium text-gray-400">Similar to Artist</label>
                                  <input type="text" id="artist" name="artist" value={criteria.artist} onChange={handleTextChange} placeholder="e.g., A.R. Rahman" className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"/>
                              </div>
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                              <button type="submit" disabled={isLoading} className="w-full p-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-600">
                                  {isLoading ? 'Thinking...' : 'Get Recommendations'}
                              </button>
                              <button type="button" onClick={handleFeelingLucky} disabled={isLoading} className="w-full p-3 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 transition disabled:bg-gray-600">
                                  ✨ Feeling Lucky?
                              </button>
                          </div>
                          <div className="flex justify-center mt-4">
                              <button type="button" onClick={handleReset} className="text-gray-400 hover:text-white transition text-sm underline">
                                  Reset Form
                              </button>
                          </div>
                        </form>

                        {isLoading && <div className="text-center text-gray-400">Loading...</div>}
                        {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}

                        {recommendations.length > 0 && !isLoading && (
                            <div className="my-6">
                                {currentTrackIndex !== null && (
                                    <div className="max-w-2xl mx-auto aspect-video mb-4">
                                        <div id="youtube-player" className="w-full h-full rounded-lg shadow-lg"></div>
                                    </div>
                                )}
                                <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                                    <button onClick={handlePreviousSong} disabled={currentTrackIndex === 0 || currentTrackIndex === null} className="disabled:opacity-50 disabled:cursor-not-allowed text-white bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14.03V5.969a1 1 0 00-1.555-.832L4.12 8.445a1 1 0 000 1.664l4.325 3.723zM15.555 14.832a1 1 0 001.555-.832V5.969a1 1 0 00-1.555-.832L11.23 8.445a1 1 0 000 1.664l4.325 3.723z"></path></svg>
                                    </button>
                                    <button onClick={handleTogglePlayPause} disabled={currentTrackIndex === null} className="disabled:opacity-50 disabled:cursor-not-allowed text-white bg-purple-600 hover:bg-purple-500 rounded-full p-4 transition">
                                        {isPlaying ? (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                                        )}
                                    </button>
                                     <button onClick={handleNextSong} disabled={currentTrackIndex === recommendations.length - 1 || currentTrackIndex === null} className="disabled:opacity-50 disabled:cursor-not-allowed text-white bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 5.168A1 1 0 0010 5.969v8.062a1 1 0 001.555.832l4.325-3.723a1 1 0 000-1.664l-4.325-3.723zM4.445 5.168A1 1 0 003 5.969v8.062a1 1 0 001.555.832l4.325-3.723a1 1 0 000-1.664L4.445 5.168z"></path></svg>
                                    </button>
                                    <div className="flex items-center ml-4">
                                       <button onClick={() => setIsAutoplayOn(!isAutoplayOn)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 ${isAutoplayOn ? 'bg-purple-600' : 'bg-gray-600'}`}>
                                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isAutoplayOn ? 'translate-x-6' : 'translate-x-1'}`} />
                                       </button>
                                       <label className="ml-3 font-medium text-gray-300 hidden sm:block">Autoplay</label>
                                    </div>
                                </div>
                            </div>
                        )}
                        {recommendations.length > 0 && !isLoading && (
                          <div className="flex justify-center space-x-4 mb-4">
                               <button onClick={handleSavePlaylist} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition">Save Playlist</button>
                               <button onClick={handleShare} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition">Share</button>
                          </div>
                        )}
                        <div className="space-y-4">
                          {recommendations.map((track, index) => {
                            const isPlaying = index === currentTrackIndex;
                            return (
                                <div key={`${track.song}-${index}`} className={`p-4 rounded-lg border shadow-lg flex flex-col space-y-4 transition-all ${isPlaying ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-800/50 border-gray-700'}`}>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                      <div className="flex items-center space-x-4">
                                          <div className="text-2xl text-purple-400 font-bold min-w-[2rem] text-center">{index + 1}</div>
                                          <div>
                                              <h3 className={`text-xl font-bold ${isPlaying ? 'text-purple-300' : 'text-white'}`}>{track.song}</h3>
                                              <button onClick={() => handleViewArtist(track.artist)} className="text-gray-300 hover:underline cursor-pointer text-left">{track.artist}</button>
                                          </div>
                                      </div>
                                      <div className="flex items-center space-x-2 self-end sm:self-center w-full sm:w-auto">
                                          {track.youtube_url ? (
                                              <>
                                              <button onClick={() => handlePlayVideo(index)} className="flex-grow w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition">Play</button>
                                              <a href={getWatchUrl(track.youtube_url)} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition text-sm flex items-center space-x-2">
                                                 <svg role="img" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                                  <span className="hidden sm:inline">Open</span>
                                              </a>
                                              </>
                                          ) : (
                                              <button disabled className="w-full bg-gray-600 text-gray-400 font-semibold py-2 px-4 rounded-full text-sm cursor-not-allowed">Preview Not Found</button>
                                          )}
                                      </div>
                                  </div>
                                </div>
                            );
                          })}
                        </div>
                        {recommendations.length > 0 && !isLoading && (
                          <div className="flex justify-center mt-8">
                              <button onClick={handleMoreSongs} disabled={isMoreLoading} className="w-full sm:w-1/2 p-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition disabled:bg-gray-800 disabled:cursor-wait">
                                  {isMoreLoading ? 'Loading More...' : 'More Songs'}
                              </button>
                          </div>
                        )}
                    </main>
                </div>
            </div>
            {isHistoryVisible && ( <Modal title="Playlist History" onClose={() => setIsHistoryVisible(false)}> <div className="space-y-4 max-h-96 overflow-y-auto">{history.length > 0 ? history.map((item) => (<div key={item._id} className="bg-gray-700 p-3 rounded-lg"><h3 className="font-bold text-lg">{item.name}</h3><p className="text-sm text-gray-400">Saved on {new Date(item.date).toLocaleDateString()}</p><button onClick={() => { setRecommendations(item.songs); setCurrentTrackIndex(null); setIsHistoryVisible(false); }} className="text-sm mt-2 text-purple-400 hover:underline">View Playlist</button></div>)) : <p>You haven't saved any playlists to your account yet.</p>}</div></Modal> )}
            {artistModal.isVisible && ( <Modal title={`About ${artistModal.artistName}`} onClose={() => setArtistModal({ isVisible: false, artistName: '', bio: '', isLoading: false })}>{artistModal.isLoading ? <p>Loading bio...</p> : <p className="text-gray-300">{artistModal.bio}</p>}</Modal> )}
        </>
    );
}

export default App;

