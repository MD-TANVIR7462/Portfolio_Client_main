import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiExternalLink,
  FiAward,
  FiClock,
  FiUser,
  FiLayers,
  FiCheckCircle,
} from 'react-icons/fi';
import { useGetCourseBySlugQuery, useGetRelatedCoursesQuery } from '@/redux/api/apiSlice';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/FeedbackStates';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShareButtons } from '../components/common/ShareButtons';
import { RelatedItems } from '../components/common/RelatedItems';
import { handleImageError } from '../utils/imageFallback';

export const CourseDetails = () => {
  const { slug } = useParams();
  const { data: courseData, isLoading, isError, refetch } = useGetCourseBySlugQuery(slug);
  const { data: relatedData, isLoading: isRelatedLoading } = useGetRelatedCoursesQuery(slug);

  const course = courseData?.data;
  const relatedCourses = relatedData?.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white">
      <Helmet>
        <title>{course?.title ? `${course.title} | Course & Certification` : 'Course Details'}</title>
        <meta name="description" content={course?.description || 'Course overview and developer accreditation.'} />
        <meta property="og:title" content={course?.title || 'Course Details'} />
        <meta property="og:description" content={course?.description || ''} />
        {course?.thumbnail && <meta property="og:image" content={course.thumbnail} />}
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-28 sm:pt-36 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Navigation Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Courses & Certifications', to: '/#courses' },
            { label: course?.title || 'Course' },
          ]}
        />

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : isError || !course ? (
          <ErrorState onRetry={refetch} message="Could not find the requested course." />
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {course.platform}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {course.level}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 capitalize border border-emerald-200 dark:border-emerald-800">
                    {course.status || 'Completed'}
                  </span>
                </div>

                <ShareButtons title={course.title} />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <FiUser className="w-3.5 h-3.5 text-teal-500" />
                  Instructor: <strong className="text-slate-800 dark:text-slate-200">{course.instructor}</strong>
                </span>
                {course.duration && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <FiClock className="w-3.5 h-3.5 text-teal-500" />
                    Duration: <strong className="text-slate-800 dark:text-slate-200">{course.duration}</strong>
                  </span>
                )}
                {course.category && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-teal-600 dark:text-teal-400">
                    <FiLayers className="w-3.5 h-3.5" />
                    Category: <strong>{course.category}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl bg-slate-900">
              <img
                src={course.thumbnail}
                alt={course.title}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Certificate & Actions Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                {course.certificateUrl ? (
                  <a
                    href={course.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                  >
                    <FiAward className="w-4 h-4" />
                    View Verified Certificate
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Certificate verification not uploaded yet</span>
                )}

                {course.courseUrl && (
                  <a
                    href={course.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    Course Platform Page
                  </a>
                )}
              </div>

              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {course.category}
              </span>
            </div>

            {/* Syllabus / Description */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Syllabus & Key Competencies
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>

              {Array.isArray(course.skillsCovered) && course.skillsCovered.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Skills Covered in this Curriculum
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {course.skillsCovered.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                      >
                        <FiCheckCircle className="w-3.5 h-3.5 text-teal-500" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Courses */}
            <RelatedItems
              title="Related Accreditations & Courses"
              subtitle="Continue exploring relevant technical curricula and certifications."
              items={relatedCourses}
              type="courses"
              isLoading={isRelatedLoading}
            />
          </motion.article>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetails;
