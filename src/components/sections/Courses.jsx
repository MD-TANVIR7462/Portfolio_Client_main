import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiClock, FiAward, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetCoursesQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { ErrorState, EmptyState } from '../common/FeedbackStates';
import { handleImageError } from '../../utils/imageFallback';

export const Courses = () => {
  const { data: coursesData, isLoading, isError, refetch } = useGetCoursesQuery({ limit: 6 });
  const { data: settingsData } = useGetSettingsQuery();
  const courses = coursesData?.data?.courses || [];

  return (
    <section id="courses" className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
      {/* Background digital ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
            <FiBookOpen className="w-3.5 h-3.5" />
            {settingsData?.data?.sectionHeaders?.courses?.badge || 'Specialized Learning & Certifications'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {settingsData?.data?.sectionHeaders?.courses?.title || 'Courses & Professional Accreditations'}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settingsData?.data?.sectionHeaders?.courses?.subtitle ||
              'Rigorous masterclasses, deep-dive courses, and verified developer certifications completed.'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-3xl" count={3} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message="Failed to load course credentials." />
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses listed"
            description="Professional course accreditations will appear here once added."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="group relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-2xl hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-5">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-md">
                        {course.platform}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-white">
                        {course.level}
                      </span>
                    </div>

                    {course.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-[10px] font-semibold bg-black/70 text-slate-200 backdrop-blur-sm flex items-center gap-1">
                        <FiClock className="w-3 h-3 text-teal-400" />
                        {course.duration}
                      </div>
                    )}
                  </div>

                  {/* Instructor & Title */}
                  <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
                    Instructor: {course.instructor}
                  </p>
                  <Link to={`/courses/${course.slug}`}>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 mb-2.5">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {course.description}
                  </p>

                  {/* Skills badges */}
                  {Array.isArray(course.skillsCovered) && course.skillsCovered.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {course.skillsCovered.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {course.skillsCovered.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{course.skillsCovered.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    View Details
                  </Link>

                  <div className="flex items-center gap-2">
                    {course.certificateUrl && (
                      <a
                        href={course.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-xs font-bold hover:scale-105 transition-transform"
                      >
                        <FiAward className="w-3.5 h-3.5 text-amber-500" />
                        Certificate
                      </a>
                    )}
                    {course.courseUrl && (
                      <a
                        href={course.courseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        title="Platform URL"
                      >
                        <FiExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
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

export default Courses;
