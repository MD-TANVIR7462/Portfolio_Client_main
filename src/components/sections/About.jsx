import React from 'react';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiMail,
  FiPhone,
  FiAward,
  FiLayers,
  FiCoffee,
  FiCpu,
  FiTerminal,
  FiCheckCircle,
} from 'react-icons/fi';
import { useGetAboutQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { ErrorState } from '../common/FeedbackStates';

export const About = () => {
  const { data: aboutData, isLoading, isError, refetch } = useGetAboutQuery();
  const { data: settingsData } = useGetSettingsQuery();
  const about = aboutData?.data;

  if (isLoading) {
    return (
      <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6 mx-auto" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </section>
    );
  }

  if (isError || !about) {
    return (
      <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ErrorState onRetry={refetch} message="Could not load About info." />
      </section>
    );
  }

  const highlightStats = [
    { label: 'Frontend & Full Stack', value: '3+ Years', icon: FiAward, desc: 'Production Commercial Experience' },
    { label: 'Client Interfaces & Repos', value: '25+', icon: FiLayers, desc: 'React 18, Redux, Node.js' },
    { label: 'Performance & LCP', value: '98+', icon: FiCpu, desc: 'Lighthouse & Core Web Vitals' },
  ];

  return (
    <section id="about" className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
            <FiTerminal className="w-3.5 h-3.5" />
            {settingsData?.data?.sectionHeaders?.about?.badge || 'Developer Profile & Engineering Philosophy'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {settingsData?.data?.sectionHeaders?.about?.title || 'Architecting With Precision'}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settingsData?.data?.sectionHeaders?.about?.subtitle ||
              'Passionate full-stack developer committed to crafting accessible, scalable, high-performance web applications and resilient systems.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Main Bio Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {about.title}
                </h3>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line font-normal">
                {about.bio}
              </p>
            </div>

            {/* Coordinates Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 mt-8 border-t border-slate-100 dark:border-slate-800/80">
              {about.location && (
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <FiMapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Location</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {about.location}
                    </span>
                  </div>
                </div>
              )}
              {about.email && (
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Direct Email</span>
                    <a
                      href={`mailto:${about.email}`}
                      className="font-semibold text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 truncate block"
                    >
                      {about.email}
                    </a>
                  </div>
                </div>
              )}
              {about.phone && (
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <FiPhone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Phone / WhatsApp</span>
                    <a
                      href={`tel:${about.phone}`}
                      className="font-semibold text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 truncate block"
                    >
                      {about.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Links */}
            <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-mono font-medium text-slate-400">Profiles:</span>
              <a
                href="https://github.com/MD-TANVIR7462"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                GitHub (Main)
              </a>
              <a
                href="https://github.com/Siscotek-Tanvir"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                2nd GitHub (Siscotek)
              </a>
              <a
                href="https://linkedin.com/in/md-tajul-islam-tanvir-531682278"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </motion.div>

          {/* Metrics Stack */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-5">
            {highlightStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-slate-400 block mb-1">
                      {stat.label}
                    </span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white block tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium block mt-1">
                      {stat.desc}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
                    <Icon className="w-6 h-6" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
