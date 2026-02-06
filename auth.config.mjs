import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { defineConfig } from "auth-astro";
import { db, User, eq } from "astro:db";
import bcrypt from "bcryptjs";

export default defineConfig({
	providers: [
		Google({
			clientId: import.meta.env.GOOGLE_CLIENT_ID,
			clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
		}),
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				if (process.env.NODE_ENV === 'development') {
					console.log("Login attempt for email:", credentials?.email);
				}
				if (!credentials?.email || !credentials?.password) {
					console.log("Missing credentials");
					return null;
				}

				const user = await db
					.select()
					.from(User)
					.where(eq(User.email, credentials.email))
					.get();

				if (!user) {
					console.log("User not found by email");
					return null;
				}
				
				if (!user.password) {
					console.log("User has no password set (Social login user?)");
					return null;
				}

				const isValidPassword = await bcrypt.compare(
					credentials.password,
					user.password
				);

				if (process.env.NODE_ENV === 'development') {
					console.log("Password check result:", isValidPassword);
				}

				if (!isValidPassword) {
					console.log("Invalid password");
					return null;
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				};
			},
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				// Upsert user into database
				const existingUser = await db
					.select()
					.from(User)
					.where(eq(User.email, user.email || ""))
					.get();

				if (!existingUser) {
					const newId = crypto.randomUUID();

					await db.insert(User).values({
						id: newId,
						email: user.email || "",
						name: user.name || "Anonymous",
						image: user.image || "",
						role: "reader", // Default role
					});
				}
			}
			return true;
		},
		async session({ session }) {
			if (session.user?.email) {
				const dbUser = await db
					.select()
					.from(User)
					.where(eq(User.email, session.user.email))
					.get();
				if (dbUser) {
					session.user.role = dbUser.role;
					session.user.image = dbUser.image;
					session.user.name = dbUser.name;
					if (process.env.NODE_ENV === 'development') {
						console.log("Session updated with DB user data:", { email: dbUser.email, image: dbUser.image });
					}
				}
			}
			return session;
		},
	},
});
