import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiSend, FiMail, FiMapPin, FiMessageSquare } from 'react-icons/fi';
import { useSendContactMutation, useGetAboutQuery, useGetSettingsQuery } from '@/redux/api/apiSlice';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const Contact = () => {
  const [sendContact, { isLoading }] = useSendContactMutation();
  const { data: aboutData } = useGetAboutQuery();
  const { data: settingsData } = useGetSettingsQuery();
  const about = aboutData?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values) => {
    try {
      const res = await sendContact(values).unwrap();
      toast.success(res.message || 'Message sent successfully!');
      reset();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold mb-3 uppercase tracking-wider shadow-xs">
          <FiMessageSquare className="w-3.5 h-3.5" />
          {settingsData?.data?.sectionHeaders?.contact?.badge || 'Direct Inquiries & Collaboration'}
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
          {settingsData?.data?.sectionHeaders?.contact?.title || 'Let’s Discuss Your Next Build'}
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {settingsData?.data?.sectionHeaders?.contact?.subtitle ||
            'Whether you have a technical question, an open position, or an interesting engineering problem to solve, feel free to drop a message.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-5 flex flex-col gap-6 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">
            Direct Inquiries
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Whether you have a technical question, an open position, or an interesting engineering problem to solve, feel free to drop a message.
          </p>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {about?.email && (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Email Address</div>
                  <a
                    href={`mailto:${about.email}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-teal-500"
                  >
                    {about.email}
                  </a>
                </div>
              </div>
            )}

            {about?.location && (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Location</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {about.location}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Your Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Email Address"
                placeholder="john@example.com"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <Input
              label="Subject"
              placeholder="Full Stack Engineering Contract"
              error={errors.subject?.message}
              {...register('subject')}
            />

            <Textarea
              label="Your Message"
              rows={5}
              placeholder="Tell me about your project or technical inquiry..."
              error={errors.message?.message}
              {...register('message')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={FiSend}
              className="w-full sm:w-auto"
            >
              Send Message
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
