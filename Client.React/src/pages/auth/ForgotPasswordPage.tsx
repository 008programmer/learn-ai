import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
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

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await usersApi.forgotPassword({ email: values.email });
    } catch {
      // Silently ignore errors to prevent email enumeration
    }
    setSubmitted(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.forgotPasswordTitle")}</CardTitle>
          <CardDescription>{t("auth.forgotPasswordDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("auth.resetLinkSent")}
              </p>
              <Link
                to="/login"
                className="block text-center text-sm text-primary hover:underline"
              >
                {t("auth.backToLogin")}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? t("auth.sending") : t("auth.sendResetLink")}
                </Button>
              </form>
            </Form>
          )}
          {!submitted && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("auth.rememberPassword")}{" "}
              <Link to="/login" className="text-primary hover:underline">
                {t("common.signIn")}
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
