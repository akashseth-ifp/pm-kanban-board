import { NextFunction, Request, Response } from "express";
import { validateResource } from "./validateResource.middleware";
import { authorizeResource } from "./authorize.middleware";
import { UpdateBoardEventSchema } from "../boardEvents/updateBoard.event";
import { DeleteBoardEventSchema } from "../boardEvents/deleteBoard.event";
import { GetBoardEventSchema } from "../boardEvents/getBoard.event";
import { AddListEventSchema } from "../boardEvents/addList.event";
import { UpdateListEventSchema } from "../boardEvents/updateList.event";
import { DeleteListEventSchema } from "../boardEvents/deleteList.event";
import { AddTicketEventSchema } from "../boardEvents/addTicket.event";
import { UpdateTicketEventSchema } from "../boardEvents/updateTicket.event";
import { DeleteTicketEventSchema } from "../boardEvents/deleteTicket.event";
import { MoveListEventSchema } from "../boardEvents/moveList.event";
import { MoveTicketEventSchema } from "../boardEvents/moveTicket.event";
import { AddCommentEventSchema } from "../boardEvents/addComment.event";
import { UpdateCommentEventSchema } from "../boardEvents/updateComment.event";
import { DeleteCommentEventSchema } from "../boardEvents/deleteComment.event";
import { GetTicketCommentsSchema } from "../boardEvents/getTicketComments.event";
import { AppError } from "../lib/app-error";

export const boardEventMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { eventType } = req.body;

  if (eventType === "UPDATE_BOARD") {
    return validateResource(UpdateBoardEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Admin")(req, res, next);
      },
    );
  }

  if (eventType === "DELETE_BOARD") {
    return validateResource(DeleteBoardEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Admin")(req, res, next);
      },
    );
  }

  if (eventType === "GET_BOARD") {
    return validateResource(GetBoardEventSchema)(req, res, (validationErr) => {
      if (validationErr) return next(validationErr);
      return authorizeResource("Viewer")(req, res, next);
    });
  }

  if (eventType === "ADD_LIST") {
    return validateResource(AddListEventSchema)(req, res, (validationErr) => {
      if (validationErr) return next(validationErr);
      return authorizeResource("Member")(req, res, next);
    });
  }

  if (eventType === "UPDATE_LIST") {
    return validateResource(UpdateListEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Member")(req, res, next);
      },
    );
  }

  if (eventType === "DELETE_LIST") {
    return validateResource(DeleteListEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Member")(req, res, next);
      },
    );
  }

  // add support for eventType ADD_TICKET, UPDATE_TICKET, DELETE_TICKET
  if (eventType === "ADD_TICKET") {
    return validateResource(AddTicketEventSchema)(req, res, (validationErr) => {
      if (validationErr) return next(validationErr);
      return authorizeResource("Member")(req, res, next);
    });
  }

  if (eventType === "UPDATE_TICKET") {
    return validateResource(UpdateTicketEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Member")(req, res, next);
      },
    );
  }

  if (eventType === "DELETE_TICKET") {
    return validateResource(DeleteTicketEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Member")(req, res, next);
      },
    );
  }

  if (eventType === "MOVE_LIST") {
    return validateResource(MoveListEventSchema)(req, res, (validationErr) => {
      if (validationErr) return next(validationErr);
      return authorizeResource("Member")(req, res, next);
    });
  }

  if (eventType === "MOVE_TICKET") {
    return validateResource(MoveTicketEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Member")(req, res, next);
      },
    );
  }

  if (eventType === "ADD_COMMENT") {
    return validateResource(AddCommentEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Member")(req, res, next);
      },
    );
  }

  if (eventType === "UPDATE_COMMENT") {
    return validateResource(UpdateCommentEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Member")(req, res, next);
      },
    );
  }

  if (eventType === "DELETE_COMMENT") {
    return validateResource(DeleteCommentEventSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Member")(req, res, next);
      },
    );
  }

  if (eventType === "GET_TICKET_COMMENTS") {
    return validateResource(GetTicketCommentsSchema)(
      req,
      res,
      (validationErr) => {
        if (validationErr) return next(validationErr);
        return authorizeResource("Viewer")(req, res, next);
      },
    );
  }

  throw new AppError(`Invalid event type, ${eventType}`, 400);
};
