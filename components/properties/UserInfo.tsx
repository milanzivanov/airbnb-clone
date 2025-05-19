import Image from "next/image";

type UserInfoProps = {
  profile: {
    profileImage: string;
    firstName: string;
  };
};

function UserInfo({ profile: { profileImage, firstName } }: UserInfoProps) {
  return (
    <article className="grid grid-cols-[auto_1fr] gap-4 mt-4">
      {/* must inspect this part */}
      <Image
        src={
          profileImage
            ? `https://ocgeuaanllqmawsggybj.supabase.co/storage/v1/object/public/temp-airbnb-clone/${profileImage}`
            : ""
        }
        alt={firstName}
        width={50}
        height={50}
        className="rounded-md w-12 h-12 object-cover"
      />
      <div>
        <p>
          Hosted by
          <span className="font-bold"> {firstName}</span>
        </p>
        <p className="text-muted-foreground font-light">
          Superhost &middot; 2 years hosting
        </p>
      </div>
    </article>
  );
}
export default UserInfo;
