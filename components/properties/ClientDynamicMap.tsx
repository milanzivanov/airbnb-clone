"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DynamicMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />
});

function ClientDynamicMap({ countryCode }: { countryCode: string }) {
  return <DynamicMap key={countryCode} countryCode={countryCode} />;
}

export default ClientDynamicMap;
