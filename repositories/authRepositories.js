// repositories/authRepositories.js
import prisma from "../config/prisma.js";

export const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  return user;
};

export const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

export const updateUserVerification = async (email) => {
  const user = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
    },
  });
  return user;
};

export const updateUserOTP = async (email, otp, isResetPassword = false) => {
  if (isResetPassword) {
    return await prisma.user.update({
      where: { email },
      data: {
        resetPasswordOtp: otp,
        resetOtpCreatedAt: new Date(),
        isResetPasswordVerified: false,
      },
    });
  } else {
    return await prisma.user.update({
      where: { email },
      data: {
        verificationOtp: otp,
        verificationOtpCreatedAt: new Date(),
      },
    });
  }
};

export const updateUserPassword = async (email, password) => {
  const user = await prisma.user.update({
    where: { email },
    data: {
      password,
      resetPasswordOtp: null,
      isResetPasswordVerified: false,
    },
  });
  return user;
};
