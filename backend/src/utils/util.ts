import jwt from "jsonwebtoken";

type InviteTokenData = {
  email: string;
  boardId: string;
};

//write a fuction that thake email and generate jwt token which is valid for 24hours
export const generateInviteToken = (data: InviteTokenData) => {
  return jwt.sign(data, process.env.JWT_SECRET as string, {
    expiresIn: "24h",
  });
};

export const extractEmailFromInviteToken = (
  inviteToken: string
): InviteTokenData | null => {
  try {
    return jwt.verify(
      inviteToken,
      process.env.JWT_SECRET as string
    ) as InviteTokenData;
  } catch (error) {
    return null;
  }
};
