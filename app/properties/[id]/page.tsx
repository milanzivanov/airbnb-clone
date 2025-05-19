import FavoriteToggleButton from "@/components/card/FavoriteToggleButton";
import PropertyRating from "@/components/card/PropertyRating";
import Amenities from "@/components/properties/Amenities";
import BreadCrumbs from "@/components/properties/BreadCrumbs";
import ClientDynamicMap from "@/components/properties/ClientDynamicMap";
import Description from "@/components/properties/Description";
import ImageContainer from "@/components/properties/ImageContainer";
import PropertyDetails from "@/components/properties/PropertyDetails";
import ShareButton from "@/components/properties/ShareButton";
import UserInfo from "@/components/properties/UserInfo";
import PropertyReviews from "@/components/reviews/PropertyReviews";
import SubmitReview from "@/components/reviews/SubmitReview";
import { fetchPropertyDetails, findExistingReview } from "@/utils/actions";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ClientDynamicBookingWrapper from "@/components/booking/ClientBookingDynamicWrapper";

async function PropertyDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const property = await fetchPropertyDetails(params.id);

  const firstName = property?.profile?.firstName || "";
  const profileImage = property?.profile?.profileImage || "";

  if (!property) redirect("/");
  const { baths, bedrooms, beds, guests } = property;
  const details = { baths, bedrooms, beds, guests };

  // allow user to submit review if they are not the owner of the property
  // and they have not already submitted a review
  const { userId } = auth();
  const isNotOwner = property.profile.clerkId !== userId;
  const reviewDoseNotExist =
    userId && isNotOwner && !(await findExistingReview(userId, property.id));

  // const currentUser = auth();
  // console.log("////////// currentUser", currentUser);

  return (
    <section>
      <BreadCrumbs name={property.name} />
      <header className="flex justify-between items-center mt-4">
        <h1 className="text-4xl font-bold ">{property.tagline}</h1>
        <div className="flex items-center gap-x-4">
          {/* share button */}
          <ShareButton name={property.name} propertyId={property.id} />
          <FavoriteToggleButton propertyId={property.id} />
        </div>
      </header>
      <ImageContainer mainImage={property.image} name={property.name} />
      <section className="lg:grid lg:grid-cols-12 gap-x-12 mt-12">
        <div className="lg:col-span-8">
          <div className="flex gap-x-4 items-center">
            <h1 className="text-xl font-bold">{property.name}</h1>
            <PropertyRating inPage propertyId={property.id} />
          </div>
          <PropertyDetails details={details} />
          <UserInfo profile={{ firstName, profileImage }} />

          <Separator className="mt-4 bg-gray-300 h-[1px]" />
          <Description description={property.description} />
          <Amenities amenities={property.amenities} />
          {/* map */}
          <ClientDynamicMap countryCode={property.country} />
        </div>
        <div className="lg:col-span-4 flex flex-col items-center">
          {/* calendar */}
          <ClientDynamicBookingWrapper
            propertyId={property.id}
            price={property.price}
            bookings={property.bookings}
          />
        </div>
      </section>

      {/* submit review  */}
      {reviewDoseNotExist && <SubmitReview propertyId={property.id} />}

      {/* <SubmitReview propertyId={property.id} /> */}
      <PropertyReviews propertyId={property.id} />
    </section>
  );
}
export default PropertyDetailsPage;
