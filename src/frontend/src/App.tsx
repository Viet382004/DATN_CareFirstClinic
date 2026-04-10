import React from "react";
import { RouterProvider } from "react-router";
import routes  from "./app/routes";

export default function App() {
  return <RouterProvider router={routes} />;
}
