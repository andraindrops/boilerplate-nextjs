"use client";

import {
  MoonIcon as DarkModeIcon,
  SunIcon as LightModeIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/_index";

export default function Component() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const next = resolvedTheme === "dark" ? "light" : "dark";

  if (!mounted) return null;

  return (
    <Button onClick={() => setTheme(next)} variant="ghost" size="icon">
      {resolvedTheme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
    </Button>
  );
}
