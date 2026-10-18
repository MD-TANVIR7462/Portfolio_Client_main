import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { FiPlus, FiBookOpen, FiExternalLink, FiAward } from 'react-icons/fi';
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from '@/redux/api/apiSlice';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { ImagePreview } from '@/components/common/ImagePreview';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/FeedbackStates';

const courseSchema = z.object({
  title: z.string().min(2, 'Course title is required'),
  instructor: z.string().min(2, 'Instructor name is required'),
  platform: z.string().min(2, 'Platform is required (e.g. Udemy, Coursera)'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  thumbnail: z.string().url('Must be a valid URL').or(z.literal('')),
  courseUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  certificateUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  duration: z.string().default('20 hours'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']).default('All Levels'),
  status: z.enum(['completed', 'in-progress', 'upcoming']).default('completed'),
  skillsString: z.string().optional(),
});

export const AdminCourses = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data: coursesData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCoursesQuery({ page, limit: pageSize, search, sortBy, sortOrder });

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      platform: 'Udemy',
      level: 'All Levels',
      status: 'completed',
      duration: '15 hours',
    },
  });

  const thumbnailValue = watch('thumbnail');

  const openCreateModal = () => {
    setEditingCourse(null);
    reset({
      title: '',
      instructor: '',
      platform: 'Udemy',
      category: 'Full Stack Development',
      description: '',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      courseUrl: '',
      certificateUrl: '',
      duration: '20 hours',
      level: 'All Levels',
      status: 'completed',
      skillsString: 'React, Node.js, Express, MongoDB',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCourse(c);
    reset({
      title: c.title,
      instructor: c.instructor,
      platform: c.platform,
      category: c.category || 'Web Development',
      description: c.description,
      thumbnail: c.thumbnail || '',
      courseUrl: c.courseUrl || '',
      certificateUrl: c.certificateUrl || '',
      duration: c.duration || '20 hours',
      level: c.level || 'All Levels',
      status: c.status || 'completed',
      skillsString: Array.isArray(c.skillsCovered) ? c.skillsCovered.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    const skillsCovered = values.skillsString
      ? values.skillsString.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...values,
      skillsCovered,
    };

    try {
      if (editingCourse) {
        await updateCourse({ id: editingCourse._id, ...payload }).unwrap();
        toast.success('Course updated successfully');
      } else {
        await createCourse(payload).unwrap();
        toast.success('Course created successfully');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteCourse(deleteTargetId).unwrap();
      toast.success('Course deleted');
      setDeleteTargetId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const courses = coursesData?.data?.courses || [];
  const total = coursesData?.data?.pagination?.total || courses.length;

  const columns = [
    {
      field: 'title',
      headerName: 'COURSE TITLE & PLATFORM',
      flex: 1.8,
      minWidth: 220,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div className="flex items-center gap-3">
            <img
              src={row.thumbnail}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
            />
            <div className="truncate">
              <span className="font-semibold text-slate-900 dark:text-white truncate block">
                {row.title}
              </span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium block truncate">
                {row.instructor} • {row.platform}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      field: 'duration',
      headerName: 'DURATION / LEVEL',
      flex: 1.1,
      minWidth: 140,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              {row.duration}
            </span>
            <span className="text-[10px] text-slate-400 block">{row.level}</span>
          </div>
        );
      },
    },
    {
      field: 'skillsCovered',
      headerName: 'SKILLS LEARNED',
      flex: 1.4,
      minWidth: 160,
      cellRenderer: (params) => {
        const skills = params?.value;
        if (!Array.isArray(skills) || skills.length === 0) return <span className="text-xs text-slate-400">-</span>;
        return (
          <div className="flex items-center gap-1 overflow-hidden">
            {skills.slice(0, 2).map((s, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                {s}
              </span>
            ))}
            {skills.length > 2 && (
              <span className="text-[10px] text-slate-400">+{skills.length - 2}</span>
            )}
          </div>
        );
      },
    },
    {
      field: 'status',
      headerName: 'STATUS',
      flex: 0.9,
      minWidth: 110,
      cellRenderer: (params) => {
        const val = params?.value || 'completed';
        const color =
          val === 'completed'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            : val === 'in-progress'
            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';

        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${color}`}>
            {val}
          </span>
        );
      },
    },
    {
      field: 'links',
      headerName: 'LINKS',
      flex: 0.8,
      minWidth: 90,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div className="flex items-center gap-2">
            {row.courseUrl && (
              <a
                href={row.courseUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 hover:text-teal-600 dark:hover:text-teal-400"
                title="View Course"
              >
                <FiExternalLink className="w-4 h-4" />
              </a>
            )}
            {row.certificateUrl && (
              <a
                href={row.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 hover:text-amber-500"
                title="View Certificate"
              >
                <FiAward className="w-4 h-4" />
              </a>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiBookOpen className="text-teal-500" />
            Courses & Professional Certifications
          </h2>
          <p className="text-xs text-slate-500">
            Showcase completed masterclasses, video tutorials, platform accreditations, and certifications.
          </p>
        </div>
        <Button onClick={openCreateModal} icon={FiPlus} variant="primary">
          Add Course
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load courses." />
      ) : (
        <DataTable
          title="Courses & Accreditations"
          columns={columns}
          data={courses}
          loading={isLoading}
          navigating={isFetching}
          sl={true}
          searchPlaceholder="Search courses by title, instructor, platform..."
          searchKeys={['title', 'instructor', 'platform', 'category']}
          quickFilterText={search}
          setQuickFilterText={(val) => {
            setSearch(val);
            setPage(1);
          }}
          currentPage={page}
          pageSize={pageSize}
          total={total}
          serverPagination={true}
          maxHeight="520px"
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onSort={(field, dir) => {
            setSortBy(field);
            setSortOrder(dir);
            setPage(1);
          }}
          onEdit={openEditModal}
          onDelete={(id) => setDeleteTargetId(id)}
          emptyTitle="No courses added yet"
          emptyDescription="List courses you have completed or taught."
        />
      )}

      {/* Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course Record' : 'Add New Course'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Course Title"
            placeholder="e.g. Next.js 14 & React - Complete Developer Course"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Instructor / Author"
              placeholder="e.g. Maximilian Schwarzmüller"
              error={errors.instructor?.message}
              {...register('instructor')}
            />
            <Input
              label="Platform / Provider"
              placeholder="e.g. Udemy / Coursera / Frontend Masters"
              error={errors.platform?.message}
              {...register('platform')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category"
              placeholder="Full Stack / Cloud / DevOps"
              error={errors.category?.message}
              {...register('category')}
            />
            <Input
              label="Duration (Hours or Weeks)"
              placeholder="34 hours"
              error={errors.duration?.message}
              {...register('duration')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Difficulty Level
              </label>
              <select
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                {...register('level')}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Status
              </label>
              <select
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                {...register('status')}
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In-Progress</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <Input
            label="Thumbnail Image URL"
            placeholder="https://images.unsplash.com/..."
            error={errors.thumbnail?.message}
            {...register('thumbnail')}
          />

          <ImagePreview
            src={thumbnailValue}
            aspectRatio="aspect-video w-36 mx-auto"
            previewLabel="Course Thumbnail Preview"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Course / Platform URL"
              placeholder="https://udemy.com/course/..."
              error={errors.courseUrl?.message}
              {...register('courseUrl')}
            />
            <Input
              label="Certificate URL"
              placeholder="https://coursera.org/verify/..."
              error={errors.certificateUrl?.message}
              {...register('certificateUrl')}
            />
          </div>

          <Textarea
            label="Course Description / Key Takeaways"
            rows={3}
            placeholder="Key concepts, architecture patterns, and competencies mastered..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Skills Learned (comma separated)"
            placeholder="Next.js, Server Components, TypeScript, Tailwind"
            {...register('skillsString')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating || isUpdating}>
              {editingCourse ? 'Save Changes' : 'Add Course'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Course Entry?"
        message="This course and certification link will be permanently removed."
      />
    </div>
  );
};

export default AdminCourses;
