import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEye, FiExternalLink, FiFileText } from 'react-icons/fi';
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from '@/redux/api/apiSlice';
import DataTable from '@/components/Shared/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/FeedbackStates';
import SharedRichTextEditor, { STATUS } from '@/components/Shared/SharedRichTextEditor';

export const AdminBlogs = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const {
    data: blogsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetBlogsQuery({ all: 'true', page, limit: pageSize, search, sortBy, sortOrder });

  const [createBlog] = useCreateBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editorStatus, setEditorStatus] = useState(STATUS.IDLE);

  // Editor states
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogActive, setBlogActive] = useState(true);
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogCoverImage, setBlogCoverImage] = useState(
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
  );
  const [blogTags, setBlogTags] = useState('React, JavaScript, WebDev');

  const openCreateModal = () => {
    setEditingBlog(null);
    setBlogTitle('');
    setBlogContent('<p>Start writing your technical article or tutorial...</p>');
    setBlogActive(true);
    setBlogExcerpt('');
    setBlogCoverImage('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80');
    setBlogTags('React, JavaScript, FullStack');
    setEditorStatus(STATUS.IDLE);
    setIsEditorOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBlog(b);
    setBlogTitle(b.title || '');
    setBlogContent(b.content || '');
    setBlogActive(b.published !== false);
    setBlogExcerpt(b.excerpt || '');
    setBlogCoverImage(b.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80');
    setBlogTags(Array.isArray(b.tags) ? b.tags.join(', ') : '');
    setEditorStatus(STATUS.IDLE);
    setIsEditorOpen(true);
  };

  const handleEditorSubmit = async (editorPayload) => {
    setEditorStatus(STATUS.SAVING);
    try {
      const tags = blogTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const plainExcerpt =
        blogExcerpt.trim() ||
        String(editorPayload.contentHtml || '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 160) + '...';

      const payload = {
        title: editorPayload.title || blogTitle,
        content: editorPayload.contentHtml || blogContent,
        excerpt: plainExcerpt,
        coverImage: blogCoverImage,
        tags,
        published: editorPayload.isActive !== undefined ? editorPayload.isActive : blogActive,
        readTime: editorPayload.readTime || `${editorPayload.readingTimeMinutes || 3} min read`,
      };

      if (editingBlog) {
        await updateBlog({ id: editingBlog._id, ...payload }).unwrap();
        toast.success('Blog article updated successfully');
      } else {
        await createBlog(payload).unwrap();
        toast.success('Blog article published successfully');
      }

      setEditorStatus(STATUS.SAVED);
      setTimeout(() => {
        setIsEditorOpen(false);
      }, 700);
      refetch();
    } catch (err) {
      setEditorStatus(STATUS.ERROR);
      toast.error(err?.data?.message || 'Failed to save blog post');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteBlog(deleteTargetId).unwrap();
      toast.success('Blog post deleted');
      setDeleteTargetId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const blogs = blogsData?.data?.blogs || [];
  const total = blogsData?.data?.pagination?.total || blogs.length;

  const columns = [
    {
      field: 'title',
      headerName: 'ARTICLE TITLE',
      flex: 1.8,
      minWidth: 220,
      cellRenderer: (params) => {
        const row = params?.data;
        if (!row) return '-';
        return (
          <div className="flex items-center gap-3">
            <img
              src={row.coverImage}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
            />
            <div className="truncate">
              <span className="font-semibold text-slate-900 dark:text-white truncate block">
                {row.title}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">/{row.slug}</span>
            </div>
          </div>
        );
      },
    },
    {
      field: 'tags',
      headerName: 'TAGS',
      flex: 1.2,
      minWidth: 150,
      cellRenderer: (params) => {
        const tags = params?.value;
        if (!Array.isArray(tags) || tags.length === 0) return <span className="text-xs text-slate-400">-</span>;
        return (
          <div className="flex items-center gap-1 overflow-hidden">
            {tags.slice(0, 2).map((t, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-medium"
              >
                {t}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] text-slate-400">+{tags.length - 2}</span>
            )}
          </div>
        );
      },
    },
    {
      field: 'readTime',
      headerName: 'READ TIME',
      flex: 0.9,
      minWidth: 100,
      cellRenderer: (params) => (
        <span className="text-xs text-slate-500 font-medium">
          {params?.value || '3 min read'}
        </span>
      ),
    },
    {
      field: 'published',
      headerName: 'STATUS',
      flex: 0.8,
      minWidth: 100,
      cellRenderer: (params) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            params?.value !== false
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {params?.value !== false ? 'Published' : 'Draft'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiFileText className="text-teal-500" />
            Blog & Article Publications
          </h2>
          <p className="text-xs text-slate-500">
            Publish technical posts, tutorials, release notes, and dev stories with rich formatting.
          </p>
        </div>
        <Button onClick={openCreateModal} icon={FiPlus} variant="primary">
          Write New Article
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} message="Failed to load blog posts." />
      ) : (
        <DataTable
          title="All Published & Draft Articles"
          columns={columns}
          data={blogs}
          loading={isLoading}
          navigating={isFetching}
          sl={true}
          searchPlaceholder="Search blogs by title, tags, slug..."
          searchKeys={['title', 'slug', 'excerpt']}
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
          emptyTitle="No blog posts available"
          emptyDescription="Draft your first tech article using the RichText Editor."
        />
      )}

      {/* Full RichText Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingBlog ? 'Edit Blog Publication' : 'Write & Publish New Article'}
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Cover Image URL
              </label>
              <input
                type="text"
                value={blogCoverImage}
                onChange={(e) => setBlogCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={blogTags}
                onChange={(e) => setBlogTags(e.target.value)}
                placeholder="React, Next.js, Architecture"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Short Excerpt / SEO Meta Summary
            </label>
            <input
              type="text"
              value={blogExcerpt}
              onChange={(e) => setBlogExcerpt(e.target.value)}
              placeholder="Brief summary displayed on cards and search engines..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <SharedRichTextEditor
            initialTitle={blogTitle}
            initialValue={blogContent}
            initialActive={blogActive}
            status={editorStatus}
            onSubmit={handleEditorSubmit}
            submitButtonText={editingBlog ? 'Update Article' : 'Publish Article'}
            titlePlaceholder="Enter Article Headline..."
            placeholder="Write markdown or rich formatting content with headers, quotes, lists, tables, code blocks..."
            minHeight="380px"
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Blog Post?"
        message="This article and all formatted content will be permanently removed."
      />
    </div>
  );
};

export default AdminBlogs;
