"use server";

import { profileSchema } from "./schemas";

export const createProfileAction = async (
  prevState: unknown,
  formData: FormData
) => {
  try {
    const rawData = Object.fromEntries(formData);
    const validetedFields = profileSchema.parse(rawData);
    console.log(validetedFields);
    // Return a success message
    return { message: "Profile created successfully" };
  } catch (error) {
    console.log(error);
    // Return an error message
    return { message: "There was an error" };
  }
};
