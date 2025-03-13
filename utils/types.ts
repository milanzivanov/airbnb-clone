/* eslint-disable @typescript-eslint/no-explicit-any */
export type actionFunction = (
  prevState: any,
  formData: FormData
) => Promise<{ message: string }>;
