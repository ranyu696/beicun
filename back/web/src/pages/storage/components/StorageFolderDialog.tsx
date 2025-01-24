import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Folder } from '@/types/storage';

const formSchema = z.object({
  name: z.string().min(1, '请输入文件夹名称'),
  description: z.string().optional(),
});

interface StorageFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: Folder;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export const StorageFolderDialog: React.FC<StorageFolderDialogProps> = ({
  open,
  onOpenChange,
  folder,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: folder?.name || '',
      description: folder?.description || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: folder?.name || '',
        description: folder?.description || '',
      });
    }
  }, [open, folder, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {folder ? '编辑文件夹' : '新建文件夹'}
          </DialogTitle>
          <DialogDescription>
            {folder ? '编辑文件夹描述' : '新建文件夹描述'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="请输入文件夹名称" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="请输入文件夹描述（可选）" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {folder ? '保存' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
