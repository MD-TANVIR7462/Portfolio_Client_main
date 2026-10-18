import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useGetSettingsQuery, useUpdateSettingsMutation, useSeedDatabaseMutation } from '@/redux/api/apiSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { ImagePreview } from '../../components/common/ImagePreview';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/FeedbackStates';
import { Switch } from '../../components/common/Switch';

const settingsSchema = z.object({
  siteTitle: z.string().min(2, 'Site title is required'),
  siteDescription: z.string().min(5, 'Site description is required'),
  logo: z.string().url('Logo must be a valid URL'),
  favicon: z.string().url('Favicon must be a valid URL'),
  metaKeywords: z.string().min(2, 'Keywords required'),
  heroText: z.string().min(5, 'Hero text required'),
  footerText: z.string().min(2, 'Footer copyright text required'),
  adminEmail: z.string().email('Admin notification email is required'),
  sectionsVisibility: z
    .object({
      about: z.boolean().optional(),
      skills: z.boolean().optional(),
      projects: z.boolean().optional(),
      courses: z.boolean().optional(),
      experience: z.boolean().optional(),
      education: z.boolean().optional(),
      testimonials: z.boolean().optional(),
      blog: z.boolean().optional(),
      contact: z.boolean().optional(),
    })
    .optional(),
  skillsTabsVisibility: z.record(z.boolean()).optional(),
  projectsTabsVisibility: z.record(z.boolean()).optional(),
  sectionsOrder: z.array(z.string()).optional(),
  sectionsSerial: z.record(z.string()).optional(),
  sectionHeaders: z
    .record(
      z.object({
        badge: z.string().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
      })
    )
    .optional(),
});

export const AdminSettings = () => {
  const { data: settingsData, isLoading, isError, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const [seedDatabase, { isLoading: isSeeding }] = useSeedDatabaseMutation();

  const handleSyncRealData = async () => {
    try {
      await seedDatabase().unwrap();
      toast.success('Successfully populated database with real CV & Live Projects!');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Sync failed');
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      sectionsVisibility: {
        about: true,
        skills: true,
        projects: true,
        courses: true,
        experience: true,
        education: true,
        testimonials: true,
        blog: true,
        contact: true,
      },
      skillsTabsVisibility: {
        Frontend: true,
        Backend: true,
        Database: true,
        Tools: true,
        DevOps: true,
        Other: true,
      },
      projectsTabsVisibility: {
        'Full Stack': true,
        Frontend: true,
        Backend: true,
      },
      sectionsSerial: {
        about: '1',
        skills: '2',
        projects: '3',
        courses: '4',
        experience: '5',
        education: '6',
        testimonials: '7',
        blog: '8',
        contact: '9',
      },
    },
  });

  const logoValue = watch('logo');
  const faviconValue = watch('favicon');
  const sectionsVisibility = watch('sectionsVisibility') || {};
  const skillsTabsVisibility = watch('skillsTabsVisibility') || {};
  const projectsTabsVisibility = watch('projectsTabsVisibility') || {};
  const sectionsSerial = watch('sectionsSerial') || {};

  useEffect(() => {
    if (settingsData?.data) {
      const data = settingsData.data;
      reset({
        ...data,
        sectionsVisibility: {
          about: data.sectionsVisibility?.about ?? true,
          skills: data.sectionsVisibility?.skills ?? true,
          projects: data.sectionsVisibility?.projects ?? true,
          courses: data.sectionsVisibility?.courses ?? true,
          experience: data.sectionsVisibility?.experience ?? true,
          education: data.sectionsVisibility?.education ?? true,
          testimonials: data.sectionsVisibility?.testimonials ?? true,
          blog: data.sectionsVisibility?.blog ?? true,
          contact: data.sectionsVisibility?.contact ?? true,
        },
        skillsTabsVisibility: {
          Frontend: data.skillsTabsVisibility?.Frontend ?? true,
          Backend: data.skillsTabsVisibility?.Backend ?? true,
          Database: data.skillsTabsVisibility?.Database ?? true,
          Tools: data.skillsTabsVisibility?.Tools ?? true,
          DevOps: data.skillsTabsVisibility?.DevOps ?? true,
          Other: data.skillsTabsVisibility?.Other ?? true,
        },
        projectsTabsVisibility: {
          'Full Stack': data.projectsTabsVisibility?.['Full Stack'] ?? true,
          Frontend: data.projectsTabsVisibility?.Frontend ?? true,
          Backend: data.projectsTabsVisibility?.Backend ?? true,
        },
        sectionsSerial: {
          about: String(data.sectionsSerial?.about ?? '1'),
          skills: String(data.sectionsSerial?.skills ?? '2'),
          projects: String(data.sectionsSerial?.projects ?? '3'),
          courses: String(data.sectionsSerial?.courses ?? '4'),
          experience: String(data.sectionsSerial?.experience ?? '5'),
          education: String(data.sectionsSerial?.education ?? '6'),
          testimonials: String(data.sectionsSerial?.testimonials ?? '7'),
          blog: String(data.sectionsSerial?.blog ?? '8'),
          contact: String(data.sectionsSerial?.contact ?? '9'),
        },
        sectionHeaders: {
          about: {
            badge: data.sectionHeaders?.about?.badge ?? 'Developer Profile & Engineering Philosophy',
            title: data.sectionHeaders?.about?.title ?? 'Architecting With Precision',
            subtitle: data.sectionHeaders?.about?.subtitle ?? 'Passionate full-stack developer committed to crafting accessible, scalable, high-performance web applications and resilient systems.',
          },
          skills: {
            badge: data.sectionHeaders?.skills?.badge ?? 'Core Stack & Production Tooling',
            title: data.sectionHeaders?.skills?.title ?? 'Frontend Mastery & MERN Architecture',
            subtitle: data.sectionHeaders?.skills?.subtitle ?? 'Leading frontend architecture with Next.js, React 18, and TypeScript alongside scalable Node.js microservices and resilient MongoDB data pipelines.',
          },
          projects: {
            badge: data.sectionHeaders?.projects?.badge ?? 'Production Software & Enterprise Systems',
            title: data.sectionHeaders?.projects?.title ?? 'Featured Architectural Highlights',
            subtitle: data.sectionHeaders?.projects?.subtitle ?? 'Explore enterprise property management portals, agency platforms with live administrative dashboards, and full-stack e-commerce storefronts.',
          },
          courses: {
            badge: data.sectionHeaders?.courses?.badge ?? 'Specialized Learning & Certifications',
            title: data.sectionHeaders?.courses?.title ?? 'Courses & Professional Accreditations',
            subtitle: data.sectionHeaders?.courses?.subtitle ?? 'Rigorous masterclasses, deep-dive courses, and verified developer certifications completed.',
          },
          experience: {
            badge: data.sectionHeaders?.experience?.badge ?? 'Verified Career Trajectory',
            title: data.sectionHeaders?.experience?.title ?? 'Commercial Work Experience',
            subtitle: data.sectionHeaders?.experience?.subtitle ?? 'Leading engineering architecture, modernizing mission-critical web applications, and delivering production client solutions.',
          },
          education: {
            badge: data.sectionHeaders?.education?.badge ?? 'Academic Foundations & Credentials',
            title: data.sectionHeaders?.education?.title ?? 'Education & Academic Background',
            subtitle: data.sectionHeaders?.education?.subtitle ?? 'Formal Computer Science & Engineering degree foundations powering algorithmic problem-solving.',
          },
          testimonials: {
            badge: data.sectionHeaders?.testimonials?.badge ?? 'Endorsements & Recommendations',
            title: data.sectionHeaders?.testimonials?.title ?? 'Client & Colleague Praise',
            subtitle: data.sectionHeaders?.testimonials?.subtitle ?? 'Feedback from project stakeholders, engineering leads, and technical founders I have collaborated with.',
          },
          blog: {
            badge: data.sectionHeaders?.blog?.badge ?? 'Engineering Insights & Knowledge Base',
            title: data.sectionHeaders?.blog?.title ?? 'Publications & Deep-Dive Tutorials',
            subtitle: data.sectionHeaders?.blog?.subtitle ?? 'Real-world software engineering articles, architecture retrospectives, and full-stack performance patterns.',
          },
          contact: {
            badge: data.sectionHeaders?.contact?.badge ?? 'Direct Inquiries & Collaboration',
            title: data.sectionHeaders?.contact?.title ?? 'Let’s Discuss Your Next Build',
            subtitle: data.sectionHeaders?.contact?.subtitle ?? 'Whether you have a technical question, an open position, or an interesting engineering problem to solve, feel free to drop a message.',
          },
        },
      });
    }
  }, [settingsData, reset]);

  const onSubmit = async (values) => {
    try {
      // Sort sections by user input serial number
      const serials = values.sectionsSerial || {};
      const sortedKeys = Object.keys(serials).sort((a, b) => {
        return (Number(serials[a]) || 0) - (Number(serials[b]) || 0);
      });

      const payload = {
        ...values,
        sectionsOrder: sortedKeys,
      };

      await updateSettings(payload).unwrap();
      toast.success('Site settings and section serials updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} message="Failed to load settings." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Global Portfolio Settings
        </h2>
        <p className="text-xs text-slate-500">
          Configure site metadata, brand logo & favicon URLs, SEO attributes, and footer details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Display Serial Inputs Master Control */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              Home Page Section Serial Order (Numeric Inputs)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter the serial number for each section (e.g. 1 for first, 2 for second, etc.). The Home page and Navbar will arrange sections according to the numbers you specify.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
            {[
              { key: 'about', label: 'About & Bio', defaultSerial: '1' },
              { key: 'skills', label: 'Skills & Tech Stack', defaultSerial: '2' },
              { key: 'projects', label: 'Projects Showcase', defaultSerial: '3' },
              { key: 'courses', label: 'Courses & Certifications', defaultSerial: '4' },
              { key: 'experience', label: 'Work Experience', defaultSerial: '5' },
              { key: 'education', label: 'Academic Education', defaultSerial: '6' },
              { key: 'testimonials', label: 'Client Testimonials', defaultSerial: '7' },
              { key: 'blog', label: 'Blog & Articles', defaultSerial: '8' },
              { key: 'contact', label: 'Contact Section', defaultSerial: '9' },
            ].map((sec) => (
              <div
                key={sec.key}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shadow-xs hover:border-indigo-500/40 transition-colors"
              >
                <div className="truncate pr-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {sec.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {sec.key}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                    Serial:
                  </span>
                  <input
                    type="text"
                    defaultValue={sec.defaultSerial}
                    placeholder="e.g. 1"
                    className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-center text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                    {...register(`sectionsSerial.${sec.key}`)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Visibility Master Switches */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              Home Page & Navigation Section Visibility
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Toggle any section on or off. Inactive sections are immediately hidden from the home page and top navigation bar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {[
              { key: 'about', label: 'About & Bio', desc: 'Summary, metrics & stats' },
              { key: 'skills', label: 'Skills & Tech Stack', desc: 'Categorized competency cloud' },
              { key: 'projects', label: 'Projects Showcase', desc: 'Full-stack & frontend projects' },
              { key: 'courses', label: 'Courses & Certifications', desc: 'Tutorials & credential badges' },
              { key: 'experience', label: 'Work Experience', desc: 'SaibonSoft, Siscotek & career roles' },
              { key: 'education', label: 'Academic Education', desc: 'University & Diploma degrees' },
              { key: 'testimonials', label: 'Client Testimonials', desc: 'Recommendations & social proof' },
              { key: 'blog', label: 'Blog & Articles', desc: 'Technical writeups & insights' },
              { key: 'contact', label: 'Contact Section', desc: 'Inquiry form & direct contacts' },
            ].map((sec) => {
              const isChecked = sectionsVisibility[sec.key] !== false;
              return (
                <div
                  key={sec.key}
                  className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isChecked
                      ? 'border-teal-500/40 bg-teal-50/30 dark:bg-teal-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 opacity-70'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {sec.label}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isChecked
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {isChecked ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {sec.desc}
                    </p>
                  </div>
                  <Switch
                    checked={isChecked}
                    onChange={(e) => {
                      setValue(`sectionsVisibility.${sec.key}`, e.target.checked, { shouldDirty: true });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills Category Tabs Controls */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              Skills Section Category Tabs Control
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Turn specific skill category tabs on or off. Inactive tabs (e.g. DevOps, Database) and their skills will be excluded from the public skills section.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {['Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Other'].map((cat) => {
              const isChecked = skillsTabsVisibility[cat] !== false;
              return (
                <div
                  key={cat}
                  className={`relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all ${
                    isChecked
                      ? 'border-cyan-500/40 bg-cyan-50/30 dark:bg-cyan-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {cat}
                    </span>
                    <Switch
                      checked={isChecked}
                      onChange={(e) => {
                        setValue(`skillsTabsVisibility.${cat}`, e.target.checked, { shouldDirty: true });
                      }}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded text-center w-fit font-bold ${
                      isChecked
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {isChecked ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects Category Tabs Controls */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Projects Section Category Tabs Control
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Control which project filter tabs appear on the home page showcase. Inactive category tabs will not be shown to visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {['Full Stack', 'Frontend', 'Backend'].map((cat) => {
              const isChecked = projectsTabsVisibility[cat] !== false;
              return (
                <div
                  key={cat}
                  className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isChecked
                      ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 opacity-70'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {cat} Projects
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded mt-1 inline-block font-bold ${
                        isChecked
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {isChecked ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <Switch
                    checked={isChecked}
                    onChange={(e) => {
                      setValue(`projectsTabsVisibility.${cat}`, e.target.checked, { shouldDirty: true });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Section Headers (Title, Subtitle, Badge) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              Dynamic Section Headers (Titles, Subtitles & Badges)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Customize the section badge pill, main header title, and secondary subtitle displayed across all portfolio sections on the public site.
            </p>
          </div>

          <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { key: 'about', label: 'About Section' },
              { key: 'skills', label: 'Skills Section' },
              { key: 'projects', label: 'Projects Section' },
              { key: 'courses', label: 'Courses Section' },
              { key: 'experience', label: 'Experience Section' },
              { key: 'education', label: 'Education Section' },
              { key: 'testimonials', label: 'Testimonials Section' },
              { key: 'blog', label: 'Blog Section' },
              { key: 'contact', label: 'Contact Section' },
            ].map((sec, idx) => (
              <div key={sec.key} className={`space-y-3.5 ${idx > 0 ? 'pt-6' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400">
                    {sec.label} Header
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                    ID: {sec.key}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Badge / Small Pill Text"
                    placeholder="e.g. Core Stack & Production Tooling"
                    {...register(`sectionHeaders.${sec.key}.badge`)}
                  />
                  <Input
                    label="Main Section Title"
                    placeholder="e.g. Frontend Mastery & MERN Architecture"
                    {...register(`sectionHeaders.${sec.key}.title`)}
                  />
                </div>

                <Textarea
                  label="Section Subtitle / Description"
                  rows={2}
                  placeholder="Enter a descriptive subtitle for this section..."
                  {...register(`sectionHeaders.${sec.key}.subtitle`)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <Input
            label="Site Title (Meta Title)"
            placeholder="Alex Rivera | Senior MERN Developer"
            error={errors.siteTitle?.message}
            {...register('siteTitle')}
          />

          <Textarea
            label="Site Description (Meta Description for SEO)"
            rows={2}
            placeholder="Official portfolio of..."
            error={errors.siteDescription?.message}
            {...register('siteDescription')}
          />

          <Input
            label="Meta Keywords (comma separated)"
            placeholder="MERN, React, RTK Query, Node.js"
            error={errors.metaKeywords?.message}
            {...register('metaKeywords')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Logo Image URL"
              placeholder="https://images.unsplash.com/..."
              error={errors.logo?.message}
              {...register('logo')}
            />
            <Input
              label="Favicon Image URL"
              placeholder="https://images.unsplash.com/..."
              error={errors.favicon?.message}
              {...register('favicon')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ImagePreview src={logoValue} aspectRatio="aspect-square w-20 h-20 mx-auto" previewLabel="Logo Preview" />
            <ImagePreview src={faviconValue} aspectRatio="aspect-square w-12 h-12 mx-auto" previewLabel="Favicon Preview" />
          </div>

          <Input
            label="Hero Secondary Subtext"
            placeholder="I architect robust distributed backend APIs..."
            error={errors.heroText?.message}
            {...register('heroText')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Footer Copyright Text"
              placeholder="© 2026 Alex Rivera. All rights reserved."
              error={errors.footerText?.message}
              {...register('footerText')}
            />
            <Input
              label="Admin Notification Email"
              placeholder="admin@portfolio.com"
              error={errors.adminEmail?.message}
              {...register('adminEmail')}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* <Button
              type="button"
              variant="outline"
              onClick={handleSyncRealData}
              isLoading={isSeeding}
              className="w-full sm:w-auto border-teal-500/50 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
            >
              Sync Real CV & Live Projects Data
            </Button> */}
<div></div>
            <Button type="submit" variant="primary" size="lg" isLoading={isUpdating} className="w-full sm:w-auto">
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
