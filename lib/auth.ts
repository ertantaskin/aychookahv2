import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
        role: { label: "Rol", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null;
        }

        const { email, password, role } = credentials;

        try {
          if (role === "admin") {
            // Admin kontrolü
            const admin = await prisma.admin.findUnique({
              where: { email: email as string },
            });

            if (!admin) {
              console.error("Admin not found:", email);
              return null;
            }

            const isPasswordValid = await bcrypt.compare(
              password as string,
              admin.password
            );

            if (!isPasswordValid) {
              console.error("Invalid password for admin:", email);
              return null;
            }

            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: "admin",
            };
          } else {
            // Kullanıcı kontrolü
            const user = await prisma.user.findUnique({
              where: { email: email as string },
            });

            if (!user) {
              return null;
            }

            const isPasswordValid = await bcrypt.compare(
              password as string,
              user.password
            );

            if (!isPasswordValid) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/giris",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // NextAuth URL yapılandırması - güvenli hale getir
  trustHost: true, // Next.js 15 için gerekli
});

