import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useGetAboutQuery, useUpdateAboutMutation } from '@/redux/api/apiSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { ImagePreview } from '../../components/common/ImagePreview';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/FeedbackStates';

const aboutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  title: z.string().min(2, 'Title is required'),
  tagline: z.string().min(5, 'Tagline is required'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  profileImage: z.string().url('Profile image must be a valid URL'),
  resumeUrl: z.string().url('Resume must be a valid URL'),
  location: z.string().min(2, 'Location is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone number is required'),
  yearsOfExperience: z.coerce.number().min(0),
  availabilityStatus: z.enum(['Available for hire', 'Open to opportunities', 'Busy']),
});

export const AdminAbout = () => {
  const { data: aboutData, isLoading, isError, refetch } = useGetAboutQuery();
  const [updateAbout, { isLoading: isUpdating }] = useUpdateAboutMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(aboutSchema),
  });

  const profileImageValue = watch('profileImage');

  useEffect(() => {
    if (aboutData?.data) {
      reset(aboutData.data);
    }
  }, [aboutData, reset]);

  const onSubmit = async (values) => {
    try {
      await updateAbout(values).unwrap();
      toast.success('About section updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} message="Failed to load About settings." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          About & Personal Profile
        </h2>
        <p className="text-xs text-slate-500">
          Edit your bio, titles, profile photo URL, contact coordinates, and availability status.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              placeholder="Alex Rivera"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Professional Headline / Title"
              placeholder="Senior MERN Stack Developer"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>

          <Input
            label="Tagline (Subheading)"
            placeholder="Crafting high-performance web applications..."
            error={errors.tagline?.message}
            {...register('tagline')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Profile Photo URL"
              placeholder="https://images.unsplash.com/..."
              helperText="URL to high-res profile photo."
              error={errors.profileImage?.message}
              {...register('profileImage')}
            />
            <Input
              label="Resume PDF URL"
              placeholder="https://example.com/resume.pdf"
              error={errors.resumeUrl?.message}
              {...register('resumeUrl')}
            />
          </div>

          <ImagePreview
            src={profileImageValue}
            aspectRatio="aspect-square w-32 h-32 rounded-2xl mx-auto"
            previewLabel="Profile Photo Preview"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Email Address"
              placeholder="alex@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 019-2834"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Location"
              placeholder="San Francisco, CA / Remote"
              error={errors.location?.message}
              {...register('location')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Years of Experience"
              type="number"
              min="0"
              error={errors.yearsOfExperience?.message}
              {...register('yearsOfExperience')}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Availability Status
              </label>
              <select
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                {...register('availabilityStatus')}
              >
                <option value="Available for hire">Available for hire</option>
                <option value="Open to opportunities">Open to opportunities</option>
                <option value="Busy">Busy</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Biography (Markdown supported)"
            rows={5}
            placeholder="Comprehensive bio detailing your engineering journey..."
            error={errors.bio?.message}
            {...register('bio')}
          />

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" variant="primary" size="lg" isLoading={isUpdating}>
              Save About Information
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
