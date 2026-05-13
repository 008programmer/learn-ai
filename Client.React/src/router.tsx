import { createBrowserRouter } from "react-router";
import { Shell } from "@/components/layout/Shell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LandingPage } from "@/pages/LandingPage";
import { AccessDeniedPage } from "@/pages/AccessDeniedPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { ShipmentsPage } from "@/pages/shipments/ShipmentsPage";
import { ShipmentDetailPage } from "@/pages/shipments/ShipmentDetailPage";
import { CreateShipmentPage } from "@/pages/shipments/CreateShipmentPage";
import { CarriersPage } from "@/pages/carriers/CarriersPage";
import { StocksPage } from "@/pages/stocks/StocksPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { UserDetailPage } from "@/pages/users/UserDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/access-denied",
    element: <AccessDeniedPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Shell />,
        children: [
          {
            path: "shipments",
            element: <ShipmentsPage />,
          },
          {
            path: "shipments/new",
            element: <CreateShipmentPage />,
          },
          {
            path: "shipments/:number",
            element: <ShipmentDetailPage />,
          },
          {
            path: "carriers",
            element: <CarriersPage />,
          },
          {
            path: "stocks",
            element: <StocksPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "users/:userId",
            element: <UserDetailPage />,
          },
        ],
      },
    ],
  },
]);
