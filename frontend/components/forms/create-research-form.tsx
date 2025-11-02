"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "@uploadthing/react";
import { AlertCircle, Loader2, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";
import JobDescriptionEditor from "@/components/editor/richEditor";
import { cn } from "@/lib/utils";
import { researchSchema, type TResearch } from "@/lib/validations/research";

import { createResearch } from "../researches/actions";
// import { useSubmitPostMutation } from "../researches/editor/mutations";
import useMediaUpload, {
  type Attachment,
} from "../researches/editor/useMediaUpload";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";

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
  const isPdf = attachment.file.type.startsWith("application/");

  return (
    <div className="group relative">
      <div
        className={cn(
          "relative h-24 w-24 overflow-hidden rounded-lg border",
          attachment.error && "border-red-500",
          attachment.isUploading && "border-muted"
        )}
      >
        {isPdf && attachment.preview ? (
          <object
            data={attachment.preview}
            height="500px"
            type="application/pdf"
            width="100%"
          >
            <p>
              Unable to display PDF file.{" "}
              <a href={attachment.preview}>Download</a> instead.
            </p>
          </object>
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

interface CreateJobFormProps {
  user?: User;
}

export function CreateResearchForm({ user }: CreateJobFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<TResearch>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  const queryClient = useQueryClient();

  // const mutation = useSubmitPostMutation();

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

  const { onClick, ..._rootProps } = getRootProps();

  async function onSubmit(values: TResearch) {
    try {
      setPending(true);
      const researchData = {
        ...values,
        mediaIds: attachments
          .filter((a) => !(a.isUploading || a.error) && a.mediaId)
          .map((a) => a.mediaId!),
      };

      await createResearch(researchData);
      toast.success("research created successfully!");
      queryClient.invalidateQueries({ queryKey: ["research-feed"] });
      form.reset();
      resetMediaUploads();
      router.push("/researches");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [form]);
  return (
    <Form {...form}>
      <form
        className="col-span-1 flex flex-col gap-8 lg:col-span-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Research Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Research Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <JobDescriptionEditor field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <div
                {...getRootProps()}
                className={cn(
                  "relative rounded-2xl border-2 border-muted-foreground/50 border-dashed p-8 text-center transition-colors hover:bg-muted/50",
                  isDragActive && "border-primary-500 bg-primary-500/10"
                )}
              >
                <input {...getInputProps()} />
                <p>Drag & drop a PDF file here, or click to select a file</p>
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
            </div>
          </CardContent>
        </Card>
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? "Submitting..." : "Continue"}
        </Button>
      </form>
    </Form>
  );
}
