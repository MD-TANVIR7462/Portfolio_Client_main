import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { ProjectDetails } from '../pages/ProjectDetails';
import { BlogDetails } from '../pages/BlogDetails';
import { CourseDetails } from '../pages/CourseDetails';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Dashboard } from '../pages/admin/Dashboard';
import { AdminProjects } from '../pages/admin/Projects';
import { AdminSkills } from '../pages/admin/Skills';
import { AdminExperience } from '../pages/admin/Experience';
import { AdminEducation } from '../pages/admin/Education';
import { AdminTestimonials } from '../pages/admin/Testimonials';
import { AdminBlogs } from '../pages/admin/Blogs';
import { AdminCourses } from '../pages/admin/Courses';
import { AdminMessages } from '../pages/admin/Messages';
import { AdminAbout } from '../pages/admin/About';
import { AdminSettings } from '../pages/admin/Settings';
import { AdminUsers } from '../pages/admin/Users';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/projects/:slug" element={<ProjectDetails />} />
      <Route path="/blog/:slug" element={<BlogDetails />} />
      <Route path="/courses/:slug" element={<CourseDetails />} />

      {/* Protected Admin Suite */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="experience" element={<AdminExperience />} />
          <Route path="education" element={<AdminEducation />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
