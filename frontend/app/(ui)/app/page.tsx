'use client'

import { redirect, RedirectType } from "next/navigation";

export default function AppPage() {
    redirect("/app/dashboard", RedirectType.replace);
}