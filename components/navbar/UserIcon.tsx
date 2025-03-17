/* eslint-disable @next/next/no-img-element */
import { fetchProfileImage } from "@/utils/actions";
import { LuUser } from "react-icons/lu";

async function UserIcon() {
  const profileImage = await fetchProfileImage();

  if (profileImage)
    return (
      <img
        alt="profile image"
        src={profileImage}
        className="w-6 h-6 rounded-full object-cover"
      />
    );

  return <LuUser className="w-6 h-6 bg-primary rounded-full text-white" />;
}
export default UserIcon;
