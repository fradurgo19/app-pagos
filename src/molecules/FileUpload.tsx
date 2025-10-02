import React, { useRef, useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { Button } from '../atoms/Button';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number;
  onFileSelect: (file: File | null) => void;
  error?: string;
  currentFile?: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Cargar Documento',
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024,
  onFileSelect,
  error,
  currentFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLocalError('');

    if (!file) {
      onFileSelect(null);
      return;
    }

    if (file.size > maxSize) {
      setLocalError(`El tamaño del archivo debe ser menor a ${maxSize / (1024 * 1024)}MB`);
      onFileSelect(null);
      return;
    }

    onFileSelect(file);
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {!currentFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            displayError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Haz clic para cargar o arrastra y suelta
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, JPG, PNG hasta {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <File className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{currentFile.name}</p>
              <p className="text-xs text-gray-500">
                {(currentFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            aria-label="Eliminar archivo"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Entrada de archivo"
      />

      {displayError && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
};
