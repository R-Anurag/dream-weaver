
"use client";

import Lottie, { LottieComponentProps } from "lottie-react";

type LottiePlayerProps = Omit<LottieComponentProps, "animationData"> & {
    animationData: any;
};

export default function LottiePlayer({ animationData, ...props }: LottiePlayerProps) {
  return <Lottie animationData={animationData} {...props} />;
}
