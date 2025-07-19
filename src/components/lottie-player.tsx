"use client";

import Lottie, { type LottieComponentProps } from "lottie-react";

type LottiePlayerProps = Omit<LottieComponentProps, "animationData"> & {
    animationData: any;
};

export default function LottiePlayer({ animationData, ...props }: LottiePlayerProps) {
  if (!animationData) {
    return null;
  }
  return <Lottie animationData={animationData} {...props} />;
}
