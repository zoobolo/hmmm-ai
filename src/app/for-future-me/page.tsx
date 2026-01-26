"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForFutureMe() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/timeline");
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        background: "#fafafa"
      }}
    >
      <p className="text-[#999]">Redirecting to timeline...</p>
    </div>
  );
}
