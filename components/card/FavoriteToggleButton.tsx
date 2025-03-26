import { FaHeart } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { CardSignInButton } from "../form/Buttons";

async function FavoriteToggleButton({ propertyId }: { propertyId: string }) {
  const { userId } = await auth();

  if (!userId) {
    return <CardSignInButton />;
  }

  return (
    <Button size="icon" variant="outline" className="p-2 cursor-pointer">
      <FaHeart />
    </Button>
  );
}
export default FavoriteToggleButton;
