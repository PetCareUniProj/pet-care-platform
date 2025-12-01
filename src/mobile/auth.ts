import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import type { KeycloakProfile } from "next-auth/providers/keycloak";

function resolveIdentityUrl() {
  return process.env.Identity__Url ?? process.env.IDENTITY__URL;
}

function resolveIdentityRealm() {
  return process.env.Identity__Realm ?? process.env.IDENTITY__REALM ?? "pet-care-platform";
}

function resolveIssuer() {
  if (process.env.KEYCLOAK_ISSUER) {
    return process.env.KEYCLOAK_ISSUER;
  }

  const identityUrl = resolveIdentityUrl();
  const realm = resolveIdentityRealm();
  if (identityUrl && realm) {
    return `${identityUrl}/realms/${realm}`;
  }

  return undefined;
}

const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "account";
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

export const authConfig = {
  providers: [
    Keycloak({
      issuer: resolveIssuer(),
      clientId,
      ...(clientSecret ? { clientSecret } : {}),
      profile(profile) {
        return {
          id: profile.sub ?? profile.id,
          name: profile.name,
          email: profile.email,
          roles:
            profile.realm_access?.roles ?? profile.resource_access?.[clientId]?.roles ?? [],
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      if (profile) {
        const kcProfile = profile as KeycloakProfile & {
          realm_access?: { roles?: string[] };
          resource_access?: Record<string, { roles?: string[] }>;
        };

        const realmRoles = kcProfile.realm_access?.roles ?? [];
        const resourceRoles = kcProfile.resource_access?.[clientId]?.roles ?? [];
        token.roles = Array.from(new Set([...((token.roles as string[]) ?? []), ...realmRoles, ...resourceRoles]));
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.roles = (token.roles as string[] | undefined) ?? [];
      }

      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
