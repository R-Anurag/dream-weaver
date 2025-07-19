"use client";

import Lottie, { LottieComponentProps } from "lottie-react";

type LottiePlayerProps = Omit<LottieComponentProps, "animationData"> & {
    animationData: any;
};

export default function LottiePlayer({ animationData, ...props }: LottiePlayerProps) {
  if (!animationData) {
    return null; // Or a placeholder/loading state
  }
  return <Lottie animationData={animationData} {...props} />;
}
