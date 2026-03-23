import { type AdminRole } from "@/lib/admin/auth";

export type AdminUserStatus = "active" | "suspended";

export type AdminInviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  status: AdminUserStatus;
  passwordHash: string;
  mfaRequired: boolean;
  mfaSecretHash?: string;
  invitedByUserId?: string;
  invitedByRole?: AdminRole;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  failedLoginCount: number;
  lockedUntil?: string;
};

export type AdminInvite = {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminInviteStatus;
  tokenHash: string;
  mfaRequired: boolean;
  invitedByUserId?: string;
  invitedByRole?: AdminRole;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  acceptedAt?: string;
};

export type AdminDirectoryData = {
  users: AdminUser[];
  invites: AdminInvite[];
};

export type PublicAdminUser = Omit<AdminUser, "passwordHash" | "mfaSecretHash"> & {
  hasMfaSecret: boolean;
};

export type PublicAdminInvite = Omit<AdminInvite, "tokenHash">;
