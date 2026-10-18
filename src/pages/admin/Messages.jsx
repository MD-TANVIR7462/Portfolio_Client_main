import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetContactsQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
} from '@/redux/api/apiSlice';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/FeedbackStates';
import { FiMail, FiTrash2 } from 'react-icons/fi';

export const AdminMessages = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: contactsData, isLoading, isFetching, isError, refetch } = useGetContactsQuery({
    page,
    limit: pageSize,
    search,
    sortBy,
    sortOrder,
  });
  const [updateStatus] = useUpdateContactStatusMutation();
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  const [activeMessage, setActiveMessage] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleMarkStatus = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Message marked as ${status}`);
      if (activeMessage && activeMessage._id === id) {
        setActiveMessage({ ...activeMessage, status });
      }
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteContact(deleteTargetId).unwrap();
      toast.success('Message deleted');
      setDeleteTargetId(null);
      if (activeMessage && activeMessage._id === deleteTargetId) {
        setActiveMessage(null);
      }
      refetch();
    } catch {
      toast.error('Delete failed');
    }
  };

  const messages = contactsData?.data?.contacts || (Array.isArray(contactsData?.data) ? contactsData.data : []);
  const total = contactsData?.data?.pagination?.total || messages.length;

  const columns = [
    {
      field: 'name',
      headerName: 'SENDER NAME',
      flex: 1.2,
      minWidth: 150,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>;
      },
    },
    {
      field: 'email',
      headerName: 'EMAIL ADDRESS',
      flex: 1.3,
      minWidth: 160,
      cellRenderer: (params) => (
        <a
          href={`mailto:${params?.value}`}
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
        >
          {params?.value || '-'}
        </a>
      ),
    },
    {
      field: 'subject',
      headerName: 'SUBJECT',
      flex: 1.5,
      minWidth: 180,
      cellRenderer: (params) => (
        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block">
          {params?.value || '-'}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'RECEIVED DATE',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params) => (
        <span className="text-xs text-slate-500">
          {params?.value ? new Date(params.value).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      flex: 0.9,
      minWidth: 110,
      cellRenderer: (params) => {
        const st = params?.value;
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              st === 'unread'
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                : st === 'replied'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {st || 'unread'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Inbox Inquiries
        </h2>
        <p className="text-xs text-slate-500">
          Messages received from your public contact form.
        </p>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load inbox messages." />
      ) : (
        <DataTable
          title="Direct Contact Inquiries"
          data={messages}
          columns={columns}
          sl={true}
          loading={isLoading}
          navigating={isFetching}
          searchPlaceholder="Search messages by name, email, subject, message..."
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
          onRowClick={(row) => {
            setActiveMessage(row);
            if (row.status === 'unread') {
              handleMarkStatus(row._id, 'read');
            }
          }}
          onDelete={(id) => setDeleteTargetId(id)}
        />
      )}

      {/* Message View Modal */}
      <Modal
        isOpen={!!activeMessage}
        onClose={() => setActiveMessage(null)}
        title={activeMessage?.subject || 'Message Details'}
        maxWidth="max-w-4xl"
      >
        {activeMessage && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1 text-xs">
              <p>
                <strong className="text-slate-700 dark:text-slate-300">From:</strong>{' '}
                {activeMessage.name}
              </p>
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Email:</strong>{' '}
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(
                    activeMessage.subject
                  )}`}
                  className="text-teal-600 dark:text-teal-400 underline font-semibold"
                >
                  {activeMessage.email}
                </a>
              </p>
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Date:</strong>{' '}
                {new Date(activeMessage.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-200">
              {activeMessage.message}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <div></div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteTargetId(activeMessage._id)}
                icon={FiTrash2}
              >
                Delete
              </Button>
              {/* <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setActiveMessage(null)}>
                  Close
                </Button>
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(
                    activeMessage.subject
                  )}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <FiMail className="w-4 h-4" />
                  Reply via Email
                </a>
              </div> */}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Message?"
        message="Are you sure you want to delete this inquiry?"
      />
    </div>
  );
};
export default AdminMessages;
