import React, { useState } from 'react';
import { FiImage, FiAlertCircle } from 'react-icons/fi';
import { handleImageError } from '../../utils/imageFallback';

export const ImagePreview = ({
  src,
  alt = 'Image preview',
  aspectRatio = 'aspect-video',
  className = '',
  previewLabel = 'Live Preview',
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {previewLabel && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {previewLabel}
        </span>
      )}
      <div
        className={`relative  w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4`}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            onError={(e) => {
              setHasError(true);
              handleImageError(e);
            }}
            className="h-40  w-40 object-cover transition-opacity duration-300 "
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 dark:text-slate-500">
            {hasError ? (
              <>
                <FiAlertCircle className="w-8 h-8 text-amber-500 mb-1.5" />
                <span className="text-xs font-medium text-amber-500">
                  Image URL failed to load
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Showing placeholder</span>
              </>
            ) : (
              <>
                <FiImage className="w-8 h-8 mb-1.5 opacity-50" />
                <span className="text-xs">Provide a valid image URL above</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
