import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import {
  useGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from '@/redux/api/apiSlice';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ImagePreview } from '@/components/common/ImagePreview';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/FeedbackStates';
import { Switch } from '@/components/common/Switch';

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum(['Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Other']),
  proficiency: z.coerce.number().min(0).max(100, 'Must be between 0 and 100'),
  icon: z.string().min(1, 'Icon URL or SVG image URL is required'),
  isActive: z.boolean().default(true),
});

export const AdminSkills = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data: skillsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSkillsQuery({ all: 'true', page, limit: pageSize, search, sortBy, sortOrder });
  const [createSkill, { isLoading: isCreating }] = useCreateSkillMutation();
  const [updateSkill, { isLoading: isUpdating }] = useUpdateSkillMutation();
  const [deleteSkill, { isLoading: isDeleting }] = useDeleteSkillMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      category: 'Frontend',
      proficiency: 85,
    },
  });

  const iconValue = watch('icon');

  const openCreateModal = () => {
    setEditingSkill(null);
    reset({
      name: '',
      category: 'Frontend',
      proficiency: 85,
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSkill(s);
    reset({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
      icon: s.icon,
      isActive: s.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editingSkill) {
        await updateSkill({ id: editingSkill._id, ...values }).unwrap();
        toast.success('Skill updated successfully');
      } else {
        await createSkill(values).unwrap();
        toast.success('Skill created successfully');
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
      await deleteSkill(deleteTargetId).unwrap();
      toast.success('Skill deleted');
      setDeleteTargetId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const skills = skillsData?.data?.skills || (Array.isArray(skillsData?.data) ? skillsData.data : []);
  const total = skillsData?.data?.pagination?.total || skills.length;

  const columns = [
    {
      field: 'name',
      headerName: 'SKILL NAME',
      flex: 1.5,
      minWidth: 160,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded p-0.5 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <img src={row.icon} alt="" className="w-4 h-4 object-contain" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {row.name}
            </span>
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
      field: 'proficiency',
      headerName: 'PROFICIENCY (%)',
      flex: 1.2,
      minWidth: 150,
      cellRenderer: (params) => {
        const val = Number(params?.value || 0);
        return (
          <div className="flex items-center gap-2 w-full max-w-[130px]">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{ width: `${val}%` }}
              />
            </div>
            <span className="text-xs font-bold text-teal-600">{val}%</span>
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Skills Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Manage your technical skills with real-time proficiency indicators and filtering.
          </p>
        </div>
        <Button onClick={openCreateModal} icon={FiPlus}>
          Add Skill
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load skills." />
      ) : (
        <DataTable
          title="Technical Competencies"
          data={skills}
          columns={columns}
          sl={true}
          loading={isLoading}
          navigating={isFetching}
          searchPlaceholder="Search skills by name, category..."
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
          onEdit={openEditModal}
          onDelete={(id) => setDeleteTargetId(id)}
          maxHeight="520px"
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Skill Name"
            placeholder="e.g. React.js, Docker, MongoDB"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              {...register('category')}
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="Tools">Tools</option>
              <option value="DevOps">DevOps</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input
            label="Proficiency (0 - 100%)"
            type="number"
            min="0"
            max="100"
            error={errors.proficiency?.message}
            {...register('proficiency')}
          />

          <Input
            label="Icon URL (SVG / PNG)"
            placeholder="https://cdn.jsdelivr.net/..."
            error={errors.icon?.message}
            {...register('icon')}
          />

          <ImagePreview src={iconValue} aspectRatio="aspect-square h-40 w-40 mx-auto" previewLabel="Icon Preview" />

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <Switch
              label="Active on Portfolio"
              description="Show this skill under its corresponding category tab"
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
              {editingSkill ? 'Save Changes' : 'Add Skill'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Skill?"
        message="Are you sure you want to remove this skill from the portfolio?"
      />
    </div>
  );
};
export default AdminSkills;
