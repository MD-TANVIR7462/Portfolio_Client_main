import React from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiCalendar, FiAward, FiCheckCircle, FiCompass } from 'react-icons/fi';
import { useGetEducationsQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { ErrorState, EmptyState } from '../common/FeedbackStates';

export const Education = () => {
  const { data: eduData, isLoading, isError, refetch } = useGetEducationsQuery();
  const { data: settingsData } = useGetSettingsQuery();
  const educations = Array.isArray(eduData?.data)
    ? eduData.data
    : Array.isArray(eduData?.data?.educations)
    ? eduData.data.educations
    : [];

  return (
    <section id="education" className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
      {/* Background Ambience */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[300px] bg-teal-500/5 dark:bg-teal-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
            <FiBook className="w-3.5 h-3.5" />
            {settingsData?.data?.sectionHeaders?.education?.badge || 'Academic Foundations & Credentials'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {settingsData?.data?.sectionHeaders?.education?.title || 'Education & Academic Background'}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settingsData?.data?.sectionHeaders?.education?.subtitle ||
              'Formal Computer Science & Engineering degree foundations powering algorithmic problem-solving.'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Skeleton className="h-56 rounded-3xl" count={2} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message="Failed to load academic records." />
        ) : educations.length === 0 ? (
          <EmptyState title="No education records found" description="Education degrees will appear here." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {educations.map((edu, index) => (
              <motion.div
                key={edu._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FiAward className="w-6 h-6" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <FiCalendar className="w-3.5 h-3.5 text-teal-500" />
                      {edu.startDate} – {edu.endDate || 'Ongoing'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {edu.degree}
                  </h3>

                  <div className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1 mb-3">
                    {edu.institution}
                  </div>

                  {edu.fieldOfStudy && (
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3">
                      Field: <span className="font-semibold text-slate-700 dark:text-slate-300">{edu.fieldOfStudy}</span>
                    </div>
                  )}

                  {edu.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {edu.description}
                    </p>
                  )}
                </div>

                {edu.grade && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Performance Metric</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200/60 dark:border-teal-800/60">
                      {edu.grade}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Education;
