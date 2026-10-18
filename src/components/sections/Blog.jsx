import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiTag, FiArrowUpRight, FiBookOpen } from 'react-icons/fi';
import { useGetBlogsQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { ErrorState, EmptyState } from '../common/FeedbackStates';
import { handleImageError } from '../../utils/imageFallback';

export const Blog = () => {
  const { data: blogData, isLoading, isError, refetch } = useGetBlogsQuery({ limit: 3 });
  const { data: settingsData } = useGetSettingsQuery();
  const blogs = blogData?.data?.blogs || [];

  return (
    <section id="blog" className="py-28 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
      {/* Background Ambience */}
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
            <FiBookOpen className="w-3.5 h-3.5" />
            {settingsData?.data?.sectionHeaders?.blog?.badge || 'Engineering Insights & Knowledge Base'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {settingsData?.data?.sectionHeaders?.blog?.title || 'Publications & Deep-Dive Tutorials'}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settingsData?.data?.sectionHeaders?.blog?.subtitle ||
              'Real-world software engineering articles, architecture retrospectives, and full-stack performance patterns.'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-3xl" count={3} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message="Failed to load publications." />
        ) : blogs.length === 0 ? (
          <EmptyState title="No articles published" description="Technical articles will appear here once published." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post, idx) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-2xl hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Cover Image Container */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-5"
                  >
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 text-teal-400 backdrop-blur-md flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {post.readTime || '5 min read'}
                      </span>
                    </div>
                  </Link>

                  {/* Tags */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title & Excerpt */}
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 mb-2.5 leading-snug">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:gap-2.5 transition-all"
                  >
                    Read Technical Article <FiArrowUpRight className="w-4 h-4" />
                  </Link>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
