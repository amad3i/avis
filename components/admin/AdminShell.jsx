"use client";
import React from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import Dashboard from "@/app/admin/page";
import Orders from "@/app/admin/orders/page";
import Products from "@/app/admin/products/page";
import Categories from "@/app/admin/categories/page";
import Options from "@/app/admin/options/page";
import Slides from "@/app/admin/slides/page";
import Settings from "@/app/admin/settings/page";

const SECTIONS = {
  dashboard: Dashboard,
  orders: Orders,
  products: Products,
  categories: Categories,
  options: Options,
  slides: Slides,
  settings: Settings,
};

export default function AdminShell() {
  const { tab } = useAdminData();
  const Section = SECTIONS[tab] || Dashboard;
  return <Section />;
}
