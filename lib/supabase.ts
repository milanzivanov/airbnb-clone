import { createClient } from "@supabase/supabase-js";

const bucket = "temp-airbnb-clone";

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_KEY as string;

export const supabase = createClient(url, key);

export const uploadImage = async (image: File) => {
  const timestam = Date.now();
  const newName = `${timestam}-${image.name}`;

  const { data } = await supabase.storage.from(bucket).upload(newName, image, {
    cacheControl: "3600"
  });

  if (!data) throw new Error("Failed to upload image");

  return supabase.storage.from(bucket).getPublicUrl(newName);
};
