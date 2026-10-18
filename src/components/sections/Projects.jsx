import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiExternalLink,
  FiGithub,
  FiLayers,
  FiArrowUpRight,
  FiCode,
  FiDatabase,
  FiCalendar,
  FiStar,
  FiTerminal,
} from 'react-icons/fi';
import { useGetProjectsQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../common/Skeleton';
import { ErrorState, EmptyState } from '../common/FeedbackStates';
import { handleImageError } from '../../utils/imageFallback';

const DEFAULT_PROJECT_CATEGORIES = ['Full Stack', 'Frontend', 'Backend'];

export const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: settingsData } = useGetSettingsQuery();
  const projectsTabsVisibility = settingsData?.data?.projectsTabsVisibility || {};

  // Query all active projects
  const { data: allProjectsData } = useGetProjectsQuery({ limit: 100 });
  
  // Compute available categories: combine default categories and any project-specific categories,
  // then filter out any that are explicitly turned false in the dashboard.
  const availableCategories = useMemo(() => {
    const list = allProjectsData?.data?.projects || [];
    const discoveredCats = list.map((p) => p.category).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_PROJECT_CATEGORIES, ...discoveredCats]));
    const visible = combined.filter((cat) => projectsTabsVisibility[cat] !== false);
    return ['All', ...visible];
  }, [allProjectsData, projectsTabsVisibility]);

  const { data: projectsData, isLoading, isError, refetch } = useGetProjectsQuery({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    limit: 20,
  });

  const rawProjects = projectsData?.data?.projects || [];
  // Also filter projects so disabled categories are omitted from display
  const projects = rawProjects.filter(
    (p) => !p.category || projectsTabsVisibility[p.category] !== false
  );

  return (
    <section id="projects" className="py-32 relative overflow-hidden">
      {/* Background Ambience & Gradient Orbs */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-transparent blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Centered Aesthetic */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
            <FiLayers className="w-3.5 h-3.5" />
            {settingsData?.data?.sectionHeaders?.projects?.badge || 'Production Software & Enterprise Systems'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {settingsData?.data?.sectionHeaders?.projects?.title || 'Featured Architectural Highlights'}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settingsData?.data?.sectionHeaders?.projects?.subtitle ||
              'Explore enterprise property management portals, agency platforms with live administrative dashboards, and full-stack e-commerce storefronts.'}
          </p>
        </div>

        {/* Dynamic Category Pills - Exact Match to Skills Section */}
        {availableCategories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-inner max-w-fit mx-auto mb-16 gap-1">
            {availableCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'text-white shadow-md shadow-teal-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeProjectTab"
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

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[480px] rounded-3xl" count={3} />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message="Failed to load project database." />
        ) : projects.length === 0 ? (
          <EmptyState title="No projects found" description="Try selecting a different category filter." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.article
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 hover:border-teal-500/50 dark:hover:border-teal-500/50 shadow-sm hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Card Accent Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="p-6">
                  {/* Visual Frame */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-6 group/image shadow-md border border-slate-200/50 dark:border-slate-800">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                    {/* Category & Status Pill */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-bold bg-slate-950/90 text-teal-300 backdrop-blur-md border border-teal-500/30 shadow-xs">
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center gap-1 shadow-xs">
                          <FiStar className="w-3 h-3 fill-slate-950" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Timeline Pill */}
                    {(project.startDate || project.endDate) && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl text-[10px] font-mono bg-slate-950/85 text-slate-300 backdrop-blur-md border border-slate-800 flex items-center gap-1.5 shadow-xs">
                        <FiCalendar className="w-3 h-3 text-teal-400" />
                        {project.startDate || '2024'} {project.endDate ? `— ${project.endDate}` : ''}
                      </span>
                    )}

                    {/* Direct Live Preview Action Button */}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/90 hover:bg-teal-500 text-white text-xs font-mono font-bold backdrop-blur-md hover:scale-105 transition-all shadow-lg shadow-teal-600/30"
                        title="Open Live Production App"
                      >
                        <span>Live</span>
                        <FiArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Project Title */}
                  <Link to={`/projects/${project.slug}`} className="block group/link">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover/link:text-teal-600 dark:group-hover/link:text-teal-400 transition-colors line-clamp-1 mb-2.5 tracking-tight">
                      {project.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 font-normal">
                    {project.description}
                  </p>

                  {/* Tech Stack Pills */}
                  {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/40">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Link
                    to={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-teal-600 dark:text-teal-400 group-hover:text-teal-500 transition-colors"
                  >
                    <span>View Case Study</span>
                    <FiArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>

                  <div className="flex items-center gap-1">
                    {project.githubClientUrl && (
                      <a
                        href={project.githubClientUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                        title="Frontend Client Code"
                      >
                        <FiCode className="w-4 h-4 text-teal-500" />
                      </a>
                    )}
                    {project.githubServerUrl && (
                      <a
                        href={project.githubServerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                        title="Backend Server Code"
                      >
                        <FiDatabase className="w-4 h-4 text-emerald-500" />
                      </a>
                    )}
                    {project.githubUrl && !project.githubClientUrl && !project.githubServerUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                        title="GitHub Repo"
                      >
                        <FiGithub className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
