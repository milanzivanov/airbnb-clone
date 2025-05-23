"use server";

import {
  createReviewSchema,
  imageSchema,
  profileSchema,
  propertySchema,
  validateWithZodSchema
} from "./schemas";
import db from "./db";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage, supabase } from "@/lib/supabase";
import { calculateTotals } from "./calculateTotals";
import { formatDate } from "./format";

const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to access this route");
  }
  if (!user.privateMetadata?.hasProfile) {
    redirect("/profile/create");
  }
  return user;
};

// admin user
const getAdminUser = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to access this route");
  }

  if (user.id !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }
  return user;
};

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "An error occurred"
  };
};

export const createProfileAction = async (
  prevState: unknown,
  formData: FormData
) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Please login to create a profile");

    const rawData = Object.fromEntries(formData);
    //
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.create({
      data: {
        clerkId: user?.id,
        email: user?.emailAddresses[0].emailAddress,
        profileImage: user?.imageUrl ?? "",
        ...validatedFields
      }
    });

    const client = clerkClient();

    await client.users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true
      }
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

export const fetchProfileImage = async () => {
  const user = await currentUser();

  if (!user) return null;

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id
    },
    select: {
      profileImage: true
    }
  });

  return profile?.profileImage;
};

export const fetchProfile = async () => {
  const user = await getAuthUser();

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id
    }
  });
  if (!profile) return redirect("/profile/create");
  return profile;
};

export const updateProfileAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    //
    const validatedFields = validateWithZodSchema(profileSchema, rawData);
    console.log(validatedFields);

    await db.profile.update({
      where: {
        clerkId: user.id
      },
      data: validatedFields
    });

    revalidatePath("/profile");
    return { message: "Profile updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProfileImageAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, {
      image
    });
    const fullPath = await uploadImage(validatedFields.image);

    await db.profile.update({
      where: {
        clerkId: user.id
      },
      data: {
        profileImage: fullPath
      }
    });

    revalidatePath("/profile");

    return { message: "Profile image updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//
export const createPropertyAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rowData = Object.fromEntries(formData);

    const file = formData.get("image") as File;

    const validatedFields = validateWithZodSchema(propertySchema, rowData);
    const validatedFile = validateWithZodSchema(imageSchema, {
      image: file
    });
    const fullPath = await uploadImage(validatedFile.image);

    await db.property.create({
      data: {
        ...validatedFields,
        image: fullPath,
        profileId: user.id
      }
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

export const fetchProperties = async ({
  search = "",
  category
}: {
  search?: string;
  category?: string;
}) => {
  const properties = await db.property.findMany({
    where: {
      category,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } }
      ]
    },

    select: {
      id: true,
      name: true,
      tagline: true,
      country: true,
      price: true,
      image: true
    },

    orderBy: {
      createdAt: "desc"
    }
  });

  return properties;
};

export const fetchFavoriteId = async ({
  propertyId
}: {
  propertyId: string;
}) => {
  const user = await getAuthUser();

  const favorite = await db.favorite.findFirst({
    where: {
      propertyId,
      profileId: user.id
    },
    select: {
      id: true
    }
  });

  return favorite?.id || null;
};

export const toggleFavoriteAction = async (prevState: {
  propertyId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await getAuthUser();
  const { propertyId, favoriteId, pathname } = prevState;

  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId
        }
      });
    } else {
      await db.favorite.create({
        data: {
          propertyId,
          profileId: user.id
        }
      });
    }

    revalidatePath(pathname);
    return { message: favoriteId ? "Removed from Faves" : "Added to Faves" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favorite.findMany({
    where: {
      profileId: user.id
    },
    select: {
      property: {
        select: {
          id: true,
          name: true,
          tagline: true,
          price: true,
          country: true,
          image: true
        }
      }
    }
  });
  return favorites.map((favorite) => favorite.property);
};

export const fetchPropertyDetails = async (id: string) => {
  return db.property.findUnique({
    where: {
      id
    },
    include: {
      profile: true,
      bookings: {
        select: {
          checkIn: true,
          checkOut: true
        }
      }
    }
  });
};

/////////////////
// review
export const createReviewAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(createReviewSchema, rawData);
    await db.review.create({
      data: {
        ...validatedFields,
        profileId: user.id
      }
    });
    revalidatePath(`/properties/${validatedFields.propertyId}`);
    return { message: "Review submitted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchPropertyReviews = async (propertyId: string) => {
  const reviews = await db.review.findMany({
    where: {
      propertyId
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      profile: {
        select: {
          firstName: true,
          profileImage: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return reviews;
};

export const fetchPropertyReviewsByUser = async () => {
  const user = await getAuthUser();
  const reviews = await db.review.findMany({
    where: {
      profileId: user.id
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      property: {
        select: {
          name: true,
          image: true
        }
      }
    }
  });

  return reviews;
};

export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();

  try {
    await db.review.deleteMany({
      where: {
        id: reviewId,
        profileId: user.id
      }
    });
    revalidatePath(`/reviews`);
    return { message: "Review deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export async function fetchPropertyRating(propertyId: string) {
  const result = await db.review.groupBy({
    by: ["propertyId"],
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    },
    where: {
      propertyId
    }
  });

  // empty array if no reviews
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0
  };
}

export const findExistingReview = async (
  userId: string,
  propertyId: string
) => {
  return await db.review.findFirst({
    where: {
      profileId: userId,
      propertyId
    }
  });
};

///////////////
// bookings
export const createBookingAction = async (prevState: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) => {
  const user = await getAuthUser();
  const { propertyId, checkIn, checkOut } = prevState;

  const property = await db.property.findUnique({
    where: {
      id: propertyId
    },
    select: {
      price: true
    }
  });

  if (!property) {
    return { message: "Property not found" };
  }

  const { orderTotal, totalNights } = calculateTotals({
    checkIn,
    checkOut,
    price: property.price
  });

  try {
    const booking = await db.booking.create({
      data: {
        checkIn,
        checkOut,
        orderTotal,
        totalNights,
        profileId: user.id,
        propertyId
      }
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/bookings");
};

export const fetchBookings = async () => {
  const user = await getAuthUser();
  const bookings = await db.booking.findMany({
    where: {
      profileId: user.id
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          country: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return bookings;
};

export const deleteBookingAction = async (prevState: { bookingId: string }) => {
  const { bookingId } = prevState;
  // console.log("//////// ", prevState);
  const user = await getAuthUser();
  try {
    const result = await db.booking.deleteMany({
      where: {
        id: bookingId,
        profileId: user.id
      }
    });
    revalidatePath("/bookings");
    return { message: "Booking deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//////////////
// rentals
export const fetchRentals = async () => {
  const user = await getAuthUser();
  const rentals = await db.property.findMany({
    where: {
      profileId: user.id
    },
    select: {
      id: true,
      name: true,
      price: true
    }
  });

  const rentalsWithBookingSums = await Promise.all(
    rentals.map(async (rental) => {
      const totalNightsSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id
        },
        _sum: {
          totalNights: true
        }
      });

      const orderTotalSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id
        },
        _sum: {
          orderTotal: true
        }
      });

      return {
        ...rental,
        totalNightsSum: totalNightsSum._sum.totalNights,
        orderTotalSum: orderTotalSum._sum.orderTotal
      };
    })
  );
  return rentalsWithBookingSums;
};

// delete rental and image from supabase storage
export async function deleteRentalAction(prevState: { propertyId: string }) {
  const { propertyId } = prevState;
  const user = await getAuthUser();

  try {
    // Fetch rental first to get image path
    const rental = await db.property.findUnique({
      where: {
        id: propertyId,
        profileId: user.id
      },
      select: {
        image: true
      }
    });

    if (!rental) return { message: "Rental not found" };

    // Delete the image from Supabase Storage
    if (rental.image) {
      const { error: deleteError } = await supabase.storage
        .from("temp-airbnb-clone")
        .remove([rental.image]);

      if (deleteError) {
        throw deleteError.message;
      }
    }

    // // Delete the rental from database
    await db.property.delete({
      where: {
        id: propertyId,
        profileId: user.id
      }
    });

    revalidatePath("/rentals");
    return { message: "Rental deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
}

export const fetchRentalDetails = async (propertyId: string) => {
  const user = await getAuthUser();
  const property = await db.property.findUnique({
    where: {
      id: propertyId,
      profileId: user.id
    }
  });
  return property;
};

export const updatePropertyAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get("id") as string;

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id
      },
      data: {
        ...validatedFields
      }
      // data: validatedFields
    });
    revalidatePath("/rentals/${propertyId}/edit");
    return { message: "Property updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const updatePropertyImageAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get("id") as string;

  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, {
      image
    });
    const fullPath = await uploadImage(validatedFields.image);
    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id
      },
      data: {
        image: fullPath
      }
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: "Property image updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//reservations
export const fetchReservations = async () => {
  const user = await getAuthUser();
  // console.log("//// user", user);

  const reservations = await db.booking.findMany({
    where: {
      property: {
        profileId: user.id
      }
    },

    orderBy: {
      createdAt: "desc" // or 'asc' for ascending order
    },

    include: {
      property: {
        select: {
          id: true,
          name: true,
          price: true,
          country: true
        }
      }
    }
  });
  return reservations;
};

///////////////
// admin
export const fetchStats = async () => {
  await getAdminUser();

  const usersCount = await db.profile.count();
  const propertiesCount = await db.property.count();
  const bookingsCount = await db.booking.count();

  return {
    usersCount,
    propertiesCount,
    bookingsCount
  };
};

export const fetchChartsData = async () => {
  await getAdminUser();

  const date = new Date();
  date.setMonth(date.getMonth() - 6);

  const sixMonthsAgo = date;

  const bookings = await db.booking.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const bookingsPerMonth = bookings.reduce((total, current) => {
    const date = formatDate(current.createdAt, true);

    const existingEntry = total.find((entry) => entry.date === date);
    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      total.push({ date, count: 1 });
    }
    return total;
  }, [] as Array<{ date: string; count: number }>);

  return {
    bookingsPerMonth
  };
};
