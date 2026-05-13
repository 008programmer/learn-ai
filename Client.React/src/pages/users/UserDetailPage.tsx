import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { usersApi } from "@/api/users";
import type { UserResponse } from "@/schemas/user.schemas";
import {
  updateUserSchema,
  updateUserRoleSchema,
  type UpdateUserFormValues,
  type UpdateUserRoleFormValues,
} from "@/schemas/user.schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const updateForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { email: "", role: "" },
  });

  const roleForm = useForm<UpdateUserRoleFormValues>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: { newRole: "" },
  });

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    usersApi
      .getById(userId)
      .then((u) => {
        setUser(u);
        updateForm.reset({ email: u.email ?? "" });
      })
      .catch(() => setError(t("users.notFound")))
      .finally(() => setLoading(false));
  }, [userId, updateForm, t]);

  async function onUpdate(values: UpdateUserFormValues) {
    if (!userId) return;
    try {
      const updated = await usersApi.update(userId, values);
      setUser(updated);
    } catch {
      setError(t("users.notFound"));
    }
  }

  async function onUpdateRole(values: UpdateUserRoleFormValues) {
    if (!userId) return;
    try {
      await usersApi.updateRole(userId, values);
      roleForm.reset();
    } catch {
      setError(t("users.notFound"));
    }
  }

  async function handleDelete() {
    if (!userId) return;
    if (!confirm(t("users.deleteConfirm"))) return;
    try {
      await usersApi.delete(userId);
      void navigate("/users");
    } catch {
      setError(t("users.notFound"));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("common.loading")}
      </div>
    );
  }

  if (error || !user) {
    return <p className="text-destructive">{error ?? t("users.notFound")}</p>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t("users.detailTitle")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("users.editUser")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(onUpdate)}
              className="space-y-4"
            >
              <FormField
                control={updateForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.email")}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("users.roleOptional")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin, User…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={updateForm.formState.isSubmitting}
              >
                {updateForm.formState.isSubmitting
                  ? t("users.saving")
                  : t("users.save")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("users.updateRole")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...roleForm}>
            <form
              onSubmit={roleForm.handleSubmit(onUpdateRole)}
              className="space-y-4"
            >
              <FormField
                control={roleForm.control}
                name="newRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("users.newRole")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin, User, Manager…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={roleForm.formState.isSubmitting}
              >
                {roleForm.formState.isSubmitting
                  ? t("users.updating")
                  : t("users.updateRole")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("users.dangerZone")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t("users.deleteUser")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
