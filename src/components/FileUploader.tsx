import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
}

export function FileUploader({ onTextExtracted, onError }: FileUploaderProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      if (file.type === 'text/plain' || file.type === 'text/csv') {
        const text = await file.text();
        onTextExtracted(text);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      onError('Error processing file. Please try another file.');
    }
  }, [onTextExtracted, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
        ${isDragActive ? 'border-green-500 bg-green-50' : 'border-green-200 hover:border-green-300'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-2 text-green-700">
        <Upload className="w-8 h-8" />
        <p className="text-sm font-medium">
          {isDragActive
            ? 'Drop your file here...'
            : 'Drag & drop or click to upload TXT or CSV'}
        </p>
      </div>
    </div>
  );
}