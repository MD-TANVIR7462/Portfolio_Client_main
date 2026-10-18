import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useGetTestimonialsQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { handleImageError } from '../../utils/imageFallback';

export const Testimonials = () => {
  const { data: testimonialsData, isLoading } = useGetTestimonialsQuery();
  const { data: settingsData } = useGetSettingsQuery();
  const testimonials = Array.isArray(testimonialsData?.data)
    ? testimonialsData.data
    : Array.isArray(testimonialsData?.data?.testimonials)
    ? testimonialsData.data.testimonials
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (isLoading) {
    return (
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-64 rounded-3xl" />
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
          <FiStar className="w-3.5 h-3.5" />
          {settingsData?.data?.sectionHeaders?.testimonials?.badge || 'Endorsements & Recommendations'}
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
          {settingsData?.data?.sectionHeaders?.testimonials?.title || 'Client & Colleague Praise'}
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {settingsData?.data?.sectionHeaders?.testimonials?.subtitle ||
            'Feedback from project stakeholders, engineering leads, and technical founders I have collaborated with.'}
        </p>
      </div>

      <div className="relative p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={current._id || currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Rating Stars */}
            <div className="flex items-center gap-1 text-amber-400 mb-6">
              {Array.from({ length: current.rating || 5 }).map((_, i) => (
                <FiStar key={i} className="fill-current w-5 h-5" />
              ))}
            </div>

            {/* Testimonial Quote */}
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed italic mb-8 max-w-2xl">
              “{current.message}”
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <img
                src={current.avatar}
                alt={current.name}
                onError={handleImageError}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/20"
              />
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {current.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {current.role} at <span className="text-teal-600 dark:text-teal-400">{current.company}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation buttons */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-between absolute inset-y-0 -left-4 -right-4 pointer-events-none">
            <button
              onClick={handlePrev}
              className="pointer-events-auto p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-lg hover:scale-110 transition-transform"
              aria-label="Previous Testimonial"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="pointer-events-auto p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-lg hover:scale-110 transition-transform"
              aria-label="Next Testimonial"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
