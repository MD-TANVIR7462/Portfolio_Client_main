import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiUserPlus,
  FiShield,
  FiCheckCircle,
  FiSlash,
  FiTrash2,
  FiLock,
  FiMail,
  FiUser,
} from 'react-icons/fi';
import {
  useGetUsersQuery,
  useCreateAdminUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} from '@/redux/api/apiSlice';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/FeedbackStates';

const adminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatar: z.string().url('Must be a valid URL').or(z.literal('')),
});

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const {
    data: usersData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUsersQuery({
    page,
    limit: pageSize,
    search,
    sortBy,
    sortOrder,
  });

  const [createAdminUser, { isLoading: isCreating }] = useCreateAdminUserMutation();
  const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      avatar: '',
    },
  });

  const openCreateModal = () => {
    reset({
      name: '',
      email: '',
      password: '',
      avatar: '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.toLowerCase().trim(),
        password: values.password,
        ...(values.avatar && { avatar: values.avatar.trim() }),
      };
      await createAdminUser(payload).unwrap();
      toast.success('New administrator created successfully!');
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create administrator');
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    try {
      const res = await toggleUserStatus(statusTarget._id).unwrap();
      toast.success(res.message || 'Administrator status updated');
      setStatusTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget._id).unwrap();
      toast.success('Administrator deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete user');
    }
  };

  const users = usersData?.data?.users || (Array.isArray(usersData?.data) ? usersData.data : []);
  const total = usersData?.data?.pagination?.total || users.length;

  const columns = [
    {
      field: 'name',
      headerName: 'ADMINISTRATOR',
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        const isSelf = String(row._id) === String(currentUser?._id);
        return (
          <div className="flex items-center gap-3">
            <img
              src={row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={row.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
            />
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {row.name}
                </span>
                {isSelf && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block truncate">{row.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      field: 'role',
      headerName: 'ROLE / PERMISSION',
      flex: 1,
      minWidth: 130,
      cellRenderer: (params) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          <FiShield className="w-3 h-3" />
          {params?.value ? String(params.value).toUpperCase() : 'ADMIN'}
        </span>
      ),
    },
    {
      field: 'isActive',
      headerName: 'ACCOUNT STATUS',
      flex: 1.1,
      minWidth: 140,
      cellRenderer: (params) => {
        const isActive = params?.value !== false;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {isActive ? <FiCheckCircle className="w-3 h-3" /> : <FiSlash className="w-3 h-3" />}
            {isActive ? 'Active (Allowed)' : 'Deactivated (Blocked)'}
          </span>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'REGISTERED ON',
      flex: 1,
      minWidth: 140,
      cellRenderer: (params) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {params?.value ? new Date(params.value).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'STATUS ACTION',
      flex: 1.2,
      minWidth: 160,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return null;
        const isSelf = String(row._id) === String(currentUser?._id);
        const isActive = row.isActive !== false;

        return (
          <div className="flex items-center gap-2">
            <button
              disabled={isSelf}
              onClick={() => setStatusTarget(row)}
              title={isSelf ? 'Cannot block your own active session' : isActive ? 'Block / Deactivate Admin' : 'Unblock / Activate Admin'}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isSelf
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : isActive
                  ? 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>

            {!isSelf && (
              <button
                onClick={() => setDeleteTarget(row)}
                title="Delete Admin Account"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
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
            <FiUsers className="text-teal-500" />
            Admin User Management
          </h2>
          <p className="text-xs text-slate-500">
            Create new administrators, revoke credentials, and toggle account activation status (block / unblock).
          </p>
        </div>
        <Button onClick={openCreateModal} icon={FiUserPlus} variant="primary">
          Add New Admin
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load administrators." />
      ) : (
        <DataTable
          title="Registered Administrators"
          columns={columns}
          data={users}
          loading={isLoading}
          navigating={isFetching}
          sl={true}
          searchPlaceholder="Search admin by name, email..."
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
          emptyTitle="No administrators found"
          emptyDescription="Create an administrator account using the button above."
        />
      )}

      {/* Create Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Administrator"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Sarah Connor"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Secure Password"
            type="password"
            placeholder="Minimum 6 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Avatar Photo URL (Optional)"
            placeholder="https://images.unsplash.com/..."
            error={errors.avatar?.message}
            {...register('avatar')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating}>
              Create Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toggle Status Confirmation */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        title={statusTarget?.isActive !== false ? 'Deactivate Administrator?' : 'Activate Administrator?'}
        message={
          statusTarget?.isActive !== false
            ? `Are you sure you want to block ${statusTarget?.name} (${statusTarget?.email})? They will immediately lose access to the admin dashboard.`
            : `Are you sure you want to activate ${statusTarget?.name} (${statusTarget?.email})? They will be allowed to log into the admin dashboard.`
        }
        confirmText={statusTarget?.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
        variant={statusTarget?.isActive !== false ? 'danger' : 'primary'}
        isLoading={isToggling}
        onConfirm={handleToggleStatus}
        onClose={() => setStatusTarget(null)}
      />

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Administrator?"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be reversed.`}
        confirmText="Delete Admin"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminUsers;
