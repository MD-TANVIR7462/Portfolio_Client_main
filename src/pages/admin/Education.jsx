import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import {
  useGetEducationsQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} from '@/redux/api/apiSlice';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorState } from '../../components/common/FeedbackStates';

const educationSchema = z.object({
  degree: z.string().min(2, 'Degree is required'),
  institution: z.string().min(2, 'Institution name is required'),
  fieldOfStudy: z.string().min(2, 'Field of study is required'),
  startDate: z.string().min(2, 'Start date is required'),
  endDate: z.string().min(2, 'End date is required'),
  grade: z.string().optional(),
  description: z.string().optional(),
});

export const AdminEducation = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: eduData, isLoading, isFetching, isError, refetch } = useGetEducationsQuery({
    page,
    limit: pageSize,
    search,
    sortBy,
    sortOrder,
  });
  const [createEducation, { isLoading: isCreating }] = useCreateEducationMutation();
  const [updateEducation, { isLoading: isUpdating }] = useUpdateEducationMutation();
  const [deleteEducation, { isLoading: isDeleting }] = useDeleteEducationMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(educationSchema),
  });

  const openCreateModal = () => {
    setEditingEdu(null);
    reset({
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (edu) => {
    setEditingEdu(edu);
    reset(edu);
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editingEdu) {
        await updateEducation({ id: editingEdu._id, ...values }).unwrap();
        toast.success('Education record updated');
      } else {
        await createEducation(values).unwrap();
        toast.success('Education record created');
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
      await deleteEducation(deleteTargetId).unwrap();
      toast.success('Education record deleted');
      setDeleteTargetId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const educations = eduData?.data?.educations || (Array.isArray(eduData?.data) ? eduData.data : []);
  const total = eduData?.data?.pagination?.total || educations.length;

  const columns = [
    {
      field: 'degree',
      headerName: 'DEGREE / CERTIFICATION',
      flex: 1.5,
      minWidth: 180,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block truncate">
              {row.degree}
            </span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium block truncate">
              {row.institution}
            </span>
          </div>
        );
      },
    },
    {
      field: 'fieldOfStudy',
      headerName: 'FIELD OF STUDY',
      flex: 1.2,
      minWidth: 150,
      cellRenderer: (params) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {params?.value || '-'}
        </span>
      ),
    },
    {
      field: 'duration',
      headerName: 'TIMELINE',
      flex: 1,
      minWidth: 130,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {row.startDate} - {row.endDate}
          </span>
        );
      },
    },
    {
      field: 'grade',
      headerName: 'GRADE / GPA',
      flex: 0.8,
      minWidth: 100,
      cellRenderer: (params) => {
        if (!params?.value) return <span className="text-xs text-slate-400">-</span>;
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
            {params.value}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Academic Background
          </h2>
          <p className="text-xs text-slate-500">
            Manage degrees, bootcamps, and professional certifications.
          </p>
        </div>
        <Button onClick={openCreateModal} icon={FiPlus}>
          Add Education
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load education records." />
      ) : (
        <DataTable
          title="Degrees & Accreditations"
          columns={columns}
          data={educations}
          loading={isLoading}
          navigating={isFetching}
          sl={true}
          searchPlaceholder="Search by degree, institution, field..."
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
          emptyTitle="No education records found"
          emptyDescription="Add your qualifications to complete your profile."
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEdu ? 'Edit Education' : 'Add Education'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Degree / Certificate Title"
            placeholder="e.g. Bachelor of Science in Computer Science"
            error={errors.degree?.message}
            {...register('degree')}
          />
          <Input
            label="Institution / University"
            placeholder="e.g. UC Berkeley"
            error={errors.institution?.message}
            {...register('institution')}
          />
          <Input
            label="Field of Study"
            placeholder="Software Engineering"
            error={errors.fieldOfStudy?.message}
            {...register('fieldOfStudy')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              placeholder="2017"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="End Date"
              placeholder="2021"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>
          <Input
            label="Grade / Distinction (optional)"
            placeholder="3.8 GPA"
            {...register('grade')}
          />
          <Textarea
            label="Description (optional)"
            rows={2}
            placeholder="Key coursework or honors..."
            {...register('description')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
            >
              {editingEdu ? 'Save Changes' : 'Add Education'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Record?"
        message="Are you sure you want to delete this education entry?"
      />
    </div>
  );
};
