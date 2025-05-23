import Image from "next/image";

function ImageContainer({
  mainImage,
  name
}: {
  mainImage: string;
  name: string;
}) {
  return (
    <section className="h-[300px] md:h-[500px] relative mt-8">
      <Image
        src={
          mainImage
            ? `https://ocgeuaanllqmawsggybj.supabase.co/storage/v1/object/public/temp-airbnb-clone/${mainImage}`
            : ""
        }
        fill
        sizes="100vw"
        alt={name}
        className="object-cover  rounded-md"
        priority
      />
    </section>
  );
}
export default ImageContainer;
