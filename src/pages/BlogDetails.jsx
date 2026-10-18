import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiTag, FiUser } from 'react-icons/fi';
import { useGetBlogBySlugQuery, useGetRelatedBlogsQuery, useGetAboutQuery } from '@/redux/api/apiSlice';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/FeedbackStates';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShareButtons } from '../components/common/ShareButtons';
import { RelatedItems } from '../components/common/RelatedItems';
import { handleImageError } from '../utils/imageFallback';
import { formatRichContent } from '../utils/richContent';

export const BlogDetails = () => {
  const { slug } = useParams();
  const { data: blogData, isLoading, isError, refetch } = useGetBlogBySlugQuery(slug);
  const { data: relatedData, isLoading: isRelatedLoading } = useGetRelatedBlogsQuery(slug);
  const { data: aboutData } = useGetAboutQuery();

  const blog = blogData?.data;
  const relatedBlogs = relatedData?.data || [];
  const author = aboutData?.data;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white">
      <Helmet>
        <title>{blog?.title ? `${blog.title} | Engineering Insights` : 'Blog Article'}</title>
        <meta name="description" content={blog?.excerpt || 'Technical blog post and tutorial.'} />
        <meta property="og:title" content={blog?.title || 'Technical Article'} />
        <meta property="og:description" content={blog?.excerpt || ''} />
        {blog?.coverImage && <meta property="og:image" content={blog.coverImage} />}
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-28 sm:pt-36 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Navigation Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Engineering Insights', to: '/#blog' },
            { label: blog?.title || 'Article' },
          ]}
        />

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : isError || !blog ? (
          <ErrorState onRetry={refetch} message="Could not find the requested blog article." />
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                    <FiClock className="w-3.5 h-3.5" />
                    {blog.readTime || '5 min read'}
                  </span>
                  {blog.createdAt && (
                    <span className="inline-flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <ShareButtons title={blog.title} />
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {blog.title}
              </h1>

              {blog.excerpt && (
                <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {blog.excerpt}
                </p>
              )}

              {/* Author badge */}
              {author && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800">
                  <img
                    src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={author.name}
                    onError={handleImageError}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/30"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {author.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {author.title || 'Full Stack Engineer'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cover image */}
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl bg-slate-900">
              <img
                src={blog.coverImage}
                alt={blog.title}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tags */}
            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <FiTag className="w-4 h-4 text-teal-500" />
                {blog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Rich formatted content with .ck-content class */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div
                className="ck-content select-text leading-relaxed text-slate-800 dark:text-slate-200 text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: formatRichContent(blog.content) }}
              />
            </div>

            {/* Related Articles */}
            <RelatedItems
              title="Related Technical Articles"
              subtitle="More deep-dive tutorials, patterns, and architectural retrospectives."
              items={relatedBlogs}
              type="blogs"
              isLoading={isRelatedLoading}
            />
          </motion.article>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetails;
