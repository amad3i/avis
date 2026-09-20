import KitchenClient from "@/components/KitchenClient";
import KitchenErrorBoundary from "@/components/KitchenErrorBoundary";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function KitchenPage() {
  const kitchenPath = process.env.KITCHEN_PATH || "kitchen";
  const adminPath = process.env.ADMIN_PATH || "admin";
  return (
    <KitchenErrorBoundary>
      <KitchenClient kitchenPath={kitchenPath} adminPath={adminPath} />
    </KitchenErrorBoundary>
  );
}
