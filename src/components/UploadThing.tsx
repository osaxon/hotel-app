import { useUploadThing } from "@/utils/useUploadthing";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import type { FileWithPath } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";
import type { ExpandedRouteConfig } from "uploadthing/server";

const generatePermittedFileTypes = (config?: ExpandedRouteConfig) => {
  const fileTypes = config ? Object.keys(config) : [];

  const maxFileCount = config
    ? Object.values(config).map((v) => v.maxFileCount)
    : [];

  return { fileTypes, multiple: maxFileCount.some((v) => v && v > 1) };
};

export function UploadThing() {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing({
    endpoint: "uploadImage", // replace this with an actual endpoint name
    onClientUploadComplete: () => {
      alert("uploaded successfully!");
    },
    onUploadError: () => {
      alert("error occurred while uploading");
    },
  });

  const { fileTypes } = generatePermittedFileTypes(permittedFileInfo?.config);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div>
        {files.length > 0 && (
          <button onClick={() => startUpload(files)}>
            Upload {files.length} files
          </button>
        )}
      </div>
      Drop files here!
    </div>
  );
}
