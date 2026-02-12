import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Menu, X, ArrowLeft, ArrowRight, ChevronDown, ChevronRight,
    Fingerprint, Star, Eye, EyeOff, Edit, Trash2,
    Settings, User, Palette, Layout, Layers, Upload,
    Image as ImageIcon, Music, Video, Play, ExternalLink,
    Lock, Plus, Save, RotateCw, Monitor
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';

// --- INITIAL DATA & CONFIG ---

const DEFAULT_CONFIG = {
    siteTitle: "JOURDAN ALEXZANDER | Fine Art",
    heroTitle: "JOURDAN ALEXZANDER",
    heroSubtitle: "The Portfolio of",
    heroTagline: "Multidisciplinary Artist · Experiential Designer · Founder of Orion Aura / Pulseora",
    heroVideo: "https://youtu.be/8xLUjE5Qnag",
    heroBtnText: "View Collection",
    heroBtnLink: "#archive",
    logoUrl: "",
    theme: "warm",
    accentColor: "#C4A484",
    epkUrl: "",
    bioName: "Jourdan Alexzander",
    bioImg: "https://lh3.googleusercontent.com/d/1LNQC2J3Gp97TScYJrDN8jtK3i5M2wXk2=w1000",
    stmtHook: "Jourdan Alexzander is a multidisciplinary artist and experiential creator whose work fuses abstract expressionism, street-influenced mark-making, sacred geometry, sound, and architectural thinking into immersive visual narratives exploring consciousness, place, and frequency.",
    bioShort: "Jourdan Alexzander is a California-based multidisciplinary artist working across painting, mixed media, sound, spatial design, and experiential environments. His visual work blends abstract expressionism, street-influenced techniques, and psychedelic symbolism, often incorporating heavy texture, bold color fields, and cosmic or lunar motifs inspired by the landscapes of Northern California and the Sierra Nevada.",
    bioLong: "Jourdan Alexzander is a multidisciplinary artist and creative director whose practice spans painting, mixed media, architectural environments, sound, and immersive systems. Rooted in abstract expressionism and street-art methodologies, his visual language is defined by thick textural surfaces, layered mark-making, and vibrant chromatic tension.<br><br>Many works explore lunar symbolism, sacred geometry, and energetic landscapes—often referencing Lake Tahoe, desert environments, and the liminal space between nature and consciousness.<br><br>Beyond his work as a multi-media artist, Jourdan is the founder of Orion Aura / Pulseora, an experimental ecosystem combining architecture, lighting, sound design, and locally controlled AI systems.",
    stmtHead: "Bridging the gap between the digital void and physical permanence.",
    email: "paintfrsh@gmail.com",
    phone: "",
    collectorInfo: "For catalogue requests, exhibition availability, commission, or collaboration, please contact the artist.",
    driveUrl: "",
    layout: [
        { id: 'statement', visible: true, name: "Artist Statement" },
        { id: 'featured', visible: true, name: "Featured Carousel" },
        { id: 'exhibitions', visible: false, name: "Exhibitions List" },
        { id: 'press', visible: false, name: "Press / Quotes" },
        { id: 'archive', visible: true, name: "Work Archive" },
        { id: 'bio', visible: true, name: "Biography" },
        { id: 'contact', visible: true, name: "Contact Footer" }
    ],
    layoutSettings: {
        featured: { display: "carousel", order: [], style: "glitch" },
        archive: { display: "masonry", showTitles: true, showCategories: true }
    },
    archiveCats: ["Mixed Media", "Digital"]
};

const INITIAL_PORTFOLIO = [
    { id: '1', title: "Sound Vortex - Light Play", category: "Digital", type: "video", year: 2025, medium: "Mixed on canvas, light play, video", image: "https://youtu.be/8xLUjE5Qnag", desc: "Multi-colored light-play on Sound Vortex.", featured: false, source: 'manual', hidden: false },
    { id: '2', title: "Love A Little", category: "Mixed Media", type: "image", year: 2025, medium: "Mixed media on canvas.", image: "https://drive.google.com/file/d/1B8Nj1QGU_maZF6TZZ8fqK_HfDCXWHSly/view?usp=drive_link", desc: "Love A Little presents a layered field of color, pressure, and repeated gesture in which symbols, partial figures, and looping marks emerge through dense surface activity. The composition is built through rhythmic abrasion and overpainting, allowing vivid pigment to move across matte texture in waves rather than fixed forms. Linear marks and fragmented glyphs suggest communication without resolution, while the palette oscillates between warmth and tension. Rather than illustrating sentiment, the work treats love as provisional—constructed, disrupted, and reassembled through movement, repetition, and visual interference.", featured: false, hidden: false, source: 'manual' },
    { id: '3', title: "Creature Statement", category: "Mixed Media", type: "image", year: 2025, medium: "Mixed media on canvas", image: "https://drive.google.com/file/d/1hHkI7rM0KMGCRKnW5rzXCMYAdvKkItNX/view?usp=drive_link", desc: "Creature Statement centers on a fractured, face-like presence that emerges through layers of vivid color, abrasion, and gestural mark-making. Embedded eyes anchor the composition, establishing a point of recognition within an otherwise volatile field of motion, drips, and looping lines. The surface oscillates between control and disruption, where matte texture absorbs light while saturated and fluorescent marks activate and shift across environments. Rather than resolving into a fixed figure, the work presents identity as unstable—constructed through signal, movement, and perception—inviting the viewer to encounter the image as an evolving presence rather than a portrait.", featured: true, source: 'manual', hidden: false },
    { id: '4', title: "No Kings", category: "Mixed Media", type: "image", year: 2025, medium: "Mixed media on canvas", image: "https://drive.google.com/file/d/179pImnf2jVJ4ARBLt7CPfO0MicGv-NBH/view?usp=drive_link", desc: "No Kings presents language as an active visual element rather than a declarative message. Built on a dense, matte, sculptural surface, the work layers vivid pigment, graffiti-informed text, and symbolic marks into a compressed, high-energy field. Phrases and fragments—“No Kings,” “Love Power,” “Trust,” “Level Up”—appear, overlap, and partially dissolve, functioning as signals embedded within the composition rather than fixed statements. Color and texture work in tension, with saturated marks activating against absorptive surfaces, causing the painting to shift as light and viewing distance change. The piece operates as a charged visual environment where hierarchy, language, and perception remain deliberately unstable.", featured: true, source: 'manual', hidden: false },
    { id: '5', title: "SAMO LIVES ON", category: "Mixed Media", type: "image", year: 2025, medium: "Mixed media on canvas", image: "https://drive.google.com/file/d/1B5IvoOlNcOUfHeDIJPRemXI5o1mKDeOb/view?usp=drive_link", desc: "SAMO LIVES ON is a contemporary homage to Jean-Michel Basquiat and the enduring impact of his early SAMO graffiti practice. Centered on a fractured, skull-like visage rendered through layered line, color, and text, the work engages street-derived mark-making as both visual language and cultural signal. Words, phrases, and symbols appear as interruptions rather than declarations, echoing Basquiat’s use of language as rhythm, provocation, and resistance to fixed meaning.", featured: true, source: 'manual', hidden: false },
    { id: '6', title: "Sound Vortex", category: "Mixed Media", type: "image", year: 2025, medium: "Mixed media on canvas", image: "https://drive.google.com/file/d/1kZM7aCRpWbg3C-M_3lUFMAiwUl-Doij4/view?usp=drive_link", desc: "Sound Vortex operates as a dense field of color, gesture, and symbolic interruption. Matte texture absorbs light while saturated pigment, drips, and fluorescent marks activate the surface, creating a sense of motion that shifts with proximity and environment. Street-informed mark-making collides with abstract forms, glyphs, and fragmented symbols, producing a visual rhythm that feels both improvised and controlled. Rather than resolving into a single image, the work functions as a dynamic system—where color, texture, and movement circulate continuously, echoing the experience of sound translated into visual form.", featured: true, source: 'manual', hidden: false },
    { id: '7', title: "Sushi", category: "Mixed Media", type: "image", year: 2025, medium: "Mixed media on canvas", image: "https://drive.google.com/file/d/1L2n_mkNmwvsPyKeZJMVSQl7qvw4HsajS/view?usp=drive_link", desc: "Sushi is constructed through aggressive gesture and stark chromatic contrast, where black and red marks cut across a raw, exposed ground. Broad, sweeping strokes collide with sharp linear interruptions, creating a sense of velocity and compression across the surface. The composition oscillates between control and rupture, with repeated directional marks suggesting slicing, layering, and reassembly rather than representation. The work resists narrative resolution, functioning instead as a visceral study of movement, pressure, and reduction—where form emerges through action and immediacy.", featured: true, source: 'manual', hidden: false },
    { id: '8', title: "Untitled", category: "Mixed Media", type: "image", year: 2025, medium: "Mixed media on canvas", image: "https://drive.google.com/file/d/12w90ABs0JKC4Mylw4YHB9mEdWCSgYrvI/view?usp=drive_link", desc: "Untitled presents a layered field of glyph-like forms, saturated color, and gestural linework operating as a visual language rather than a readable code. Dense patterning and matte surfaces absorb light, while fluorescent marks, drips, and sweeping arcs activate the composition, shifting with proximity and environment. The work moves between structure and improvisation, where repeated symbols suggest systems of communication without fixed translation. Rather than resolving into hierarchy or narrative, the painting functions as a dynamic visual network—responsive, unstable, and continuously in flux.", featured: true, source: 'manual', hidden: false },
];

const THEMES = {
    warm: { bg: "#F9F8F6", text: "#1C1C1C", secondary: "#9CA3AF" },
    dark: { bg: "#121212", text: "#E5E5E5", secondary: "#555555" },
    light: { bg: "#FFFFFF", text: "#000000", secondary: "#CCCCCC" },
    bauhaus: { bg: "#F0F0F0", text: "#111111", secondary: "#3B55A6" }
};

// --- HELPER FUNCTIONS ---

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const processUrl = (url) => {
    if (!url) return '';
    const drivePattern = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(drivePattern);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
};

// --- SUB-COMPONENTS ---

const MediaRenderer = ({ item, className, context = 'grid' }) => {
    const processedUrl = processUrl(item.image);
    const youtubeId = getYoutubeId(processedUrl);

    if (youtubeId) {
        if (context === 'modal') {
            return <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`} className={`${className} aspect-video`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>;
        }
        return (
            <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-700">
                <img src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`} className={className} onError={(e) => e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                        <Play className="text-white ml-1 w-5 h-5" fill="white" />
                    </div>
                </div>
            </div>
        );
    }

    const isVideoFile = item.type === 'video';
    const isAudio = item.type === 'audio';

    if (isVideoFile) {
        if (context === 'modal') return <video src={processedUrl} className={`${className} max-h-[85vh] w-full object-contain`} controls autoPlay />;
        return <video src={processedUrl} className={`${className} group-hover:scale-105 transition-transform duration-700`} autoPlay muted loop playsInline />;
    }

    if (isAudio) {
        if (context === 'modal') {
            return (
                <div className="w-full flex flex-col items-center justify-center bg-gray-900 p-10 rounded-lg text-white">
                    <Music className="text-6xl mb-6 text-[var(--accent-color)] w-24 h-24" />
                    <audio src={processedUrl} controls className="w-full"></audio>
                    <p className="mt-4 font-serif text-2xl">{item.title}</p>
                </div>
            );
        }
        return (
            <div className="w-full h-full min-h-[300px] bg-gray-900 flex flex-col items-center justify-center text-white relative group overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/sound-waves.png')]"></div>
                <div className="relative z-10 p-6 text-center">
                    <Music className="text-4xl mb-4 text-[var(--accent-color)] mx-auto" />
                    <h4 className="font-serif text-lg">{item.title}</h4>
                    <span className="text-[10px] uppercase tracking-widest mt-2 block opacity-70">Audio Track</span>
                </div>
            </div>
        );
    }

    // Image Fallback
    return (
        <img
            src={processedUrl || 'https://placehold.co/400x500?text=No+Image'}
            alt={item.title}
            className={`${className} ${context !== 'modal' ? 'group-hover:scale-105 transition-transform duration-700' : ''}`}
        />
    );
};

const Navbar = ({ config, activeSection, onNavigate, onMobileToggle, mobileMenuOpen }) => {
    return (
        <>
            <nav className="fixed w-full z-50 transition-all duration-300 py-6">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <a href="#" className="text-2xl font-serif font-bold tracking-widest uppercase mix-blend-difference text-white flex items-center gap-3">
                        {config.logoUrl ? (
                            <img src={config.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <span>FRSH PAINT</span>
                        )}
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8 mix-blend-difference text-white">
                        {config.layout.filter(s => s.visible).map(section => {
                            let label = section.name;
                            if (section.id === 'featured') label = 'Experience';
                            if (section.id === 'archive') label = 'Art';
                            if (section.id === 'bio') label = 'About';
                            if (section.id === 'statement') label = 'I Am';
                            if (section.id === 'contact') label = 'Contact';
                            if (section.id === 'exhibitions') label = 'Events';
                            if (section.id === 'press') label = 'Press';
                            return (
                                <a key={section.id} href={`#${section.id}`} className="hover:text-[var(--accent-color)] transition-colors text-sm tracking-widest uppercase">
                                    {label}
                                </a>
                            )
                        })}
                        <a href="#contact" className="hover:text-[var(--accent-color)] transition-colors ml-4 cursor-pointer text-sm">
                            <Fingerprint className="w-6 h-6" />
                        </a>
                    </div>

                    {/* Mobile Menu Btn */}
                    <button onClick={onMobileToggle} className="md:hidden text-white mix-blend-difference focus:outline-none">
                        <Menu className="w-8 h-8" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-black/95 z-50 transform transition-transform duration-300 flex flex-col justify-center items-center space-y-8 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {config.layout.filter(s => s.visible).map(section => {
                    let label = section.name;
                    if (section.id === 'featured') label = 'Experience';
                    if (section.id === 'archive') label = 'Art';
                    if (section.id === 'bio') label = 'About';
                    if (section.id === 'statement') label = 'I Am';
                    if (section.id === 'contact') label = 'Contact';
                    if (section.id === 'exhibitions') label = 'Events';
                    if (section.id === 'press') label = 'Press';
                    return (
                        <a key={section.id} href={`#${section.id}`} onClick={onMobileToggle} className="text-white text-2xl font-serif">
                            {label}
                        </a>
                    )
                })}
                <a href="#contact" onClick={onMobileToggle} className="text-gray-500 hover:text-white transition-colors mt-8">
                    <Fingerprint className="w-8 h-8" />
                </a>
                <button onClick={onMobileToggle} className="absolute top-6 right-6 text-white">
                    <X className="w-8 h-8" />
                </button>
            </div>
        </>
    );
};

const Hero = ({ config }) => {
    const videoId = getYoutubeId(config.heroVideo);

    return (
        <header id="hero" className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute inset-0 bg-gray-900"></div>
                <div className="video-bg-container absolute top-0 left-0 w-full h-full pointer-events-none opacity-60">
                    {videoId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1`}
                            className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        />
                    ) : (
                        <video autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover">
                            <source src={processUrl(config.heroVideo)} type="video/mp4" />
                        </video>
                    )}
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>

            <div className="relative z-20 text-center text-white px-4 animate-fade-in">
                <p className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 text-gray-300">{config.heroSubtitle}</p>
                <h1 className="text-5xl md:text-8xl font-serif font-bold mb-6 tracking-tight">{config.heroTitle}</h1>
                <p className="text-lg md:text-xl font-light tracking-wide text-gray-200 max-w-2xl mx-auto">{config.heroTagline}</p>
                <div className="mt-12">
                    <a href={config.heroBtnLink} className="border border-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300">
                        {config.heroBtnText}
                    </a>
                </div>
            </div>
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
                <a href="#statement" className="text-white opacity-50 hover:opacity-100 transition-opacity">
                    <ChevronDown className="w-8 h-8" />
                </a>
            </div>
        </header>
    );
};

// --- SECTIONS ---

const SectionStatement = ({ config }) => (
    <section id="statement" className="py-24 px-6 md:px-20 text-center max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[var(--accent-color)] uppercase mb-4">Vision</h2>
            <h3 className="text-3xl md:text-4xl font-serif mb-8 text-[var(--text-color)]">{config.stmtHead}</h3>
            <div className="text-gray-600 leading-relaxed text-lg mb-8" dangerouslySetInnerHTML={{ __html: config.stmtHook }}></div>
            <div className="w-16 h-1 bg-[var(--accent-color)] mx-auto"></div>
        </div>
    </section>
);

const SectionFeatured = ({ config, items, openModal }) => {
    const scrollRef = useRef(null);

    const featuredItems = useMemo(() => {
        let list = items.filter(i => i.featured && !i.hidden);
        const order = config.layoutSettings.featured?.order || [];
        if (order.length > 0) {
            list.sort((a, b) => {
                const idxA = order.indexOf(a.id);
                const idxB = order.indexOf(b.id);
                if (idxA === -1 && idxB === -1) return 0;
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
            });
        }
        return list;
    }, [items, config]);

    const style = config.layoutSettings.featured?.style || 'glitch';

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' });

    return (
        <section id="featured" className="py-20 bg-[var(--bg-color)] overflow-hidden border-t border-gray-200/50 w-full">
            <div className="px-6 md:px-12 mb-10 flex flex-col md:flex-row justify-between items-center md:items-end max-w-7xl mx-auto text-center md:text-left">
                <div className="mb-6 md:mb-0">
                    <h2 className="text-3xl font-serif">Selected Works</h2>
                    <p className="text-sm text-gray-500 mt-2">Curated highlights from the artist's collection.</p>
                </div>
                <div className="flex space-x-4 hidden md:flex">
                    <button onClick={scrollLeft} className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                    <button onClick={scrollRight} className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors"><ArrowRight className="w-5 h-5" /></button>
                </div>
            </div>

            <div
                ref={scrollRef}
                id="carousel-track"
                className={style === 'glitch'
                    ? "flex flex-col md:flex-row w-full overflow-x-auto scroll-smooth no-scrollbar"
                    : "flex flex-col md:flex-row space-y-16 md:space-y-0 md:space-x-8 px-6 md:px-12 pb-8 overflow-x-auto scroll-smooth no-scrollbar md:h-[60vh] md:min-h-[500px] items-center md:items-stretch w-full"
                }
            >
                {featuredItems.length === 0 ? (
                    <p className="text-gray-400 italic px-6">No featured works selected.</p>
                ) : featuredItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => openModal(item)}
                        className={style === 'glitch'
                            ? "flex-none w-screen md:w-auto h-screen md:h-full group cursor-pointer relative snap-center md:mr-8 mb-0 flex justify-center items-center overflow-hidden"
                            : "flex-none w-full md:w-auto h-auto md:h-full group cursor-pointer relative snap-center md:mr-8 mb-16 md:mb-0 flex justify-center items-center"
                        }
                    >
                        {style === 'glitch' ? (
                            <div className="relative w-full h-full shadow-lg bg-gray-900">
                                <MediaRenderer item={item} className="w-full h-full object-cover transform scale-125 hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                                    <h3 className="text-lg font-serif font-bold text-white shadow-black drop-shadow-md">{item.title}</h3>
                                </div>
                            </div>
                        ) : (
                            <div className="relative shadow-lg bg-gray-100 w-full md:w-auto md:h-full flex justify-center">
                                <MediaRenderer item={item} className="w-full h-auto max-h-[70vh] md:h-full md:w-auto object-contain md:object-cover" />
                                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                                    <h3 className="text-lg font-serif font-bold text-white shadow-black drop-shadow-md">{item.title}</h3>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

const SectionExhibitions = () => (
    <section id="exhibitions" className="py-20 px-6 md:px-12 bg-white w-full">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-xs font-bold tracking-[0.2em] text-[var(--accent-color)] uppercase mb-4">On View</h2>
                <h3 className="text-4xl font-serif text-[var(--text-color)]">Exhibitions & Events</h3>
            </div>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center border-b border-gray-100 pb-6 hover:bg-gray-50 p-4 transition-colors">
                    <div className="w-full md:w-1/4 text-center md:text-left mb-2 md:mb-0">
                        <span className="block text-2xl font-serif font-bold text-[var(--text-color)]">OCT 14</span>
                        <span className="text-xs uppercase tracking-widest text-gray-400">2025</span>
                    </div>
                    <div className="w-full md:w-2/4 text-center md:text-left mb-4 md:mb-0">
                        <h4 className="text-xl font-bold mb-1">Pulseora Launch</h4>
                        <p className="text-sm text-gray-500 italic">Immersive Audio-Visual Installation</p>
                    </div>
                    <div className="w-full md:w-1/4 text-center md:text-right">
                        <span className="inline-block border border-gray-300 px-6 py-2 text-xs uppercase tracking-widest">San Francisco</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const SectionPress = () => (
    <section id="press" className="py-24 px-6 bg-[var(--text-color)] text-white w-full">
        <div className="max-w-4xl mx-auto text-center">
            <div className="text-4xl text-[var(--accent-color)] mb-8 opacity-50 font-serif">“</div>
            <blockquote className="font-serif text-2xl md:text-4xl italic leading-relaxed mb-8">
                "Alexzander’s work reflects neither environment directly, but carries both sensibilities: the
                immediacy of the city alongside the spatial awareness of wide-open terrain."
            </blockquote>
            <cite className="text-sm uppercase tracking-[0.2em] text-gray-400 not-italic">— Artforum, 2024</cite>
        </div>
    </section>
);

const SectionArchive = ({ config, items, openModal }) => {
    const [filter, setFilter] = useState('all');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (item.hidden) return false;
            if (filter === 'all') return true;
            return item.category === filter;
        });
    }, [items, filter]);

    const { display = 'masonry', showTitles = true, showCategories = true } = config.layoutSettings.archive || {};

    return (
        <section id="archive" className="py-20 px-6 md:px-12 bg-white/50 min-h-screen w-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <h2 className="text-4xl font-serif mb-6 md:mb-0">The Archive</h2>
                    <div className="flex flex-wrap justify-center space-x-2 md:space-x-6">
                        <button
                            onClick={() => setFilter('all')}
                            className={`text-sm uppercase tracking-widest pb-1 border-b-2 transition-colors ${filter === 'all' ? 'border-[var(--text-color)] font-bold' : 'border-transparent text-gray-500 hover:text-[var(--text-color)]'}`}
                        >
                            All
                        </button>
                        {config.archiveCats.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`text-sm uppercase tracking-widest pb-1 border-b-2 transition-colors ${filter === cat ? 'border-[var(--text-color)] font-bold' : 'border-transparent text-gray-500 hover:text-[var(--text-color)]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={display === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]"
                    : "columns-1 md:columns-2 lg:columns-3 gap-8 min-h-[400px] space-y-8"
                }>
                    {filteredItems.length === 0 ? (
                        <p className="col-span-full text-center text-gray-400 py-10 font-light italic">No visible works in this category.</p>
                    ) : filteredItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => openModal(item)}
                            className={`group cursor-pointer relative overflow-hidden animate-fade-in w-full break-inside-avoid ${display === 'grid' ? 'aspect-square' : 'mb-8'}`}
                        >
                            <div className="w-full h-full relative bg-gray-50 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                                <MediaRenderer item={item} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-[var(--text-color)]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center text-white p-6 text-center backdrop-blur-[2px]">
                                    {showCategories && <p className="text-[var(--accent-color)] text-[10px] uppercase tracking-widest font-bold mb-3">{item.category}</p>}
                                    {showTitles && <h3 className="text-xl font-serif italic">{item.title}</h3>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const SectionBio = ({ config }) => (
    <section id="bio" className="py-24 px-6 md:px-12 bg-[var(--bg-color)] border-t border-gray-200/50 w-full">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
            <div className="w-full md:w-1/3 sticky top-24">
                <div className="aspect-[3/4] bg-gray-200 overflow-hidden relative shadow-lg">
                    <img src={processUrl(config.bioImg)} alt="Artist" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
            </div>
            <div className="w-full md:w-2/3">
                <h2 className="text-xs font-bold tracking-[0.2em] text-[var(--accent-color)] uppercase mb-4">About the Artist</h2>
                <h3 className="text-4xl font-serif mb-8 text-[var(--text-color)]">{config.bioName}</h3>
                <div className="text-gray-600 leading-relaxed text-lg space-y-6 font-light" dangerouslySetInnerHTML={{ __html: config.bioLong }}></div>
            </div>
        </div>
    </section>
);

const SectionContact = ({ config, onLogin }) => {
    const [pass, setPass] = useState('');
    const [isLoginActive, setLoginActive] = useState(false);

    const handleLoginSubmit = () => {
        onLogin(pass);
        setPass('');
        setLoginActive(false);
    };

    return (
        <section id="contact" className="py-24 bg-[var(--text-color)] text-white text-center transition-colors duration-500 w-full">
            <h2 className="text-3xl font-serif mb-8">Inquiries & Commissions</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-10">{config.collectorInfo}</p>
            <a href={`mailto:${config.email}`} className="inline-block border border-white px-10 py-4 text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300">Contact</a>
            <div className="mt-16 flex justify-center space-x-8">
                {/* Social placeholders if needed */}
            </div>

            <div className="mt-20 pt-10 border-t border-gray-800 flex flex-col items-center">
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">&copy; {new Date().getFullYear()} {config.heroTitle}. All Rights Reserved.</p>

                {/* Login Container */}
                <div className="relative group h-10 w-64 mx-auto flex justify-center items-center">
                    {!isLoginActive ? (
                        <button
                            onClick={() => setLoginActive(true)}
                            className="text-[10px] text-gray-700 hover:text-gray-500 uppercase tracking-widest transition-all duration-500 absolute"
                        >
                            Studio Login
                        </button>
                    ) : (
                        <div className="flex items-center justify-center absolute inset-0 transform animate-fade-in">
                            <div className="relative flex items-center">
                                <input
                                    type="password"
                                    autoFocus
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    onKeyUp={(e) => e.key === 'Enter' && handleLoginSubmit()}
                                    className="bg-transparent border-b border-gray-600 text-center text-xs tracking-widest focus:outline-none w-32 pb-1 text-gray-400 placeholder-gray-600 focus:border-gray-400 transition-colors"
                                />
                                <button
                                    onClick={handleLoginSubmit}
                                    className={`absolute -right-6 text-gray-500 hover:text-white transition-all duration-300 transform -translate-x-2 text-sm ${pass.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0'}`}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

// --- MODALS ---

const CanvasModal = ({ item, isOpen, onClose, config }) => {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-serif font-bold">{item.title}</h3>
                <button onClick={onClose} className="text-3xl font-light hover:text-[var(--accent-color)] transition-colors"><X className="w-8 h-8" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-2/3 bg-gray-50 flex items-center justify-center p-4">
                    <MediaRenderer item={item} className="w-full h-full object-contain" context="modal" />
                </div>
                <div className="w-full md:w-1/3 flex flex-col justify-center space-y-6">
                    <div>
                        <span className="text-xs font-bold tracking-widest uppercase text-[var(--accent-color)]">{item.category}</span>
                        <h2 className="text-4xl font-serif mt-2 mb-4">{item.title}</h2>
                        <p className="text-sm text-gray-500">{item.year}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                        <p className="text-gray-600 leading-relaxed mb-6">{item.desc || "No description available."}</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400 uppercase tracking-wide">Medium</span><span className="font-medium">{item.medium}</span></div>
                        </div>
                    </div>
                    <div className="pt-6">
                        <a href={`mailto:${config.email}?subject=Inquire About: ${item.title}`} className="w-full block text-center bg-black text-white py-4 text-xs uppercase tracking-widest hover:bg-[var(--accent-color)] transition-colors">Inquire</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ADMIN DASHBOARD ---

const AdminDashboard = ({ isOpen, onClose, config, items, onUpdateConfig, onUpdateItem, onAddItem, onDeleteItem, onLogout }) => {
    const [activeTab, setActiveTab] = useState('content');
    const [editItem, setEditItem] = useState(null);
    const [layoutEditId, setLayoutEditId] = useState(null);

    if (!isOpen) return null;

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full text-center md:text-left px-2 md:px-4 py-3 rounded text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-3 ${activeTab === id ? 'bg-gray-100 text-black border-r-2 border-[var(--accent-color)]' : ''}`}
        >
            <Icon className="w-4 h-4 md:w-5 md:h-5 mx-auto md:mx-0" /> <span className="hidden md:inline">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/95 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-16 md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                    <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-center md:justify-start">
                        <h2 className="hidden md:block text-xl font-serif font-bold text-black">Toolkit</h2>
                        <Settings className="md:hidden w-6 h-6 text-black" />
                        <p className="hidden md:block text-[10px] uppercase tracking-widest text-gray-400 mt-1 ml-2">v7.0</p>
                    </div>
                    <nav className="flex-1 p-2 md:p-4 space-y-2">
                        <TabButton id="content" icon={Layers} label="Content" />
                        <TabButton id="layout" icon={Layout} label="Layout" />
                        <TabButton id="design" icon={Palette} label="Design" />
                        <TabButton id="profile" icon={User} label="Profile" />
                        <TabButton id="settings" icon={Settings} label="Settings" />
                    </nav>
                    <div className="p-4 border-t border-gray-200">
                        <button onClick={onLogout} className="w-full text-center text-xs uppercase text-red-400 hover:text-red-600 font-bold flex items-center justify-center gap-2">
                            <ExternalLink className="w-4 h-4" /> <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col relative bg-[#F9F8F6]">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        {activeTab === 'content' && <AdminContentTab items={items} onAddItem={onAddItem} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} setEditItem={setEditItem} />}
                        {activeTab === 'layout' && <AdminLayoutTab config={config} onUpdateConfig={onUpdateConfig} setLayoutEditId={setLayoutEditId} />}
                        {activeTab === 'design' && <AdminDesignTab config={config} onUpdateConfig={onUpdateConfig} />}
                        {activeTab === 'profile' && <AdminProfileTab config={config} onUpdateConfig={onUpdateConfig} />}
                        {activeTab === 'settings' && <AdminSettingsTab config={config} onUpdateConfig={onUpdateConfig} />}
                    </div>
                    <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10 flex justify-end">
                        <button onClick={onClose} className="bg-[var(--accent-color)] text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg">
                            Close Toolkit
                        </button>
                    </div>
                </div>
            </div>

            {editItem && (
                <EditItemModal
                    item={editItem}
                    onClose={() => setEditItem(null)}
                    onSave={(updated) => { onUpdateItem(updated.id, updated); setEditItem(null); }}
                />
            )}

            {layoutEditId && (
                <LayoutEditModal
                    sectionId={layoutEditId}
                    config={config}
                    onClose={() => setLayoutEditId(null)}
                    onSave={(updates) => {
                        // Deep merge for layout settings
                        const newSettings = { ...config.layoutSettings, [layoutEditId]: { ...(config.layoutSettings[layoutEditId] || {}), ...updates } };

                        // Handle Hero specific updates which are root level
                        if (layoutEditId === 'hero') {
                            onUpdateConfig({ ...updates }); // Hero updates are flat in config
                        } else {
                            onUpdateConfig({ layoutSettings: newSettings });
                        }
                        setLayoutEditId(null);
                    }}
                    setActiveTab={setActiveTab} // For redirecting
                />
            )}
        </div>
    );
};

// --- ADMIN TABS ---

const AdminContentTab = ({ items, onAddItem, onDeleteItem, setEditItem, onUpdateItem }) => {
    const [newItem, setNewItem] = useState({ title: '', category: 'Mixed Media', type: 'image', image: '', year: new Date().getFullYear(), medium: 'Mixed Media', featured: false });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddItem({ ...newItem, id: Date.now().toString(), desc: "Added via Toolkit", hidden: false, source: 'manual' });
        setNewItem({ title: '', category: 'Mixed Media', type: 'image', image: '', year: new Date().getFullYear(), medium: 'Mixed Media', featured: false });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => setNewItem({ ...newItem, image: evt.target.result });
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-serif">Content Manager</h2>
            </div>

            {/* Add Form */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} placeholder="Title" className="w-full p-2 border rounded text-sm bg-gray-50" required />
                        <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="w-full p-2 border rounded text-sm bg-gray-50">
                            {DEFAULT_CONFIG.archiveCats.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} placeholder="Media URL" className="flex-1 p-2 border rounded text-sm bg-gray-50" />
                            <label className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded cursor-pointer text-gray-600">
                                <Upload className="w-4 h-4" />
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <label className="flex items-center text-xs text-gray-500">
                            <input type="checkbox" checked={newItem.featured} onChange={e => setNewItem({ ...newItem, featured: e.target.checked })} className="mr-2" /> Featured
                        </label>
                        <button type="submit" className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-[var(--accent-color)] transition-colors">Add Item</button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                        <tr><th className="p-3">Work</th><th className="p-3 hidden md:table-cell">Details</th><th className="p-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${item.hidden ? 'opacity-50' : ''}`}>
                                <td className="p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden"><MediaRenderer item={item} className="w-full h-full object-cover" /></div>
                                    <span className="font-bold text-gray-800 text-xs">{item.title}</span>
                                </td>
                                <td className="p-3 hidden md:table-cell"><p className="text-[10px] text-gray-400 uppercase">{item.type} • {item.category}</p></td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => onUpdateItem(item.id, { featured: !item.featured })} className={`text-sm ${item.featured ? 'text-yellow-500' : 'text-gray-400'}`}><Star className="w-4 h-4" /></button>
                                        <button onClick={() => onUpdateItem(item.id, { hidden: !item.hidden })} className={`text-sm ${item.hidden ? 'text-gray-300' : 'text-blue-500'}`}>{item.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                        <button onClick={() => setEditItem(item)} className="text-gray-400 hover:text-[var(--accent-color)]"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => { if (confirm('Delete?')) onDeleteItem(item.id) }} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminLayoutTab = ({ config, onUpdateConfig, setLayoutEditId }) => {
    const moveSection = (index, dir) => {
        const newLayout = [...config.layout];
        if (dir === -1 && index > 0) {
            [newLayout[index], newLayout[index - 1]] = [newLayout[index - 1], newLayout[index]];
        } else if (dir === 1 && index < newLayout.length - 1) {
            [newLayout[index], newLayout[index + 1]] = [newLayout[index + 1], newLayout[index]];
        }
        onUpdateConfig({ layout: newLayout });
    };

    const toggleVisible = (index) => {
        const newLayout = [...config.layout];
        newLayout[index] = { ...newLayout[index], visible: !newLayout[index].visible };
        onUpdateConfig({ layout: newLayout });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold font-serif">Site Layout</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-4">Page Structure</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-100 border-l-4 border-[var(--accent-color)] rounded mb-2">
                        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setLayoutEditId('navbar')}>
                            <Lock className="w-3 h-3 text-gray-400" /> <span className="text-sm font-bold text-gray-800">Navigation Bar</span>
                        </div>
                        <span className="text-xs text-gray-400 uppercase">Fixed Top</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-100 border-l-4 border-gray-300 rounded mb-4">
                        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setLayoutEditId('hero')}>
                            <Lock className="w-3 h-3 text-gray-400" /> <span className="text-sm font-bold text-gray-800">Hero Section</span>
                        </div>
                        <span className="text-xs text-gray-400 uppercase">Fixed Top</span>
                    </div>

                    {config.layout.map((section, idx) => (
                        <div key={section.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setLayoutEditId(section.id)}>
                                <input type="checkbox" checked={section.visible} onChange={(e) => { e.stopPropagation(); toggleVisible(idx); }} className="accent-[var(--accent-color)] h-4 w-4" />
                                <span className="text-sm font-bold text-gray-700 hover:text-[var(--accent-color)]">{section.name}</span>
                                <span className="text-xs text-gray-400">Edit Settings</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => moveSection(idx, -1)} className="text-gray-400 hover:text-black w-6"><ArrowLeft className="w-4 h-4 rotate-90" /></button>
                                <button onClick={() => moveSection(idx, 1)} className="text-gray-400 hover:text-black w-6"><ArrowRight className="w-4 h-4 rotate-90" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AdminDesignTab = ({ config, onUpdateConfig }) => (
    <div className="space-y-8 animate-fade-in">
        <h2 className="text-2xl font-bold font-serif">Site Design</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-gray-400">Brand Identity</h4>
            <div>
                <label className="block text-xs mb-1">Logo URL</label>
                <input value={config.logoUrl} onChange={e => onUpdateConfig({ logoUrl: e.target.value })} className="w-full p-2 border rounded text-sm bg-gray-50" placeholder="https://..." />
            </div>
            <div>
                <label className="block text-xs mb-2">Accent Color & Theme</label>
                <div className="flex items-center gap-4 mb-4">
                    <input type="color" value={config.accentColor} onChange={e => onUpdateConfig({ accentColor: e.target.value })} className="w-8 h-8 cursor-pointer border rounded-full overflow-hidden" />
                    <span className="text-xs text-gray-500">Pick custom color</span>
                </div>
                <div className="flex gap-3">
                    {Object.keys(THEMES).map(t => (
                        <div key={t} onClick={() => onUpdateConfig({ theme: t })} className={`w-6 h-6 rounded-full cursor-pointer border hover:scale-110 transition-transform`} style={{ backgroundColor: THEMES[t].bg, border: `2px solid ${config.theme === t ? config.accentColor : '#e5e7eb'}` }} title={t}></div>
                    ))}
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-gray-400">Typography</h4>
            <div>
                <label className="block text-xs mb-1">Site Title (Browser Tab)</label>
                <input value={config.siteTitle} onChange={e => onUpdateConfig({ siteTitle: e.target.value })} className="w-full p-2 border rounded text-sm bg-gray-50" />
            </div>
        </div>
    </div>
);

const AdminProfileTab = ({ config, onUpdateConfig }) => (
    <div className="space-y-8 animate-fade-in">
        <h2 className="text-2xl font-bold font-serif">Artist Profile</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-gray-400">Identity</h4>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                    <label className="block text-xs mb-1">Headshot URL</label>
                    <input value={config.bioImg} onChange={e => onUpdateConfig({ bioImg: e.target.value })} className="w-full p-2 border rounded text-sm bg-gray-50" />
                    <img src={processUrl(config.bioImg)} className="w-full mt-2 h-32 object-cover rounded bg-gray-100" />
                </div>
                <div className="w-full md:w-2/3 space-y-4">
                    <div><label className="block text-xs mb-1">Artist Name</label><input value={config.bioName} onChange={e => onUpdateConfig({ bioName: e.target.value })} className="w-full p-2 border rounded text-sm bg-gray-50" /></div>
                    <div><label className="block text-xs mb-1">One-Line Hook</label><textarea value={config.stmtHook} onChange={e => onUpdateConfig({ stmtHook: e.target.value })} rows="2" className="w-full p-2 border rounded text-sm bg-gray-50" /></div>
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-gray-400">Biography Variations</h4>
            <div><label className="block text-xs mb-1">Statement Headline</label><input value={config.stmtHead} onChange={e => onUpdateConfig({ stmtHead: e.target.value })} className="w-full p-2 border rounded text-sm bg-gray-50" /></div>
            <div><label className="block text-xs mb-1">Long Bio (Full)</label><textarea value={config.bioLong} onChange={e => onUpdateConfig({ bioLong: e.target.value })} rows="8" className="w-full p-2 border rounded text-sm bg-gray-50" /></div>
        </div>
    </div>
);

const AdminSettingsTab = ({ config, onUpdateConfig }) => (
    <div className="space-y-8 animate-fade-in">
        <h2 className="text-2xl font-bold font-serif">Settings</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-gray-400">Contact Details</h4>
            <input value={config.email} onChange={e => onUpdateConfig({ email: e.target.value })} className="w-full p-2 border rounded text-sm bg-gray-50" placeholder="Email" />
            <textarea value={config.collectorInfo} onChange={e => onUpdateConfig({ collectorInfo: e.target.value })} rows="3" className="w-full p-2 border rounded text-sm bg-gray-50" placeholder="Collector Info" />
        </div>
    </div>
);

// --- EDIT MODALS ---

const EditItemModal = ({ item, onClose, onSave }) => {
    const [data, setData] = useState(item);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => setData({ ...data, image: evt.target.result });
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
                    <h3 className="text-lg font-bold">Edit Item</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-red-500" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500">Title</label><input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full p-2 border rounded text-sm" /></div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Category</label>
                            <select value={data.category} onChange={e => setData({ ...data, category: e.target.value })} className="w-full p-2 border rounded text-sm">
                                {DEFAULT_CONFIG.archiveCats.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500">Year</label><input value={data.year} onChange={e => setData({ ...data, year: e.target.value })} className="w-full p-2 border rounded text-sm" /></div>
                        <div><label className="text-xs font-bold text-gray-500">Medium</label><input value={data.medium} onChange={e => setData({ ...data, medium: e.target.value })} className="w-full p-2 border rounded text-sm" /></div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Media URL / Upload</label>
                        <div className="flex gap-2">
                            <input value={data.image} onChange={e => setData({ ...data, image: e.target.value })} className="flex-1 p-2 border rounded text-sm" />
                            <label className="bg-gray-200 px-3 py-2 rounded cursor-pointer"><Upload className="w-4 h-4" /><input type="file" className="hidden" onChange={handleFileUpload} /></label>
                        </div>
                    </div>
                    <div><label className="text-xs font-bold text-gray-500">Description</label><textarea value={data.desc} onChange={e => setData({ ...data, desc: e.target.value })} rows="3" className="w-full p-2 border rounded text-sm" /></div>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={data.featured} onChange={e => setData({ ...data, featured: e.target.checked })} /> <span className="text-sm">Featured</span></label>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
                    <button onClick={onClose} className="text-gray-500 text-sm font-bold uppercase hover:text-gray-800">Cancel</button>
                    <button onClick={() => onSave(data)} className="bg-[var(--accent-color)] text-white px-6 py-2 text-sm font-bold uppercase rounded shadow">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const LayoutEditModal = ({ sectionId, config, onClose, onSave, setActiveTab }) => {
    const [settings, setSettings] = useState(config.layoutSettings[sectionId] || {});
    // Hero specific state
    const [heroSettings, setHeroSettings] = useState({
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle,
        heroTagline: config.heroTagline,
        heroVideo: config.heroVideo,
        heroBtnText: config.heroBtnText,
        heroBtnLink: config.heroBtnLink
    });

    const isHero = sectionId === 'hero';

    const handleSave = () => {
        if (isHero) onSave(heroSettings);
        else onSave(settings);
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl flex flex-col max-h-[85vh]">
                <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
                    <h3 className="text-lg font-bold text-gray-800">Edit {sectionId}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {isHero ? (
                        <>
                            <div><label className="text-xs font-bold text-gray-500">Title</label><input value={heroSettings.heroTitle} onChange={e => setHeroSettings({ ...heroSettings, heroTitle: e.target.value })} className="w-full p-2 border rounded text-sm" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Subtitle</label><input value={heroSettings.heroSubtitle} onChange={e => setHeroSettings({ ...heroSettings, heroSubtitle: e.target.value })} className="w-full p-2 border rounded text-sm" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Tagline</label><input value={heroSettings.heroTagline} onChange={e => setHeroSettings({ ...heroSettings, heroTagline: e.target.value })} className="w-full p-2 border rounded text-sm" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Video URL</label><input value={heroSettings.heroVideo} onChange={e => setHeroSettings({ ...heroSettings, heroVideo: e.target.value })} className="w-full p-2 border rounded text-sm" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Button Text</label><input value={heroSettings.heroBtnText} onChange={e => setHeroSettings({ ...heroSettings, heroBtnText: e.target.value })} className="w-full p-2 border rounded text-sm" /></div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Button Link</label>
                                    <select value={heroSettings.heroBtnLink} onChange={e => setHeroSettings({ ...heroSettings, heroBtnLink: e.target.value })} className="w-full p-2 border rounded text-sm">
                                        {config.layout.map(s => <option key={s.id} value={`#${s.id}`}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </>
                    ) : sectionId === 'navbar' ? (
                        <button onClick={() => { onClose(); setActiveTab('design'); }} className="w-full text-left p-3 border rounded hover:bg-gray-50 flex justify-between items-center"><span className="text-sm font-bold">Edit Logo & Brand Colors</span> <ChevronRight className="w-4 h-4" /></button>
                    ) : sectionId === 'featured' ? (
                        <>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Carousel Style</label>
                                <select value={settings.style} onChange={e => setSettings({ ...settings, style: e.target.value })} className="w-full p-2 border rounded text-sm">
                                    <option value="glitch">Glitch (Widescreen)</option>
                                    <option value="standard">Standard (Responsive)</option>
                                </select>
                            </div>
                            <p className="text-xs text-gray-400">Drag/Drop reorder not implemented in quick edit. Use order index manually if needed.</p>
                        </>
                    ) : sectionId === 'archive' ? (
                        <>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Display Style</label>
                                <select value={settings.display} onChange={e => setSettings({ ...settings, display: e.target.value })} className="w-full p-2 border rounded text-sm">
                                    <option value="masonry">Masonry</option>
                                    <option value="grid">Grid</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={settings.showTitles} onChange={e => setSettings({ ...settings, showTitles: e.target.checked })} /> <span className="text-sm">Show Titles</span></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={settings.showCategories} onChange={e => setSettings({ ...settings, showCategories: e.target.checked })} /> <span className="text-sm">Show Categories</span></label>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500 mb-4">Content for this section is managed in the Profile tab.</p>
                            <button onClick={() => { onClose(); setActiveTab('profile'); }} className="bg-gray-800 text-white py-2 px-4 text-xs uppercase tracking-widest hover:bg-black">Go to Profile Settings</button>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
                    <button onClick={handleSave} className="bg-[var(--accent-color)] text-white px-6 py-2 text-sm font-bold uppercase rounded shadow">Apply Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---

export default function App() {
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('art_site_config');
        return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    });

    const [portfolioItems, setPortfolioItems] = useState(INITIAL_PORTFOLIO);
    const [user, setUser] = useState(null);
    const [modals, setModals] = useState({ admin: false, canvas: false, canvasItem: null });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Firebase Init
    const firebaseConfig = React.useMemo(() => {
        try {
            return typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
        } catch (e) { return null; }
    }, []);

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // Effect 1: Authentication
    useEffect(() => {
        if (!firebaseConfig) return;

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        const initAuth = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (e) { console.error("Auth Error", e); }
        };

        initAuth();
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, [firebaseConfig]);

    // Effect 2: Data Sync (Depends on User)
    useEffect(() => {
        if (!user || !firebaseConfig) return;

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio_items'));

        const unsubscribe = onSnapshot(q,
            (snap) => {
                if (!snap.empty) {
                    setPortfolioItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            },
            (err) => console.error("Firestore Snapshot Error:", err)
        );

        return () => unsubscribe();
    }, [user, firebaseConfig, appId]);

    // Theme Effect
    useEffect(() => {
        const root = document.documentElement;
        const t = THEMES[config.theme] || THEMES.warm;
        root.style.setProperty('--bg-color', t.bg);
        root.style.setProperty('--text-color', t.text);
        root.style.setProperty('--secondary-color', t.secondary);
        root.style.setProperty('--accent-color', config.accentColor);

        localStorage.setItem('art_site_config', JSON.stringify(config));
        document.title = config.siteTitle;
    }, [config]);

    // Handlers
    const handleUpdateConfig = (updates) => setConfig(prev => ({ ...prev, ...updates }));

    const handleAddItem = async (item) => {
        if (firebaseConfig && user) {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio_items'), item);
        } else {
            setPortfolioItems(prev => [item, ...prev]);
        }
    };

    const handleUpdateItem = async (id, updates) => {
        if (firebaseConfig && user) {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'portfolio_items', id), updates);
        } else {
            setPortfolioItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
        }
    };

    const handleDeleteItem = async (id) => {
        if (firebaseConfig && user) {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'portfolio_items', id));
        } else {
            setPortfolioItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleLogin = (pass) => {
        if (pass === 'admin' || pass === 'frsh') {
            setModals({ ...modals, admin: true });
        } else {
            alert("Incorrect Password"); // Simple feedback
        }
    };

    // Section Mapper
    const renderSection = (section) => {
        if (!section.visible) return null;
        switch (section.id) {
            case 'statement': return <SectionStatement key={section.id} config={config} />;
            case 'featured': return <SectionFeatured key={section.id} config={config} items={portfolioItems} openModal={(item) => setModals({ ...modals, canvas: true, canvasItem: item })} />;
            case 'exhibitions': return <SectionExhibitions key={section.id} />;
            case 'press': return <SectionPress key={section.id} />;
            case 'archive': return <SectionArchive key={section.id} config={config} items={portfolioItems} openModal={(item) => setModals({ ...modals, canvas: true, canvasItem: item })} />;
            case 'bio': return <SectionBio key={section.id} config={config} />;
            case 'contact': return <SectionContact key={section.id} config={config} onLogin={handleLogin} />;
            default: return null;
        }
    };

    return (
        <div className="bg-[var(--bg-color)] text-[var(--text-color)] font-sans antialiased selection:bg-[var(--accent-color)] selection:text-white transition-colors duration-500 min-h-screen">
            <Navbar
                config={config}
                onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                mobileMenuOpen={mobileMenuOpen}
            />

            <Hero config={config} />

            <main className="max-w-full mx-auto bg-[var(--bg-color)] relative z-20 shadow-2xl -mt-20 rounded-t-3xl overflow-hidden pb-20 transition-colors duration-500 flex flex-col">
                {config.layout.map(section => renderSection(section))}
            </main>

            <CanvasModal
                item={modals.canvasItem}
                isOpen={modals.canvas}
                onClose={() => setModals({ ...modals, canvas: false, canvasItem: null })}
                config={config}
            />

            <AdminDashboard
                isOpen={modals.admin}
                onClose={() => setModals({ ...modals, admin: false })}
                config={config}
                items={portfolioItems}
                onUpdateConfig={handleUpdateConfig}
                onAddItem={handleAddItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onLogout={() => setModals({ ...modals, admin: false })}
            />
        </div>
    );
}