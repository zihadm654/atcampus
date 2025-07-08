import { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { useUploadThing } from '@/lib/uploadthing';

export interface Attachment {
  id: string;
  file: File;
  mediaId?: string;
  isUploading: boolean;
  preview?: string;
  error?: string;
  progress?: number;
}

const MAX_FILE_SIZE = {
  image: 4 * 1024 * 1024, // 4MB
  video: 64 * 1024 * 1024, // 64MB
};

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
];

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export default function useMediaUpload() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Clean up object URLs when attachments are removed
  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
  }, [attachments]);

  const validateFile = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Invalid image type. Only JPEG, PNG, GIF, WebP, and HEIC images are allowed.';
      }
      if (file.size > MAX_FILE_SIZE.image) {
        return 'Image size exceeds 4MB limit.';
      }
    } else if (file.type.startsWith('video/')) {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return 'Invalid video type. Only MP4, WebM, and QuickTime videos are allowed.';
      }
      if (file.size > MAX_FILE_SIZE.video) {
        return 'Video size exceeds 64MB limit.';
      }
    } else {
      return 'Invalid file type. Only images and videos are allowed.';
    }
    return null;
  }, []);

  const { startUpload, isUploading, routeConfig } = useUploadThing(
    'attachment',
    {
      onBeforeUploadBegin(files) {
        const validFiles: File[] = [];
        const errors: { [key: string]: string } = {};

        files.forEach((file) => {
          const error = validateFile(file);
          if (error) {
            errors[file.name] = error;
          } else {
            const extension = file.name.split('.').pop();
            const newFile = new File(
              [file],
              `attachment_${uuid()}.${extension}`,
              {
                type: file.type,
              }
            );
            validFiles.push(newFile);
          }
        });

        // Show errors if any
        Object.entries(errors).forEach(([filename, error]) => {
          toast({
            variant: 'destructive',
            description: `${filename}: ${error}`,
          });
        });

        // Create previews and add to attachments
        setAttachments((prev) => [
          ...prev,
          ...validFiles.map((file) => ({
            id: uuid(),
            file,
            isUploading: true,
            preview: file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : undefined,
            progress: 0,
          })),
        ]);

        return validFiles;
      },
      onUploadProgress: (progress) => {
        setAttachments((prev) =>
          prev.map((a) => (a.isUploading ? { ...a, progress } : a))
        );
      },
      onUploadError: (error) => {
        setAttachments((prev) =>
          prev.map((a) =>
            a.isUploading
              ? { ...a, isUploading: false, error: error.message }
              : a
          )
        );
        toast({
          variant: 'destructive',
          description: error.message,
        });
      },
      onClientUploadComplete: (res) => {
        setAttachments((prev) =>
          prev.map((a) => {
            const uploadResult = res.find((r) => r.name === a.file.name);
            if (!uploadResult) return a;

            return {
              ...a,
              mediaId: uploadResult.serverData.mediaId,
              isUploading: false,
              progress: 100,
            };
          })
        );
      },
    }
  );

  const handleStartUpload = useCallback(
    (files: File[]) => {
      if (isUploading) {
        toast({
          variant: 'destructive',
          description: 'Please wait for the current upload to finish.',
        });
        return;
      }

      if (attachments.length + files.length > 5) {
        toast({
          variant: 'destructive',
          description: 'You can only upload up to 5 attachments per post.',
        });
        return;
      }

      startUpload(files);
    },
    [attachments.length, isUploading, startUpload, toast]
  );

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === attachmentId);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((a) => a.id !== attachmentId);
    });
  }, []);

  const reset = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((attachment) => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
      return [];
    });
  }, []);

  const retryUpload = useCallback(
    (attachmentId: string) => {
      const attachment = attachments.find((a) => a.id === attachmentId);
      if (attachment && attachment.error) {
        startUpload([attachment.file]);
      }
    },
    [attachments, startUpload]
  );

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    routeConfig,
    removeAttachment,
    retryUpload,
    reset,
  };
}
