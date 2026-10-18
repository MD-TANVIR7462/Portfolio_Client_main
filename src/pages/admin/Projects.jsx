import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { FiPlus, FiExternalLink, FiGithub } from 'react-icons/fi';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '@/redux/api/apiSlice';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { ImagePreview } from '@/components/common/ImagePreview';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/FeedbackStates';
import { Switch } from '@/components/common/Switch';

const projectFormSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10, 'Short description is required'),
  content: z.string().optional(),
  thumbnail: z.string().url('Must be a valid image URL'),
  liveUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  githubClientUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  githubServerUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  galleryImagesString: z.string().optional(),
  techStackString: z.string().min(2, 'Comma separated tech stack (e.g. React, Node.js)'),
  keyFeaturesString: z.string().optional(),
  challenges: z.string().optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  status: z.enum(['ongoing', 'completed']).default('completed'),
});

export const AdminProjects = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data: projectsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProjectsQuery({ all: 'true', page, limit: pageSize, search, sortBy, sortOrder });

  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      status: 'completed',
      featured: false,
    },
  });

  const thumbnailValue = watch('thumbnail');

  const openCreateModal = () => {
    setEditingProject(null);
    reset({
      title: '',
      slug: '',
      category: 'Full Stack',
      description: '',
      content: '',
      thumbnail: '',
      galleryImagesString: '',
      liveUrl: '',
      githubUrl: '',
      githubClientUrl: '',
      githubServerUrl: '',
      startDate: '',
      endDate: '',
      techStackString: '',
      keyFeaturesString: '',
      challenges: '',
      featured: false,
      isActive: true,
      status: 'completed',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    reset({
      title: proj.title,
      slug: proj.slug,
      category: proj.category,
      description: proj.description,
      content: proj.content || '',
      thumbnail: proj.thumbnail,
      galleryImagesString: Array.isArray(proj.images) ? proj.images.join('\n') : '',
      liveUrl: proj.liveUrl || '',
      githubUrl: proj.githubUrl || '',
      githubClientUrl: proj.githubClientUrl || '',
      githubServerUrl: proj.githubServerUrl || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      techStackString: proj.techStack ? proj.techStack.join(', ') : '',
      keyFeaturesString: Array.isArray(proj.keyFeatures) ? proj.keyFeatures.join('\n') : '',
      challenges: proj.challenges || '',
      featured: proj.featured || false,
      isActive: proj.isActive !== false,
      status: proj.status || 'completed',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    const techStack = values.techStackString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const keyFeatures = values.keyFeaturesString
      ? values.keyFeaturesString.split('\n').map((f) => f.trim()).filter(Boolean)
      : [];

    const extraImages = values.galleryImagesString
      ? values.galleryImagesString.split('\n').map((img) => img.trim()).filter(Boolean)
      : [];

    const allImages = [values.thumbnail, ...extraImages.filter((img) => img !== values.thumbnail)];

    const payload = {
      ...values,
      techStack,
      keyFeatures,
      images: allImages,
    };

    try {
      if (editingProject) {
        await updateProject({ id: editingProject._id, ...payload }).unwrap();
        toast.success('Project updated successfully');
      } else {
        await createProject(payload).unwrap();
        toast.success('Project created successfully');
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
      await deleteProject(deleteTargetId).unwrap();
      toast.success('Project deleted');
      setDeleteTargetId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const projects = projectsData?.data?.projects || [];
  const total = projectsData?.data?.pagination?.total || projects.length;

  // AG Grid Column Definitions
  const columns = [
    {
      field: 'title',
      headerName: 'PROJECT TITLE',
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div className="flex items-center gap-2.5">
            <img
              src={row.thumbnail}
              alt=""
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="truncate">
              <span className="font-semibold text-slate-900 dark:text-white truncate block">
                {row.title}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">{row.slug}</span>
            </div>
          </div>
        );
      },
    },
    {
      field: 'category',
      headerName: 'CATEGORY',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {params?.value || '-'}
        </span>
      ),
    },
    {
      field: 'techStack',
      headerName: 'TECH STACK',
      flex: 1.5,
      minWidth: 180,
      cellRenderer: (params) => {
        const stack = params?.value;
        if (!Array.isArray(stack)) return '-';
        return (
          <div className="flex items-center gap-1 overflow-hidden">
            {stack.slice(0, 3).map((t, i) => (
              <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium"
            >
              {t}
            </span>
          ))}
          {stack.length > 3 && (
            <span className="text-[10px] text-slate-400">+{stack.length - 3}</span>
          )}
        </div>
      );
    },
  },
  {
    field: 'featured',
    headerName: 'FEATURED',
    flex: 0.8,
    minWidth: 110,
    cellRenderer: (params) =>
      params?.value ? (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
          Featured
        </span>
      ) : (
        <span className="text-slate-400 text-xs">—</span>
      ),
  },
  {
    field: 'isActive',
    headerName: 'VISIBILITY',
    flex: 0.8,
    minWidth: 100,
    cellRenderer: (params) =>
      params?.value !== false ? (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
          Active
        </span>
      ) : (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
          Inactive
        </span>
      ),
  },
  {
    field: 'status',
    headerName: 'STATUS',
    flex: 0.8,
    minWidth: 110,
    cellRenderer: (params) => (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          params?.value === 'completed'
            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
            : 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
        }`}
      >
        {params?.value || 'completed'}
      </span>
    ),
  },
];

return (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Project Showcase
        </h2>
        <p className="text-xs text-slate-500">
          Manage your portfolio projects with live search, sorting, and pagination.
        </p>
      </div>
        <Button onClick={openCreateModal} icon={FiPlus}>
          Add Project
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load projects." />
      ) : (
        <DataTable
          title="All Portfolio Projects"
          data={projects}
          columns={columns}
          sl={true}
          loading={isLoading}
          navigating={isFetching}
          searchPlaceholder="Search projects by title, category, tech..."
          searchKeys={['title', 'category', 'techStack', 'description']}
          serverPagination={true}
          maxHeight="520px"
          onEdit={openEditModal}
          onDelete={(id) => setDeleteTargetId(id)}
          total={total}
          currentPage={page}
          pageSize={pageSize}
          quickFilterText={search}
          setQuickFilterText={(val) => {
            setSearch(val);
            setPage(1);
          }}
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
        />
      )}

      {/* Project Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Title"
              placeholder="e.g. CloudOps Dashboard"
              error={errors.title?.message}
              {...register('title')}
            />
            <Input
              label="Category"
              placeholder="Full Stack / Frontend / Backend"
              error={errors.category?.message}
              {...register('category')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Thumbnail Image URL"
              placeholder="https://images.unsplash.com/photo-..."
              helperText="Paste direct URL. Live preview renders below."
              error={errors.thumbnail?.message}
              {...register('thumbnail')}
            />
            <Input
              label="Technologies (comma separated)"
              placeholder="React, RTK Query, Node.js"
              error={errors.techStackString?.message}
              {...register('techStackString')}
            />
          </div>

          <ImagePreview src={thumbnailValue} previewLabel="Thumbnail Live Preview" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Live Demo URL (optional)"
              placeholder="https://example.com"
              error={errors.liveUrl?.message}
              {...register('liveUrl')}
            />
            <Input
              label="Main GitHub Repository (optional)"
              placeholder="https://github.com/..."
              error={errors.githubUrl?.message}
              {...register('githubUrl')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Start Date (e.g. Jan 2024)"
              placeholder="e.g. Jan 2024"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="Project End Date (e.g. Present / Mar 2024)"
              placeholder="e.g. Completed or Present"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Frontend GitHub Repo URL"
              placeholder="https://github.com/user/project-client"
              error={errors.githubClientUrl?.message}
              {...register('githubClientUrl')}
            />
            <Input
              label="Backend GitHub Repo URL"
              placeholder="https://github.com/user/project-server"
              error={errors.githubServerUrl?.message}
              {...register('githubServerUrl')}
            />
          </div>

          <Textarea
            label="Additional Screenshot Gallery URLs (one per line)"
            rows={2}
            placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
            error={errors.galleryImagesString?.message}
            {...register('galleryImagesString')}
          />

          <Textarea
            label="Key Architecture Features (one per line)"
            rows={3}
            placeholder="Role-based access control with refresh token rotation&#10;Server-side pagination and real-time WebSocket updates&#10;Modular micro-architecture pattern"
            error={errors.keyFeaturesString?.message}
            {...register('keyFeaturesString')}
          />

          <Textarea
            label="Challenges Faced & Solutions Engineered"
            rows={2}
            placeholder="Encountered high latency on complex aggregations; resolved with compound indexes..."
            error={errors.challenges?.message}
            {...register('challenges')}
          />

          <Textarea
            label="Short Description"
            rows={2}
            placeholder="Brief summary shown on portfolio cards..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Textarea
            label="Detailed Content / Case Study"
            rows={4}
            placeholder="Comprehensive description for the detail modal..."
            error={errors.content?.message}
            {...register('content')}
          />

          <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <Switch
              label="Active on Portfolio"
              description="Visible to public visitors"
              {...register('isActive')}
            />

            <Switch
              label="Featured Project"
              description="Highlighted badge in showcase"
              {...register('featured')}
            />

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 ml-auto">
              <span>Status:</span>
              <select
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                {...register('status')}
              >
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Project?"
        message="This project will be permanently removed from your portfolio."
      />
    </div>
  );
};
export default AdminProjects;
