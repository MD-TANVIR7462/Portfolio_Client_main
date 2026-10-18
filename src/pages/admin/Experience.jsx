import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import {
  useGetExperiencesQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} from '@/redux/api/apiSlice';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { ImagePreview } from '../../components/common/ImagePreview';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorState } from '../../components/common/FeedbackStates';
import { Switch } from '../../components/common/Switch';

const experienceSchema = z.object({
  role: z.string().min(2, 'Role title is required'),
  company: z.string().min(2, 'Company name is required'),
  companyLogo: z.string().url('Must be a valid URL').or(z.literal('')),
  location: z.string().default('Remote'),
  startDate: z.string().min(2, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(10, 'Description is required'),
  achievementsString: z.string().optional(),
  techStackString: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const AdminExperience = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: expData, isLoading, isFetching, isError, refetch } = useGetExperiencesQuery({
    all: 'true',
    page,
    limit: pageSize,
    search,
    sortBy,
    sortOrder,
  });
  const [createExperience, { isLoading: isCreating }] = useCreateExperienceMutation();
  const [updateExperience, { isLoading: isUpdating }] = useUpdateExperienceMutation();
  const [deleteExperience, { isLoading: isDeleting }] = useDeleteExperienceMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      current: false,
    },
  });

  const companyLogoValue = watch('companyLogo');

  const openCreateModal = () => {
    setEditingExp(null);
    reset({
      role: '',
      company: '',
      companyLogo: '',
      location: 'Remote',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievementsString: '',
      techStackString: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExp(exp);
    reset({
      role: exp.role,
      company: exp.company,
      companyLogo: exp.companyLogo || '',
      location: exp.location || 'Remote',
      startDate: exp.startDate,
      endDate: exp.endDate || '',
      current: exp.current || false,
      description: exp.description,
      achievementsString: exp.achievements ? exp.achievements.join('\n') : '',
      techStackString: exp.techStack ? exp.techStack.join(', ') : '',
      isActive: exp.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    const achievements = values.achievementsString
      ? values.achievementsString.split('\n').map((a) => a.trim()).filter(Boolean)
      : [];
    const techStack = values.techStackString
      ? values.techStackString.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      ...values,
      achievements,
      techStack,
    };

    try {
      if (editingExp) {
        await updateExperience({ id: editingExp._id, ...payload }).unwrap();
        toast.success('Experience record updated');
      } else {
        await createExperience(payload).unwrap();
        toast.success('Experience record created');
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
      await deleteExperience(deleteTargetId).unwrap();
      toast.success('Experience record deleted');
      setDeleteTargetId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const experiences = expData?.data?.experiences || (Array.isArray(expData?.data) ? expData.data : []);
  const total = expData?.data?.pagination?.total || experiences.length;

  const columns = [
    {
      field: 'role',
      headerName: 'ROLE & COMPANY',
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div className="flex items-center gap-3">
            {row.companyLogo ? (
              <img
                src={row.companyLogo}
                alt={row.company}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-200 dark:border-teal-800">
                {row.company?.charAt(0) || 'C'}
              </div>
            )}
            <div className="truncate">
              <span className="font-semibold text-slate-900 dark:text-white truncate block">
                {row.role}
              </span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium block truncate">
                {row.company}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      field: 'location',
      headerName: 'LOCATION',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {params?.value || 'Remote'}
        </span>
      ),
    },
    {
      field: 'startDate',
      headerName: 'DURATION',
      flex: 1.2,
      minWidth: 140,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {row.startDate} - {row.current ? 'Present' : (row.endDate || 'N/A')}
          </span>
        );
      },
    },
    {
      field: 'techStack',
      headerName: 'TECH STACK',
      flex: 1.5,
      minWidth: 180,
      cellRenderer: (params) => {
        const stack = params?.value;
        if (!Array.isArray(stack) || stack.length === 0) return <span className="text-xs text-slate-400">-</span>;
        return (
          <div className="flex items-center gap-1 overflow-hidden">
            {stack.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                {tech}
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Career Experience
          </h2>
          <p className="text-xs text-slate-500">
            Maintain your work history timeline, company logos, achievements, and tech stacks.
          </p>
        </div>
        <Button onClick={openCreateModal} icon={FiPlus}>
          Add Experience
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load experience records." />
      ) : (
        <DataTable
          title="Employment & Roles"
          columns={columns}
          data={experiences}
          loading={isLoading}
          navigating={isFetching}
          sl={true}
          searchPlaceholder="Search by role, company, location..."
          serverPagination={true}
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
          maxHeight="520px"
          onEdit={openEditModal}
          onDelete={(id) => setDeleteTargetId(id)}
          emptyTitle="No experience records"
          emptyDescription="Add your employment history to showcase your journey."
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExp ? 'Edit Experience' : 'Add Experience'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Role / Title"
              placeholder="e.g. Senior Full Stack Engineer"
              error={errors.role?.message}
              {...register('role')}
            />
            <Input
              label="Company Name"
              placeholder="e.g. Acme Corp"
              error={errors.company?.message}
              {...register('company')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Logo URL"
              placeholder="https://..."
              error={errors.companyLogo?.message}
              {...register('companyLogo')}
            />
            <Input
              label="Location"
              placeholder="San Francisco, CA / Remote"
              error={errors.location?.message}
              {...register('location')}
            />
          </div>

          <ImagePreview src={companyLogoValue} aspectRatio="aspect-square w-16 h-16 mx-auto" previewLabel="Logo Preview" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              placeholder="2022-03"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="End Date"
              placeholder="2023-01 (leave blank if current)"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>

          <Textarea
            label="Overview / Responsibilities"
            rows={3}
            placeholder="Summary of responsibilities..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Textarea
            label="Key Achievements (one per line)"
            rows={3}
            placeholder="Spearheaded migration of legacy REST to RTK Query&#10;Cut server response time by 45%"
            {...register('achievementsString')}
          />

          <Input
            label="Tech Stack (comma separated)"
            placeholder="React, Node.js, Express, MongoDB, RTK Query"
            {...register('techStackString')}
          />

          <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <Switch
              label="Currently Working Here"
              description="Mark role as active position"
              {...register('current')}
            />

            <Switch
              label="Active on Portfolio"
              description="Visible to public visitors"
              {...register('isActive')}
            />
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
              {editingExp ? 'Save Changes' : 'Add Experience'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Experience Record?"
        message="This record will be permanently deleted from the career timeline."
      />
    </div>
  );
};
