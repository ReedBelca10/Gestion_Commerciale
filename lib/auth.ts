import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { TOTP } from "otplib"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                twoFactorCode: { label: "2FA Code", type: "text", optional: true }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user || !user.password) {
                    throw new Error("Invalid credentials")
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials")
                }

                // 2FA Logic
                if (user.twoFactorEnabled && user.twoFactorSecret) {
                    if (!credentials.twoFactorCode) {
                        throw new Error("2FA_REQUIRED")
                    }

                    // Verify Code
                    const totp = new TOTP({ algorithm: 'sha1', digits: 6, period: 30 })
                    const isValid = totp.verify(credentials.twoFactorCode, user.twoFactorSecret)
                    if (!isValid) {
                        throw new Error("Invalid 2FA Code")
                    }
                }

                return user
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.tenantId = user.tenantId
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as any
                session.user.tenantId = token.tenantId as string | null
            }
            return session
        }
    }
}
