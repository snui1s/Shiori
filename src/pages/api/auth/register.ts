import type { APIRoute } from "astro";
import { db, User, eq } from "astro:db";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { validateRegistration } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    // 1. Validate input
    const validation = validateRegistration(name, email, password);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: validation.message,
        }),
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .get();

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "อีเมลนี้ถูกใช้งานแล้ว",
        }),
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create new user
    const userId = nanoid();

    await db.insert(User).values({
      id: userId,
      email,
      password: hashedPassword,
      name: name,
      role: "reader",
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "ลงทะเบียนสำเร็จ",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
      }),
      { status: 500 }
    );
  }
};
