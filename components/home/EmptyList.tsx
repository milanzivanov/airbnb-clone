import { Button } from "../ui/button";
import Link from "next/link";

function EmptyList({
  heading = "No items in the list.",
  message = "Keep exploring our properties.",
  btnText = "back home"
}: {
  heading?: string;
  message?: string;
  btnText?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <h2 className="text-2xl font-semibold text-center">{heading}</h2>
      <p className="text-muted-foreground text-center">{message}</p>
      <Button className="mt-4 capitalize" size="lg">
        <Link href="/">{btnText}</Link>
      </Button>
    </div>
  );
}
export default EmptyList;
