import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiCpu,
  FiCode,
  FiTerminal,
  FiDatabase,
  FiLayers,
  FiCheckCircle,
  FiZap,
} from 'react-icons/fi';
import { useGetSkillsQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { ErrorState, EmptyState } from '../common/FeedbackStates';
import { handleImageError } from '../../utils/imageFallback';

const ALL_SKILL_CATEGORIES = ['Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Other'];

export const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: skillsData, isLoading, isError, refetch } = useGetSkillsQuery();
  const { data: settingsData } = useGetSettingsQuery();

  const skillsTabsVisibility = settingsData?.data?.skillsTabsVisibility || {};

  // Compute active categories: 'All' + whatever tabs are not disabled in dashboard
  const visibleCategories = [
    'All',
    ...ALL_SKILL_CATEGORIES.filter((cat) => skillsTabsVisibility[cat] !== false),
  ];

  const rawSkills = Array.isArray(skillsData?.data)
    ? skillsData.data
    : Array.isArray(skillsData?.data?.skills)
    ? skillsData.data.skills
    : [];

  // Filter skills: exclude skills whose entire category is disabled from dashboard
  const availableSkills = rawSkills.filter(
    (s) => !s.category || skillsTabsVisibility[s.category] !== false
  );

  const filteredSkills =
    activeCategory === 'All'
      ? availableSkills
      : availableSkills.filter((s) => s.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="skills" className="py-32 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
      {/* Background Matrix & Ambience */}
      <div className="absolute inset-0 bg-dot-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[350px] bg-gradient-to-r from-teal-500/10 to-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
            <FiCpu className="w-3.5 h-3.5" />
            {settingsData?.data?.sectionHeaders?.skills?.badge || 'Core Stack & Production Tooling'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {settingsData?.data?.sectionHeaders?.skills?.title || 'Frontend Mastery & MERN Architecture'}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settingsData?.data?.sectionHeaders?.skills?.subtitle ||
              'Leading frontend architecture with Next.js, React 18, and TypeScript alongside scalable Node.js microservices and resilient MongoDB data pipelines.'}
          </p>
        </div>

        {/* Dynamic Category Pills Controlled by Admin Settings */}
        {visibleCategories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-inner max-w-fit mx-auto mb-16 gap-1">
            {visibleCategories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'text-white shadow-md shadow-teal-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSkillTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 shadow-sm"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>{cat}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Skills Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-48 rounded-3xl" count={8} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message="Failed to load skills from server." />
        ) : filteredSkills.length === 0 ? (
          <EmptyState title="No skills found" description="No skills match this category filter." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill._id || index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.5 }}
                className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:border-teal-500/60 dark:hover:border-teal-500/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-14 h-14 rounded-2xl p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-teal-500/10 transition-transform">
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        onError={handleImageError}
                        className="w-9 h-9 object-contain"
                      />
                    </div>

                    <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      {skill.category}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center justify-between">
                    <span>{skill.name}</span>
                    <FiZap className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {skill.category === 'Frontend' ? 'Pixel-Perfect UI Specialist' : 'Commercial Production Skill'}
                  </p>
                </div>

                {/* Cyber Progress Indicator */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center text-xs mb-2 font-mono font-semibold">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Command & Fluency</span>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{skill.proficiency}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.proficiency}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 shadow-xs"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
