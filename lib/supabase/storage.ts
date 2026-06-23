import "server-only";

import { getServiceSupabase } from "@/lib/supabase/server";

// Public bucket holding admin-uploaded pallet & category images. Created lazily
// on first upload so there is no manual Supabase setup step.
const BUCKET = "pallet-images";

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

async function ensureBucket(supabase: ReturnType<typeof getServiceSupabase>) {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (data) return;
  // Ignore "already exists" races; surface anything else.
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: ALLOWED,
  });
  if (error && !/exist/i.test(error.message)) throw error;
}

/** Upload an image file to the public bucket and return its public URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error("No file provided.");
  if (file.size > MAX_BYTES) throw new Error("Image is larger than 5 MB.");
  if (file.type && !ALLOWED.includes(file.type)) {
    throw new Error("Unsupported image type. Use PNG, JPG, WEBP, GIF or AVIF.");
  }

  const supabase = getServiceSupabase();
  await ensureBucket(supabase);

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
