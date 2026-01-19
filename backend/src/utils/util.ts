import jwt from "jsonwebtoken";

//write a fuction that thake email and generate jwt token which is valid for 24hours
export const generateInviteToken = (email: string) => {
  return jwt.sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "24h",
  });
};
