import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/user.schemas";
import { usersApi } from "@/api/users";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";
import type { ApiError } from "@/api/client";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const { t } = useTranslation();

  const [succeeded, setSucceeded] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null);
    try {
      await usersApi.resetPassword({
        email,
        token,
        newPassword: values.newPassword,
      });
      setSucceeded(true);
    } catch (err) {
      const apiError = err as ApiError;
      setServerError(
        apiError.detail ?? apiError.title ?? "Failed to reset password. The link may have expired."
      );
    }
  }

  if (!token || !email) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("auth.invalidLink")}</CardTitle>
            <CardDescription>{t("auth.invalidLinkDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/forgot-password"
              className="block text-center text-sm text-primary hover:underline"
            >
              {t("auth.requestNewLink")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.resetPasswordTitle")}</CardTitle>
          <CardDescription>{t("auth.resetPasswordDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {succeeded ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("auth.passwordResetSuccess")}
              </p>
              <Link
                to="/login"
                className="block text-center text-sm text-primary hover:underline"
              >
                {t("auth.signInNewPassword")}
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.newPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError && (
                  <p className="text-sm text-destructive">{serverError}</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? t("auth.resetting")
                    : t("auth.resetPassword")}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
