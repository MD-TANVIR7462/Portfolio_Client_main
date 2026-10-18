import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiDownload,
  FiCheckCircle,
  FiTerminal,
  FiCode,
  FiCpu,
  FiZap,
  FiGithub,
} from 'react-icons/fi';
import { useGetAboutQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { handleImageError } from '../../utils/imageFallback';

export const Hero = () => {
  const { data: aboutData, isLoading: isAboutLoading } = useGetAboutQuery();
  const { data: settingsData } = useGetSettingsQuery();

  const about = aboutData?.data;
  const settings = settingsData?.data;

  // Typewriter effect for roles
  const roles = [
    'Senior Front End Developer (Next.js & React 18)',
    'Full Stack MERN Developer (Node & MongoDB)',
    'Enterprise Frontend System Architect',
    'Pixel-Perfect UI & Motion Craftsman',
  ];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = roles[currentRoleIndex];
    const typingSpeed = isDeleting ? 30 : 65;

    const timer = setTimeout(() => {
      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      } else {
        setCurrentText(fullText.substring(0, currentText.length + (isDeleting ? -1 : 1)));
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentRoleIndex]);

  if (isAboutLoading) {
    return (
      <section className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-16 w-full max-w-lg" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <Skeleton className="w-72 h-72 sm:w-80 sm:h-80 rounded-3xl" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-32 sm:pt-40 pb-24 overflow-hidden">
      {/* Background Ambience & Digital Matrix */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold mb-6 shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>{about?.availabilityStatus || 'Available for Worldwide Engineering'}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">Tanvir</span>.
              <span className="block text-2xl sm:text-4xl lg:text-5xl mt-2 text-slate-800 dark:text-slate-100 font-extrabold">
                Senior Front End & MERN Developer
              </span>
            </h1>

            {/* Terminal Typing Row */}
            <div className="mt-4 flex items-center gap-2 font-mono text-base sm:text-xl font-bold text-slate-800 dark:text-slate-200 min-h-[32px]">
              <span className="text-teal-600 dark:text-teal-400">&gt;</span>
              <span>{currentText}</span>
              <span className="w-2 h-5 bg-teal-500 animate-pulse inline-block" />
            </div>

            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {about?.tagline ||
                settings?.heroText ||
                '3+ years delivering performant, micro-animated client interfaces, seamless UI/UX design systems, and resilient full-stack MERN architectures for global products.'}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Explore Featured Work</span>
                <FiArrowRight className="w-4 h-4" />
              </a>

              {about?.resumeUrl && (
                <a
                  href={about.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
                >
                  <FiDownload className="w-4 h-4 text-teal-500" />
                  <span>Download Resume</span>
                </a>
              )}
            </div>

            {/* Metrics Chips */}
            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-mono text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80 pt-6">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-teal-500 w-4 h-4" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {about?.yearsOfExperience || 3}+ Years Frontend & Full Stack
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiZap className="text-amber-500 w-4 h-4" />
                <span>Optimized Performance </span>
              </div>
              <div className="flex items-center gap-2">
                <FiCpu className="text-cyan-500 w-4 h-4" />
                <span>End-to-End MERN & RTK Query</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Column: Cyber Terminal & Hologram Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 flex flex-col items-center gap-6"
          >
            {/* Holographic Portrait Card */}
            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-400 opacity-30 group-hover:opacity-60 blur-xl transition duration-500" />

              <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl p-3">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950">
                  <img
                    src={
                      about?.profileImage ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={about?.name || 'Developer Profile'}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Name badge overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-white">{about?.name || 'Developer'}</h3>
                      <p className="text-[11px] text-teal-400 font-mono">{about?.title || 'MERN Stack Developer'}</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Floating Pill: Verified Code Status */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute -top-3 -right-3 px-3.5 py-1.5 rounded-xl bg-slate-900/90 text-white border border-teal-500/40 backdrop-blur-md shadow-xl text-[11px] font-mono flex items-center gap-2"
              >
                <FiTerminal className="w-3.5 h-3.5 text-teal-400" />
                <span>const architect = true;</span>
              </motion.div>
            </div>

            {/* Interactive Code Console Preview Box */}
            <div className="w-full max-w-sm rounded-2xl bg-slate-900/90 border border-slate-800 p-4 font-mono text-xs shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span>engineer.profile.ts</span>
              </div>
              <pre className="text-slate-300 text-[10px] leading-relaxed">
                <code>
                  <span className="text-teal-400">const</span> developer = &#123;{'\n'}
                  {'  '}name: <span className="text-cyan-300">'Tajul Islam Tanvir'</span>,{'\n'}
                  {'  '}roles: <span className="text-emerald-300">['Senior Front End Dev', 'MERN Stack Dev']</span>,{'\n'}
                  {'  '}companies: <span className="text-amber-300">['Siscotek', 'SaibonSoft']</span>,{'\n'}
                  {'  '}frontend: <span className="text-teal-300">['Next.js', 'React 18', 'TypeScript', 'Tailwind']</span>,{'\n'}
                  {'  '}backend: <span className="text-emerald-400">['Node.js', 'Express', 'MongoDB', 'PHP']</span>,{'\n'}
                  {'  '}mindset: <span className="text-teal-400">'Optimized Performance & Pixel-Perfect UI'</span>{'\n'}
                  &#125;;
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
