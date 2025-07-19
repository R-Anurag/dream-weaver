
"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

export default function ParticleBackground() {
  const [init, setInit] = useState(false);
  const [particleColor, setParticleColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  useEffect(() => {
    const fgColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();

    const convertHslToHex = (hsl: string) => {
        if (!hsl) return '#000000';
        const [h, s, l] = hsl.match(/\d+/g)?.map(Number) || [0,0,0];
        const hDecimal = h;
        const sDecimal = s / 100;
        const lDecimal = l / 100;
        const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
        const x = c * (1 - Math.abs(((hDecimal / 60) % 2) - 1));
        const m = lDecimal - c / 2;
        let r = 0, g = 0, b = 0;
        if (hDecimal >= 0 && hDecimal < 60) { [r, g, b] = [c, x, 0]; }
        else if (hDecimal >= 60 && hDecimal < 120) { [r, g, b] = [x, c, 0]; }
        else if (hDecimal >= 120 && hDecimal < 180) { [r, g, b] = [0, c, x]; }
        else if (hDecimal >= 180 && hDecimal < 240) { [r, g, b] = [0, x, c]; }
        else if (hDecimal >= 240 && hDecimal < 300) { [r, g, b] = [x, 0, c]; }
        else if (hDecimal >= 300 && hDecimal < 360) { [r, g, b] = [c, 0, x]; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    }

    setParticleColor(convertHslToHex(fgColor));
    setBgColor(convertHslToHex(bgColor));

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: particleColor,
        },
        links: {
          color: particleColor,
          distance: 150,
          enable: false,
          opacity: 0.1,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          random: true,
          speed: 0.3,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 120,
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
          animation: {
            enable: true,
            speed: 1,
            sync: false,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
          animation: {
            enable: true,
            speed: 2,
            sync: false
          }
        },
      },
      detectRetina: true,
    }),
    [particleColor],
  );

  if (init) {
    return (
        <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={options}
            className="absolute inset-0 z-0"
        />
    );
  }

  return <></>;
}
