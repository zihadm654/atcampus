'use client';

import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useDropzone } from '@uploadthing/react';
import {
  AlertCircle,
  FileVideo,
  ImageIcon,
  Loader2,
  RefreshCw,
  StickyNote,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { type ClipboardEvent, useCallback, useRef } from 'react';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';
import LoadingButton from '@/components/feed/LoadingButton';
import UserAvatar from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

import { useSubmitPostMutation } from './mutations';
import useMediaUpload, { type Attachment } from './useMediaUpload';

import './styles.css';

import { Icons } from '@/components/shared/icons';

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
  onRetry: () => void;
}

function AttachmentPreview({
  attachment,
  onRemove,
  onRetry,
}: AttachmentPreviewProps) {
  const isImage = attachment.file.type.startsWith('image/');
  const isVideo = attachment.file.type.startsWith('video/');

  return (
    <div className="group relative">
      <div
        className={cn(
          'relative h-24 w-24 overflow-hidden rounded-lg border',
          attachment.error && 'border-red-500',
          attachment.isUploading && 'border-muted'
        )}
      >
        {isImage && attachment.preview ? (
          <Image
            alt={attachment.file.name}
            className={cn(
              'h-full w-full object-cover transition-opacity',
              attachment.isUploading && 'opacity-50'
            )}
            height={96}
            src={attachment.preview}
            width={96}
          />
        ) : isVideo ? (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <FileVideo className="h-8 w-8 text-muted-foreground" />
          </div>
        ) : null}

        {attachment.isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {attachment.error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/50 p-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <Button
              className="h-8 px-2"
              onClick={onRetry}
              size="sm"
              variant="ghost"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {attachment.progress != null && attachment.isUploading && (
          <div className="absolute bottom-0 left-0 w-full px-2 pb-2">
            <Progress className="h-1" value={attachment.progress} />
          </div>
        )}
      </div>

      <Button
        className="-top-2 -right-2 absolute h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onRemove}
        size="icon"
        variant="ghost"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function PostEditor() {
  const { data: session } = useSession();
  const user = session?.user;
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const mutation = useSubmitPostMutation();

  const {
    startUpload,
    attachments,
    isUploading,
    routeConfig,
    removeAttachment,
    retryUpload,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const onDrop = useCallback(
    (files: File[]) => {
      startUpload(files);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
    disabled: isUploading,
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: 'share your thoughts...',
      }),
    ],
  });

  editorRef.current = editor;

  const getContent = useCallback(() => {
    return (
      editorRef.current?.getText({
        blockSeparator: '\n',
      }) || ''
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const content = getContent();
    mutation.mutate(
      {
        content,
        mediaIds: attachments
          .filter((a) => !(a.isUploading || a.error) && a.mediaId)
          .map((a) => a.mediaId!) as string[],
      },
      {
        onSuccess: () => {
          editorRef.current?.commands.clearContent();
          resetMediaUploads();
        },
      }
    );
  }, [attachments, mutation, resetMediaUploads, getContent]);

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const files = Array.from(e.clipboardData.items)
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);
      if (files.length > 0) {
        startUpload(files);
      }
    },
    [startUpload]
  );

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user?.image} className="hidden sm:inline" />
        <div className="w-full">
          <div
            {...rootProps}
            className={cn(
              'relative rounded-2xl transition-colors',
              isDragActive && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            <input {...getInputProps()} />
            <EditorContent
              className={cn(
                'max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3',
                isDragActive && 'pointer-events-none opacity-50'
              )}
              editor={editor}
              onPaste={onPaste}
            />
            {isDragActive && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10">
                <p className="font-medium text-lg">Drop files to upload</p>
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {attachments.map((attachment) => (
                <AttachmentPreview
                  attachment={attachment}
                  key={attachment.id}
                  onRemove={() => removeAttachment(attachment.id)}
                  onRetry={() => retryUpload(attachment.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <Button
              className="text-muted-foreground"
              disabled={isUploading}
              onClick={(e) =>
                onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
              }
              type="button"
              variant="ghost"
            >
              <ImageIcon className="size-6" />
              <span>Photos</span>
            </Button>
            <Button
              className="text-muted-foreground"
              disabled={isUploading}
              onClick={(e) =>
                onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
              }
              type="button"
              variant="ghost"
            >
              <Icons.media className="size-6" />
              <span>Videos</span>
            </Button>

            <LoadingButton
              disabled={
                !(
                  getContent().trim() ||
                  attachments.some(
                    (a) => !(a.isUploading || a.error) && a.mediaId
                  )
                )
              }
              loading={mutation.isPending}
              onClick={handleSubmit}
            >
              Post
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
