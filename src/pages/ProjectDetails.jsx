import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiExternalLink,
  FiGithub,
  FiLayers,
  FiCheckCircle,
  FiAlertCircle,
  FiCode,
  FiCpu,
  FiDatabase,
  FiTerminal,
  FiFolder,
  FiCalendar,
  FiClock,
  FiImage,
  FiMaximize2,
  FiX,
  FiInfo,
} from 'react-icons/fi';
import { useGetProjectBySlugQuery, useGetRelatedProjectsQuery } from '@/redux/api/apiSlice';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/FeedbackStates';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShareButtons } from '../components/common/ShareButtons';
import { RelatedItems } from '../components/common/RelatedItems';
import { handleImageError } from '../utils/imageFallback';
import { formatRichContent } from '../utils/richContent';

export const ProjectDetails = () => {
  const { slug } = useParams();
  const { data: projectData, isLoading, isError, refetch } = useGetProjectBySlugQuery(slug);
  const { data: relatedData, isLoading: isRelatedLoading } = useGetRelatedProjectsQuery(slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  const project = projectData?.data;
  const relatedProjects = relatedData?.data || [];

  // Consolidate images array (primary thumbnail + extra screenshots)
  const allImages = React.useMemo(() => {
    if (!project) return [];
    const list = [];
    if (project.thumbnail) list.push(project.thumbnail);
    if (Array.isArray(project.images)) {
      project.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [project]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white">
      <Helmet>
        <title>{project?.title ? `${project.title} | Case Study & Architecture` : 'Project Details'}</title>
        <meta
          name="description"
          content={project?.description || 'Deep-dive full stack case study with frontend and backend repositories.'}
        />
        <meta property="og:title" content={project?.title || 'Project Details'} />
        <meta property="og:description" content={project?.description || ''} />
        {project?.thumbnail && <meta property="og:image" content={project.thumbnail} />}
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-28 sm:pt-36 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Navigation Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Featured Projects', to: '/#projects' },
            { label: project?.title || 'Case Study' },
          ]}
        />

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-28 rounded-2xl" count={3} />
            </div>
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : isError || !project ? (
          <ErrorState onRetry={refetch} message="Could not locate project case study." />
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Header / Title area */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {project.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                    {project.status || 'Completed'}
                  </span>
                  {project.featured && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                      Featured Engineering Work
                    </span>
                  )}
                  {(project.startDate || project.endDate) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                      <FiCalendar className="w-3.5 h-3.5 text-teal-500" />
                      {project.startDate || 'Started'} — {project.endDate || (project.status === 'ongoing' ? 'Ongoing' : 'Completed')}
                    </span>
                  )}
                </div>

                <ShareButtons title={project.title} />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {project.title}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {project.description}
              </p>
            </div>

            {/* Showcase Visual / Main Active Display with Lightbox & Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl bg-slate-900 group">
                <img
                  src={allImages[activeImageIndex] || project.thumbnail}
                  alt={project.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                <button
                  type="button"
                  onClick={() => setLightboxImage(allImages[activeImageIndex] || project.thumbnail)}
                  className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-slate-950/80 hover:bg-teal-600 text-white backdrop-blur-md transition-all shadow-lg hover:scale-110 cursor-pointer"
                  title="Expand Fullscreen Image"
                >
                  <FiMaximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Gallery Thumbnails Carousel / Selector */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-teal-500 shadow-lg shadow-teal-500/20 scale-105'
                          : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Screenshot ${idx + 1}`}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs / Timeline Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Timeline
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FiClock className="text-teal-500" />
                  {project.startDate && project.endDate ? `${project.startDate} – ${project.endDate}` : 'Production Ready'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Architecture
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FiLayers className="text-cyan-500" />
                  {project.category || 'Full Stack MERN'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Deliverable State
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 capitalize">
                  <FiCheckCircle className="text-emerald-500" />
                  {project.status || 'Completed'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Codebase Access
                </span>
                <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <FiGithub className="text-teal-500" />
                  Frontend & Backend
                </span>
              </div>
            </div>

            {/* Repository & Live Production Deployment Bar */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Deployments & Code Repositories
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Explore live application instance and separate client/server codebase repositories.
                  </p>
                </div>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-lg shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    Live Production App
                  </a>
                )}
              </div>

              {/* Repo Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {project.githubClientUrl && (
                  <a
                    href={project.githubClientUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                        <FiCode className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          Frontend Client Repo
                        </span>
                        <span className="text-[10px] text-slate-400">React • Redux • UI</span>
                      </div>
                    </div>
                    <FiGithub className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                  </a>
                )}

                {project.githubServerUrl && (
                  <a
                    href={project.githubServerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <FiDatabase className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Backend Server Repo
                        </span>
                        <span className="text-[10px] text-slate-400">Node • Express • MongoDB</span>
                      </div>
                    </div>
                    <FiGithub className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                  </a>
                )}

                {project.githubUrl && !project.githubClientUrl && !project.githubServerUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                        <FiFolder className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          Monorepo Source
                        </span>
                        <span className="text-[10px] text-slate-400">Full Repository</span>
                      </div>
                    </div>
                    <FiGithub className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                  </a>
                )}
              </div>
            </div>

            {/* Architecture Stack */}
            {Array.isArray(project.techStack) && project.techStack.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <FiCpu className="text-teal-500" />
                  Technologies & Ecosystem Applied
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features Breakdown */}
            {Array.isArray(project.keyFeatures) && project.keyFeatures.length > 0 && (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCheckCircle className="text-teal-500" />
                  Key Engineering Features & Capabilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {project.keyFeatures.map((feature, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3"
                    >
                      <span className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges & Solutions */}
            {project.challenges && (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAlertCircle className="text-amber-500" />
                  Engineering Challenges & Solutions
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.challenges}
                </p>
              </div>
            )}

            {/* Detailed Case Study / Article Content */}
            {project.content && (
              <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Case Study Walkthrough
                </h3>
                <div
                  className="ck-content select-text leading-relaxed text-slate-800 dark:text-slate-200 text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: formatRichContent(project.content) }}
                />
              </div>
            )}

            {/* Related Engineering Projects */}
            <RelatedItems
              title="Related Engineering Projects"
              subtitle="More full-stack applications and production case studies."
              items={relatedProjects}
              type="projects"
              isLoading={isRelatedLoading}
            />
          </motion.article>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-slate-900 text-white hover:bg-teal-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged project view"
              className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ProjectDetails;
