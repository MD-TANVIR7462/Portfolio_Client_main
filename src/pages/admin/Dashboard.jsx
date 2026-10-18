import React from 'react';
import {
  FiFolder,
  FiCode,
  FiBriefcase,
  FiBook,
  FiMail,
  FiEye,
  FiClock,
} from 'react-icons/fi';
import { useGetAdminStatsQuery } from '@/redux/api/apiSlice';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/FeedbackStates';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { data: statsData, isLoading, isError, refetch } = useGetAdminStatsQuery();
  const stats = statsData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-28 rounded-2xl" count={4} />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !stats) {
    return <ErrorState onRetry={refetch} message="Failed to load dashboard metrics." />;
  }

  const statCards = [
    { title: 'Total Projects', value: stats.totalProjects, icon: FiFolder, color: 'text-teal-600', link: '/admin/projects' },
    { title: 'Skills Listed', value: stats.totalSkills, icon: FiCode, color: 'text-emerald-600', link: '/admin/skills' },
    { title: 'Career Roles', value: stats.totalExperiences, icon: FiBriefcase, color: 'text-teal-500', link: '/admin/experience' },
    { title: 'Courses & Certs', value: stats.totalCourses || 0, icon: FiBook, color: 'text-cyan-600', link: '/admin/courses' },
    { title: 'Articles / Blogs', value: stats.totalBlogs || 0, icon: FiFolder, color: 'text-indigo-600', link: '/admin/blogs' },
    { title: 'Unread Messages', value: stats.unreadContacts, icon: FiMail, color: 'text-rose-600', link: '/admin/messages' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          System Overview
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time snapshot of your portfolio database and public metrics.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Contact Inquiries */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <FiClock className="w-4 h-4 text-teal-500" />
            Recent Contact Messages
          </h3>
          <Link
            to="/admin/messages"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            View All ({stats.totalContacts})
          </Link>
        </div>

        {stats.recentContacts?.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No messages received yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentContacts.map((contact) => (
              <div
                key={contact._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {contact.name}
                    </span>
                    <span className="text-xs text-slate-400">({contact.email})</span>
                    {contact.status === 'unread' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                    <span className="font-semibold">{contact.subject}</span>: {contact.message}
                  </p>
                </div>
                <Link
                  to="/admin/messages"
                  className="text-xs font-medium text-slate-500 hover:text-teal-500 flex items-center gap-1 self-start sm:self-auto"
                >
                  <FiEye className="w-3.5 h-3.5" />
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
