import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.string().min(1, "City is required").max(100, "City must not exceed 100 characters"),
  role: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  newRole: z.string().min(1, "Role is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleFormValues = z.infer<typeof updateUserRoleSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// API response types
export interface UserResponse {
  id: string;
  email: string | null;
  city: string | null;
}

export interface LoginUserResponse {
  token: string;
  refreshToken: string;
}
