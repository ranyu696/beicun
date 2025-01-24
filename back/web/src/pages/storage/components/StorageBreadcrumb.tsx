import React from 'react';
import { ChevronRight, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Folder } from '@/types/storage';

interface StorageBreadcrumbProps {
  path: Folder[];
  onNavigate: (folder: Folder | null) => void;
}

export const StorageBreadcrumb: React.FC<StorageBreadcrumbProps> = ({
  path,
  onNavigate,
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={() => onNavigate(null)}
      >
        <HomeIcon className="h-4 w-4 mr-1" />
        根目录
      </Button>
      {path.map((folder) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => onNavigate(folder)}
          >
            {folder.name}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
};
