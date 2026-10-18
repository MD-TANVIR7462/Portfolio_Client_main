import React from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiCalendar, FiMapPin, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { useGetExperiencesQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { ErrorState, EmptyState } from '../common/FeedbackStates';
import { handleImageError } from '../../utils/imageFallback';

export const Experience = () => {
  const { data: expData, isLoading, isError, refetch } = useGetExperiencesQuery();
  const { data: settingsData } = useGetSettingsQuery();
  const experiences = Array.isArray(expData?.data)
    ? expData.data
    : Array.isArray(expData?.data?.experiences)
    ? expData.data.experiences
    : [];

  return (
    <section id="experience" className="py-28 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
            <FiBriefcase className="w-3.5 h-3.5" />
            {settingsData?.data?.sectionHeaders?.experience?.badge || 'Verified Career Trajectory'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {settingsData?.data?.sectionHeaders?.experience?.title || 'Commercial Work Experience'}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settingsData?.data?.sectionHeaders?.experience?.subtitle ||
              'Leading engineering architecture, modernizing mission-critical web applications, and delivering production client solutions.'}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <Skeleton className="h-56 rounded-3xl" count={2} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message="Failed to load experience records." />
        ) : experiences.length === 0 ? (
          <EmptyState title="No experience history" description="Experience records will show here." />
        ) : (
          <div className="relative max-w-4xl mx-auto pl-6 sm:pl-10 border-l-2 border-gradient-to-b border-teal-500/40 space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative group"
              >
                {/* Glowing Timeline Node */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-5 h-5 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-gradient-to-r from-teal-500 to-emerald-400 group-hover:scale-130 transition-transform shadow-lg shadow-teal-500/50" />

                {/* Experience Card with Cyber Hover & Border Gradients */}
                <div className="relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-9 shadow-sm hover:shadow-2xl hover:border-teal-500/60 dark:hover:border-teal-500/60 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      {exp.companyLogo && (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700/80 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                          <img
                            src={exp.companyLogo}
                            alt={exp.company}
                            onError={handleImageError}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      )}
                      <div>
                        <div className="inline-flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                            {exp.role}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                          {exp.companyUrl ? (
                            <a
                              href={exp.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-teal-600 dark:hover:text-teal-400 inline-flex items-center gap-2 transition-colors group/company"
                            >
                              <span>{exp.company}</span>
                              <FiExternalLink className="w-4 h-4 opacity-0 group-hover/company:opacity-100 transition-opacity text-teal-500" />
                            </a>
                          ) : (
                            <span>{exp.company}</span>
                          )}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col sm:items-end text-xs text-slate-500 dark:text-slate-400 gap-1.5 font-mono">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
                        <FiCalendar className="w-3.5 h-3.5 text-teal-500" />
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                      {exp.location && (
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <FiMapPin className="w-3.5 h-3.5 text-teal-400" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
                    {exp.description}
                  </p>

                  {/* Bullet Responsibilities */}
                  {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                    <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Key Responsibilities & Deliverables:
                      </h4>
                      {exp.achievements.map((achieve, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          <FiCheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                          <span>{achieve}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tech stack badge pills */}
                  {Array.isArray(exp.techStack) && exp.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      {exp.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
