import React from "react";
import { Redirect } from "expo-router";
import { useApp } from "../store/context";

export default function Index() {
  const { user } = useApp();

  if (user?.role === "admin") {
    return <Redirect href="/admin" />;
  }
  if (user?.role === "candidate") {
    return <Redirect href="/candidate" />;
  }
  if (user?.role === "recruiter") {
    if (user?.isVerified) {
      return <Redirect href="/recruiter/home" />;
    }
    return <Redirect href="/recruiter" />;
  }

  return <Redirect href="/recruiter" />;
}
