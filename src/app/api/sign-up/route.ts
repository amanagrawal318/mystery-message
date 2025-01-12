import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { email, username, password } = await request.json();
    const existingVerifiedUser = await User.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUser) {
      return Response.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }
    const existingUserByEmail = await User.findOne({ email });
    const verifyCode = Math.floor(Math.random() * 1000000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: "User already exists" },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getHours() + 1);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = expiryDate;
        existingUserByEmail.isVerified = false;
        existingUserByEmail.isAcceptingMessage = false;
        existingUserByEmail.messages = [];
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getHours() + 1);
      const user = new User({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: false,
        messages: [],
      });
      await user.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User created successfully, Please verify email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}
