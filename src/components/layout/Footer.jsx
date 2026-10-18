import React from 'react';
import { useGetSettingsQuery, useGetAboutQuery } from '@/redux/api/apiSlice';
import { FiGithub, FiLinkedin, FiTwitter, FiGlobe, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';

const getSocialIcon = (platform) => {
  const p = platform.toLowerCase();
  if (p.includes('git')) return FiGithub;
  if (p.includes('link')) return FiLinkedin;
  if (p.includes('twit') || p.includes('x')) return FiTwitter;
  return FiGlobe;
};

export const Footer = () => {
  const { data: settingsData } = useGetSettingsQuery();
  const { data: aboutData } = useGetAboutQuery();

  const settings = settingsData?.data;
  const about = aboutData?.data;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-colors py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <Link to="/">
            <BrandLogo size="sm" />
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {settings?.footerText || `© ${new Date().getFullYear()} Tajul Islam Tanvir. All rights reserved.`}
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {(settings?.socialLinks?.length ? settings.socialLinks : about?.socialLinks || []).map(
            (link, idx) => {
              const Icon = getSocialIcon(link.platform);
              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            }
          )}
        </div>

        {/* Admin Portal link */}
        {/* <div>
          <Link
            to="/admin"
            className="text-xs text-slate-400 hover:text-teal-500 transition-colors underline-offset-4 hover:underline"
          >
            Admin Portal
          </Link>
        </div> */}
      </div>
    </footer>
  );
};
