import { Resend } from "resend";

export const sendBoardInviteMail = async ({
  email,
  inviteToken,
  title,
}: {
  email: string;
  inviteToken: string;
  title: string;
}) => {
  const inviteLink = `${process.env.FRONTEND_URL}/app/invite?token=${inviteToken}&board=${title}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: "Kanban board <noreply@akashbuilds.space>",
    to: [email],
    subject: `You have been invited to join ${title}`,
    html: `<strong>Click <a href="${inviteLink}">here</a> to accept the invitation</strong>`,
  });

  if (error) {
    console.error("[Resend] Error sending email:", error);
    throw error;
  }

  return data;
};
