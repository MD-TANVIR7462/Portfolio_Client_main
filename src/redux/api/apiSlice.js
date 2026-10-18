import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../features/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  credentials: 'include', // for httpOnly refresh cookies
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult?.data?.data?.accessToken) {
      api.dispatch(
        setCredentials({
          accessToken: refreshResult.data.data.accessToken,
        })
      );
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'About',
    'Skill',
    'Project',
    'Experience',
    'Education',
    'Testimonial',
    'Blog',
    'Contact',
    'Settings',
    'Stats',
    'Auth',
    'User',
  ],
  endpoints: (builder) => ({
    // AUTH
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    logoutApi: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/update-profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    changePassword: builder.mutation({
      query: (passwords) => ({
        url: '/auth/change-password',
        method: 'PATCH',
        body: passwords,
      }),
    }),

    // ADMIN USER MANAGEMENT
    getUsers: builder.query({
      query: (params) => ({
        url: '/auth/users',
        params,
      }),
      providesTags: (result) =>
        result?.data?.users
          ? [
              ...result.data.users.map(({ _id }) => ({ type: 'User', id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : Array.isArray(result?.data)
          ? [
              ...result.data.map(({ _id }) => ({ type: 'User', id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    createAdminUser: builder.mutation({
      query: (data) => ({
        url: '/auth/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `/auth/users/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // ABOUT
    getAbout: builder.query({
      query: () => '/about',
      providesTags: ['About'],
    }),
    updateAbout: builder.mutation({
      query: (data) => ({
        url: '/about',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['About'],
    }),

    // SKILLS
    getSkills: builder.query({
      query: (params) => ({
        url: '/skills',
        params,
      }),
      providesTags: (result) =>
        result?.data?.skills
          ? [
              ...result.data.skills.map(({ _id }) => ({ type: 'Skill', id: _id })),
              { type: 'Skill', id: 'LIST' },
            ]
          : Array.isArray(result?.data)
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Skill', id: _id })),
              { type: 'Skill', id: 'LIST' },
            ]
          : [{ type: 'Skill', id: 'LIST' }],
    }),
    createSkill: builder.mutation({
      query: (data) => ({
        url: '/skills',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Skill', id: 'LIST' }, 'Stats'],
    }),
    updateSkill: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/skills/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Skill', id },
        { type: 'Skill', id: 'LIST' },
      ],
    }),
    deleteSkill: builder.mutation({
      query: (id) => ({
        url: `/skills/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Skill', id: 'LIST' }, 'Stats'],
    }),
    reorderSkills: builder.mutation({
      query: (items) => ({
        url: '/skills/reorder',
        method: 'PATCH',
        body: { items },
      }),
      invalidatesTags: [{ type: 'Skill', id: 'LIST' }],
    }),

    // PROJECTS
    getProjects: builder.query({
      query: (params) => ({
        url: '/projects',
        params,
      }),
      providesTags: (result) =>
        result?.data?.projects
          ? [
              ...result.data.projects.map(({ _id }) => ({ type: 'Project', id: _id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    getProjectBySlug: builder.query({
      query: (slug) => `/projects/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Project', id: slug }],
    }),
    getRelatedProjects: builder.query({
      query: (slug) => `/projects/related/${slug}`,
      providesTags: (result) => [{ type: 'Project', id: 'RELATED' }],
    }),
    createProject: builder.mutation({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }, 'Stats'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }, 'Stats'],
    }),
    reorderProjects: builder.mutation({
      query: (items) => ({
        url: '/projects/reorder',
        method: 'PATCH',
        body: { items },
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    // EXPERIENCE
    getExperiences: builder.query({
      query: (params) => ({
        url: '/experience',
        params,
      }),
      providesTags: (result) =>
        result?.data?.experiences
          ? [
              ...result.data.experiences.map(({ _id }) => ({ type: 'Experience', id: _id })),
              { type: 'Experience', id: 'LIST' },
            ]
          : Array.isArray(result?.data)
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Experience', id: _id })),
              { type: 'Experience', id: 'LIST' },
            ]
          : [{ type: 'Experience', id: 'LIST' }],
    }),
    createExperience: builder.mutation({
      query: (data) => ({
        url: '/experience',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Experience', id: 'LIST' }, 'Stats'],
    }),
    updateExperience: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/experience/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Experience', id },
        { type: 'Experience', id: 'LIST' },
      ],
    }),
    deleteExperience: builder.mutation({
      query: (id) => ({
        url: `/experience/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Experience', id: 'LIST' }, 'Stats'],
    }),

    // EDUCATION
    getEducations: builder.query({
      query: (params) => ({
        url: '/education',
        params,
      }),
      providesTags: (result) =>
        result?.data?.educations
          ? [
              ...result.data.educations.map(({ _id }) => ({ type: 'Education', id: _id })),
              { type: 'Education', id: 'LIST' },
            ]
          : Array.isArray(result?.data)
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Education', id: _id })),
              { type: 'Education', id: 'LIST' },
            ]
          : [{ type: 'Education', id: 'LIST' }],
    }),
    createEducation: builder.mutation({
      query: (data) => ({
        url: '/education',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Education', id: 'LIST' }],
    }),
    updateEducation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/education/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Education', id },
        { type: 'Education', id: 'LIST' },
      ],
    }),
    deleteEducation: builder.mutation({
      query: (id) => ({
        url: `/education/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Education', id: 'LIST' }],
    }),

    // TESTIMONIALS
    getTestimonials: builder.query({
      query: (params) => ({
        url: '/testimonials',
        params,
      }),
      providesTags: (result) =>
        result?.data?.testimonials
          ? [
              ...result.data.testimonials.map(({ _id }) => ({ type: 'Testimonial', id: _id })),
              { type: 'Testimonial', id: 'LIST' },
            ]
          : Array.isArray(result?.data)
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Testimonial', id: _id })),
              { type: 'Testimonial', id: 'LIST' },
            ]
          : [{ type: 'Testimonial', id: 'LIST' }],
    }),
    createTestimonial: builder.mutation({
      query: (data) => ({
        url: '/testimonials',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Testimonial', id: 'LIST' }, 'Stats'],
    }),
    updateTestimonial: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/testimonials/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Testimonial', id },
        { type: 'Testimonial', id: 'LIST' },
      ],
    }),
    deleteTestimonial: builder.mutation({
      query: (id) => ({
        url: `/testimonials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Testimonial', id: 'LIST' }, 'Stats'],
    }),

    // BLOG
    getBlogs: builder.query({
      query: (params) => ({
        url: '/blog',
        params,
      }),
      providesTags: (result) =>
        result?.data?.blogs
          ? [
              ...result.data.blogs.map(({ _id }) => ({ type: 'Blog', id: _id })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),
    getBlogBySlug: builder.query({
      query: (slug) => `/blog/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
    }),
    getRelatedBlogs: builder.query({
      query: (slug) => `/blog/related/${slug}`,
      providesTags: (result) => [{ type: 'Blog', id: 'RELATED' }],
    }),
    createBlog: builder.mutation({
      query: (data) => ({
        url: '/blog',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }, 'Stats'],
    }),
    updateBlog: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/blog/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Blog', id },
        { type: 'Blog', id: 'LIST' },
      ],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blog/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }, 'Stats'],
    }),

    // COURSES
    getCourses: builder.query({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      providesTags: (result) =>
        result?.data?.courses
          ? [
              ...result.data.courses.map(({ _id }) => ({ type: 'Course', id: _id })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),
    getCourseBySlug: builder.query({
      query: (slug) => `/courses/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Course', id: slug }],
    }),
    getRelatedCourses: builder.query({
      query: (slug) => `/courses/related/${slug}`,
      providesTags: (result) => [{ type: 'Course', id: 'RELATED' }],
    }),
    createCourse: builder.mutation({
      query: (data) => ({
        url: '/courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Course', id: 'LIST' }, 'Stats'],
    }),
    updateCourse: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/courses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Course', id: 'LIST' }, 'Stats'],
    }),

    // CONTACT
    sendContact: builder.mutation({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Contact', id: 'LIST' }, 'Stats'],
    }),
    getContacts: builder.query({
      query: (params) => ({
        url: '/contact',
        params,
      }),
      providesTags: (result) =>
        result?.data?.contacts
          ? [
              ...result.data.contacts.map(({ _id }) => ({ type: 'Contact', id: _id })),
              { type: 'Contact', id: 'LIST' },
            ]
          : Array.isArray(result?.data)
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Contact', id: _id })),
              { type: 'Contact', id: 'LIST' },
            ]
          : [{ type: 'Contact', id: 'LIST' }],
    }),
    updateContactStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Contact', id },
        { type: 'Contact', id: 'LIST' },
        'Stats',
      ],
    }),
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Contact', id: 'LIST' }, 'Stats'],
    }),

    // SETTINGS
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    seedDatabase: builder.mutation({
      query: () => ({
        url: '/settings/seed',
        method: 'POST',
      }),
      invalidatesTags: ['Settings', 'About', 'Skill', 'Project', 'Experience', 'Education', 'Testimonial', 'Blog', 'Course', 'Stats'],
    }),

    // ADMIN STATS
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutApiMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUsersQuery,
  useCreateAdminUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useGetAboutQuery,
  useUpdateAboutMutation,
  useGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useReorderSkillsMutation,
  useGetProjectsQuery,
  useGetProjectBySlugQuery,
  useGetRelatedProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectsMutation,
  useGetExperiencesQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
  useGetEducationsQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useGetTestimonialsQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
  useGetBlogsQuery,
  useGetBlogBySlugQuery,
  useGetRelatedBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetCoursesQuery,
  useGetCourseBySlugQuery,
  useGetRelatedCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useSendContactMutation,
  useGetContactsQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useSeedDatabaseMutation,
  useGetAdminStatsQuery,
} = apiSlice;
