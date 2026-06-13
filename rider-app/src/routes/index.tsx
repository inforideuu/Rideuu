import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Logo } from "@/components/rider/Logo";
import { MobileShell } from "@/components/rider/MobileShell";
import { ArrowRight, Phone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
