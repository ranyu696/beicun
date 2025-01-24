import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { File } from '@/types/storage';

interface StoragePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
}

export const StoragePreviewDialog: React.FC<StoragePreviewDialogProps> = ({
  open,
  onOpenChange,
  file,
}) => {
  if (!file) return null;

  const renderPreview = () => {
    switch (file.type) {
      case 'image':
        return (
          <AspectRatio ratio={16 / 9}>
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-contain"
            />
          </AspectRatio>
        );
      case 'video':
        return (
          <AspectRatio ratio={16 / 9}>
            <video
              src={file.url}
              controls
              className="w-full h-full"
            />
          </AspectRatio>
        );
      default:
        return (
          <div className="text-center py-8">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              在新窗口中打开
            </a>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
          <DialogDescription>
            {file.name}
            <br />
            {file.size}
          </DialogDescription>
        </DialogHeader>
        {renderPreview()}
      </DialogContent>
    </Dialog>
  );
};
