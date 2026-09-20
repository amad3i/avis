"use client";
import React, { createContext, useContext } from "react";

const AdminPathContext = createContext({ adminPath: "admin", kitchenPath: "kitchen" });

export const useAdminPath = () => useContext(AdminPathContext);

export const AdminPathProvider = ({ value, children }) => (
  <AdminPathContext.Provider value={value}>{children}</AdminPathContext.Provider>
);
