import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 移动设备专用上传组件
 * 提供更适合触摸操作的上传界面
 */
const MobileUploader = ({ onFileSelect, accept = 'application/pdf', isLoading }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      <button
        onClick={triggerFileInput}
        disabled={isLoading}
        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('output.processing')}
          </div>
        ) : (
          <>
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            {t('dropzone.mobileUpload')}
          </>
        )}
      </button>
      <p className="mt-2 text-sm text-center text-gray-500">
        {t('dropzone.dragInactive')}
      </p>
    </div>
  );
};

export default MobileUploader; 