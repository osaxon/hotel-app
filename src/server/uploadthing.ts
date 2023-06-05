/** server/uploadthing.ts */
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getAuth } from "@clerk/nextjs/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "16MB" } })
    // Set permissions and file types for this FileRoute
    // eslint-disable-next-line @typescript-eslint/require-await
    .middleware(async (req) => {
      const user = getAuth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId };
    })
    // eslint-disable-next-line @typescript-eslint/require-await
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);
    }),
  uploadImage: f({ image: { maxFileSize: "16MB" } }).onUploadComplete(
    ({ metadata, file }) => {
      console.log("uploaded with the following metadata:", metadata);
      metadata;

      console.log("files successfully uploaded:", file);
      file;
    }
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
