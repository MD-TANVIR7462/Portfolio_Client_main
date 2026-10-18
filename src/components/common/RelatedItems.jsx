import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBookOpen, FiLayers, FiAward } from 'react-icons/fi';
import { handleImageError } from '../../utils/imageFallback';

export const RelatedItems = ({
  title = 'Related Works',
  subtitle = 'Discover complementary engineering case studies and articles.',
  items = [],
  type = 'projects', // 'projects' | 'blogs' | 'courses'
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="mt-16 pt-12 border-t border-slate-200/80 dark:border-slate-800">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  const getHref = (item) => {
    if (type === 'projects') return `/projects/${item.slug}`;
    if (type === 'blogs') return `/blog/${item.slug}`;
    if (type === 'courses') return `/courses/${item.slug}`;
    return '#';
  };

  const getIcon = () => {
    if (type === 'projects') return FiLayers;
    if (type === 'blogs') return FiBookOpen;
    return FiAward;
  };

  const IconComponent = getIcon();

  return (
    <div className="mt-20 pt-14 border-t border-slate-200/80 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1.5">
            <IconComponent className="w-3.5 h-3.5" />
            <span>Curated Suggestions</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const href = getHref(item);
          const imageSrc = item.thumbnail || item.coverImage;
          const badgeText = item.category || item.platform;

          return (
            <motion.div
              key={item._id || item.slug || idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Link
                to={href}
                className="group flex flex-col h-full rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/60 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={imageSrc}
                    alt={item.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                  {badgeText && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-teal-300 backdrop-blur-md border border-teal-500/30">
                      {badgeText}
                    </span>
                  )}
                </div>

                {/* Content Box */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description || item.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                    <span>Explore details</span>
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
