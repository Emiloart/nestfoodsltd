import { RecipeManagerClient } from "@/components/admin/recipe-manager-client";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminRecipesPage() {
  await requireAdminPageRole("/admin/recipes");
  return <RecipeManagerClient />;
}
