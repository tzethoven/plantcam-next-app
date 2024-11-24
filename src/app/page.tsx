"use client";

import Image from "next/image";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const dispatchWaterCommand = async () => {
    setLoading(true);
    let response = await fetch(
      "http://ec2-13-60-8-36.eu-north-1.compute.amazonaws.com/water",
      { method: "POST" },
    );
    let data = await response.text();
    while (data === "Watering") {
      response = await fetch(
        "http://ec2-13-60-8-36.eu-north-1.compute.amazonaws.com/water",
        { method: "GET", headers: {} },
      );
      data = await response.text();
    }
    setLoading(false);
  };

  return (
    <div className="bg-base-100 h-screen w-screen">
      <div className="container flex h-full flex-col items-center justify-center gap-5">
        <h1>PlantCam</h1>
        <div className="relative h-96 w-72">
          <Image
            src="http://ec2-13-60-8-36.eu-north-1.compute.amazonaws.com/cam"
            alt="PlantCam"
            className="object-cover"
            fill
            priority
          />
        </div>
        <button className="btn btn-primary" onClick={dispatchWaterCommand}>
          Water
          {loading && <div className="loading loading-sm loading-spinner" />}
        </button>
      </div>
    </div>
  );
}
