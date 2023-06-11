import { UploadDropzone } from "@uploadthing/react";
import { useUploadThing } from "@/utils/useUploadthing";
import { useStore } from "@/store/appStore";
import { useCallback, useState } from "react";
import { OurFileRouter } from "@/server/uploadthing";
import type { FileWithPath } from "react-dropzone";

export const OurUploadDropzone = () => {
  const setUploadImgs = useStore((state) => state.setUploadedImgs);
  const uploadedImgs = useStore((state) => state.uploadedImgs);

  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  }, []);
  

  return (
    <UploadDropzone<OurFileRouter>
      endpoint="uploadImage"
      onClientUploadComplete={(res) => {
        // Do something with the response
        if (res) {
          setUploadImgs(res);
        }
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
};
