"use client";

import { ClipboardEvent, useCallback, useRef } from "react";
import Image from "next/image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";

import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LoadingButton from "@/components/feed/LoadingButton";
import UserAvatar from "@/components/UserAvatar";

import { useSubmitPostMutation } from "./mutations";
import useMediaUpload, { Attachment } from "./useMediaUpload";

import "./styles.css";

import { Icons } from "@/components/shared/icons";

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
  const isImage = attachment.file.type.startsWith("image/");
  const isVideo = attachment.file.type.startsWith("video/");

  return (
    <div className="group relative">
      <div
        className={cn(
          "relative h-24 w-24 overflow-hidden rounded-lg border",
          attachment.error && "border-red-500",
          attachment.isUploading && "border-muted",
        )}
      >
        {isImage && attachment.preview ? (
          <Image
            src={attachment.preview}
            alt={attachment.file.name}
            className={cn(
              "h-full w-full object-cover transition-opacity",
              attachment.isUploading && "opacity-50",
            )}
            width={96}
            height={96}
          />
        ) : isVideo ? (
          <div className="bg-muted flex h-full w-full items-center justify-center">
            <Icons.video className="text-muted-foreground h-8 w-8" />
          </div>
        ) : null}

        {attachment.isUploading && (
          <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {attachment.error && (
          <div className="bg-background/50 absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
            <AlertCircle className="text-destructive h-6 w-6" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={onRetry}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {attachment.progress != null && attachment.isUploading && (
          <div className="absolute bottom-0 left-0 w-full px-2 pb-2">
            <Progress value={attachment.progress} className="h-1" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onRemove}
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
    [startUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
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
        placeholder: "share your thoughts...",
      }),
    ],
  });

  editorRef.current = editor;

  const getContent = useCallback(() => {
    return (
      editorRef.current?.getText({
        blockSeparator: "\n",
      }) || ""
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const content = getContent();
    mutation.mutate(
      {
        content,
        mediaIds: attachments
          .filter((a) => !a.isUploading && !a.error && a.mediaId)
          .map((a) => a.mediaId!) as string[],
      },
      {
        onSuccess: () => {
          editorRef.current?.commands.clearContent();
          resetMediaUploads();
        },
      },
    );
  }, [attachments, mutation, resetMediaUploads, getContent]);

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const files = Array.from(e.clipboardData.items)
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);
      if (files.length > 0) {
        startUpload(files);
      }
    },
    [startUpload],
  );

  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl p-3 shadow-sm">
      <div className="flex gap-3">
        <UserAvatar
          avatarUrl={user?.image}
          className="hidden sm:inline"
          size={40}
        />
        <div className="w-full">
          <div
            {...rootProps}
            className={cn(
              "relative rounded-2xl transition-colors",
              isDragActive && "ring-primary ring-2 ring-offset-2",
            )}
          >
            <input {...getInputProps()} />
            <EditorContent
              editor={editor}
              onPaste={onPaste}
              className={cn(
                "bg-background max-h-[20rem] w-full overflow-y-auto rounded-2xl px-5 py-3",
                isDragActive && "pointer-events-none opacity-50",
              )}
            />
            {isDragActive && (
              <div className="bg-primary/10 absolute inset-0 flex items-center justify-center rounded-2xl">
                <p className="text-lg font-medium">Drop files to upload</p>
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {attachments.map((attachment) => (
                <AttachmentPreview
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={() => removeAttachment(attachment.id)}
                  onRetry={() => retryUpload(attachment.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={(e) =>
                onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
              }
              disabled={isUploading}
            >
              <Icons.media className="size-5.5 text-green-500 " />
              <span>Photos</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={(e) =>
                onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
              }
              disabled={isUploading}
            >
              <Icons.video className="size-6 text-red-500" />
              <span>Videos</span>
            </Button>

            <LoadingButton
              onClick={handleSubmit}
              loading={mutation.isPending}
              disabled={
                !getContent().trim() &&
                !attachments.some(
                  (a) => !a.isUploading && !a.error && a.mediaId,
                )
              }
            >
              Post
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
