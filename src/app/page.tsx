"use client";

import { Chart } from "@/components/Chart";
import { Button } from "@/components/ui/button";
import { ChartConfig } from "@/components/ui/chart";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>();

  useEffect(() => {
    loadBrightness();
  }, []);

  const loadBrightness = async () => {
    const response = await fetch(
      "https://ec2-13-60-8-36.eu-north-1.compute.amazonaws.com/brightness",
      { method: "GET" },
    );
    const data = await response.json();

    const headers = data[0].replace("\n", "").split(",");

    const brightnessData = data
      .slice(-80)
      .filter((_: any, i: number) => !!(i % 2))
      .map((row: string) => {
        const rowArray = row.replace("\n", "").split(",");
        const entry = {} as { [key: string]: number | string };
        headers.forEach((header: string, i: number) => {
          if (header === "datetime")
            entry[header] = new Date(rowArray[i]).toLocaleTimeString();
          else entry[header] = parseFloat(rowArray[i]);
        });
        return entry;
      });

    setChartConfig({
      brightness_mean: {
        label: "Mean Brightness",
        color: "hsl(var(--chart-1))",
      },
      brightness_rms: {
        label: "RMS Brightness",
        color: "hsl(var(--chart-2))",
      },
      brightness_perceived: {
        label: "Perceived Brightness",
        color: "hsl(var(--chart-3))",
      },
    });

    setChartData(brightnessData);
  };

  const dispatchWaterCommand = async () => {
    setLoading(true);
    let response = await fetch(
      "https://ec2-13-60-8-36.eu-north-1.compute.amazonaws.com/water",
      { method: "POST" },
    );
    let data = await response.text();
    while (data === "Watering") {
      response = await fetch(
        "https://ec2-13-60-8-36.eu-north-1.compute.amazonaws.com/water",
        { method: "GET", headers: {} },
      );
      data = await response.text();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col">
      <div className="container mx-auto flex flex-col items-center justify-center gap-5 py-5">
        <div className="flex min-h-screen flex-col items-center justify-center gap-3">
          <h1>PlantCam</h1>
          <div className="relative h-96 w-96 border border-foreground">
            <Image
              src="https://ec2-13-60-8-36.eu-north-1.compute.amazonaws.com/cam"
              alt="PlantCam"
              className="object-cover"
              sizes="100%"
              fill
              priority
              unoptimized
              loader={({ src }) => src}
            />
          </div>
          <Button variant="default" onClick={dispatchWaterCommand}>
            {loading && <Loader2 className="animate-spin" />}
            Water
          </Button>
        </div>

        <div className="flex w-full flex-col">
          <Chart chartData={chartData} chartConfig={chartConfig} />
        </div>
      </div>
    </div>
  );
}
