import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { About } from '../components/sections/About';
import { Skills } from '../components/sections/Skills';
import { Projects } from '../components/sections/Projects';
import { Courses } from '../components/sections/Courses';
import { Experience } from '../components/sections/Experience';
import { Education } from '../components/sections/Education';
import { Testimonials } from '../components/sections/Testimonials';
import { Blog } from '../components/sections/Blog';
import { Contact } from '../components/sections/Contact';
import { ScrollToTop } from '../components/common/ScrollToTop';
import { useGetSettingsQuery } from '@/redux/api/apiSlice';

export const Home = () => {
  const { data: settingsData } = useGetSettingsQuery();
  const settings = settingsData?.data;
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-teal-500 selection:text-white">
      <Helmet>
        <title>{settings?.siteTitle || 'MERN Stack Developer Portfolio'}</title>
        <meta
          name="description"
          content={
            settings?.siteDescription ||
            'Senior MERN Stack Developer specializing in React, Node.js, and RTK Query architecture.'
          }
        />
        <meta name="keywords" content={settings?.metaKeywords || 'MERN, React, RTK Query, Node.js'} />
        <link rel="icon" href={settings?.favicon || '/favicon.ico'} />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        <Hero />
        {(() => {
          const defaultOrder = [
            'about',
            'skills',
            'projects',
            'courses',
            'experience',
            'education',
            'testimonials',
            'blog',
            'contact',
          ];

          const order =
            settings?.sectionsOrder?.length > 0 ? settings.sectionsOrder : defaultOrder;

          const sectionComponents = {
            about: <About key="about" />,
            skills: <Skills key="skills" />,
            projects: <Projects key="projects" />,
            courses: <Courses key="courses" />,
            experience: <Experience key="experience" />,
            education: <Education key="education" />,
            testimonials: <Testimonials key="testimonials" />,
            blog: <Blog key="blog" />,
            contact: <Contact key="contact" />,
          };

          return order.map((sectionKey) => {
            if (settings?.sectionsVisibility?.[sectionKey] === false) {
              return null;
            }
            return sectionComponents[sectionKey] || null;
          });
        })()}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};
