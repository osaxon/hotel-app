import { UploadDropzone } from "@uploadthing/react";
import { useStore } from "@/store/appStore";
import { OurFileRouter } from "@/server/uploadthing";

export const OurUploadDropzone = () => {
  const setUploadImgs = useStore((state) => state.setUploadedImgs);
  const uploadedImgs = useStore((state) => state.uploadedImgs);
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
