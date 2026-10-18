import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { FiPlus, FiStar } from 'react-icons/fi';
import {
  useGetTestimonialsQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} from '@/redux/api/apiSlice';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { ImagePreview } from '../../components/common/ImagePreview';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorState } from '../../components/common/FeedbackStates';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(2, 'Role is required'),
  company: z.string().min(2, 'Company is required'),
  avatar: z.string().url('Avatar must be a valid URL'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  rating: z.coerce.number().min(1).max(5),
});

export const AdminTestimonials = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: testData, isLoading, isFetching, isError, refetch } = useGetTestimonialsQuery({
    all: 'true',
    page,
    limit: pageSize,
    search,
    sortBy,
    sortOrder,
  });
  const [createTestimonial, { isLoading: isCreating }] = useCreateTestimonialMutation();
  const [updateTestimonial, { isLoading: isUpdating }] = useUpdateTestimonialMutation();
  const [deleteTestimonial, { isLoading: isDeleting }] = useDeleteTestimonialMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      rating: 5,
    },
  });

  const avatarValue = watch('avatar');

  const openCreateModal = () => {
    setEditingItem(null);
    reset({
      name: '',
      role: '',
      company: '',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      message: '',
      rating: 5,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    reset(item);
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editingItem) {
        await updateTestimonial({ id: editingItem._id, ...values }).unwrap();
        toast.success('Testimonial updated');
      } else {
        await createTestimonial(values).unwrap();
        toast.success('Testimonial created');
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
      await deleteTestimonial(deleteTargetId).unwrap();
      toast.success('Testimonial deleted');
      setDeleteTargetId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const testimonials = testData?.data?.testimonials || (Array.isArray(testData?.data) ? testData.data : []);
  const total = testData?.data?.pagination?.total || testimonials.length;

  const columns = [
    {
      field: 'name',
      headerName: 'CLIENT / COLLEAGUE',
      flex: 1.5,
      minWidth: 180,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div className="flex items-center gap-3">
            <img
              src={row.avatar}
              alt={row.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="truncate">
              <span className="font-semibold text-slate-900 dark:text-white block truncate">
                {row.name}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {row.role} @ {row.company}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      field: 'message',
      headerName: 'TESTIMONIAL MESSAGE',
      flex: 2,
      minWidth: 220,
      cellRenderer: (params) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
          "{params?.value || '-'}"
        </span>
      ),
    },
    {
      field: 'rating',
      headerName: 'RATING',
      flex: 0.9,
      minWidth: 110,
      cellRenderer: (params) => {
        const rating = params?.value || 5;
        return (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Client & Colleague Endorsements
          </h2>
          <p className="text-xs text-slate-500">
            Showcase recommendations and peer reviews with photo avatar URLs.
          </p>
        </div>
        <Button onClick={openCreateModal} icon={FiPlus}>
          Add Testimonial
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load testimonials." />
      ) : (
        <DataTable
          title="Client & Peer Recommendations"
          columns={columns}
          data={testimonials}
          loading={isLoading}
          navigating={isFetching}
          sl={true}
          searchPlaceholder="Search by client name, role, company, message..."
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
          emptyTitle="No endorsements listed"
          emptyDescription="Add positive testimonials to build trust with recruiters & clients."
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Author Name"
            placeholder="Sarah Jenkins"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Role"
              placeholder="VP of Engineering"
              error={errors.role?.message}
              {...register('role')}
            />
            <Input
              label="Company"
              placeholder="Acme Labs"
              error={errors.company?.message}
              {...register('company')}
            />
          </div>

          <Input
            label="Avatar Image URL"
            placeholder="https://images.unsplash.com/..."
            error={errors.avatar?.message}
            {...register('avatar')}
          />
          <ImagePreview src={avatarValue} aspectRatio="aspect-square w-16 h-16 mx-auto rounded-full" previewLabel="Avatar Preview" />

          <Input
            label="Rating (1 - 5 stars)"
            type="number"
            min="1"
            max="5"
            error={errors.rating?.message}
            {...register('rating')}
          />

          <Textarea
            label="Testimonial Message"
            rows={4}
            placeholder="Alex is an exceptional engineer who..."
            error={errors.message?.message}
            {...register('message')}
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
              {editingItem ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Testimonial?"
        message="Are you sure you want to remove this endorsement?"
      />
    </div>
  );
};
