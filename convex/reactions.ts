import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { auth } from "./auth";

const getMember = async (ctx: QueryCtx, workspaceId: Id<"workspaces">, userId: Id<"users">) => {
    return ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", workspaceId).eq("userId", userId)).unique();
};

export const toggle = mutation({
    args: {
        messageId: v.id("messages"),
        value: v.string()
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.messageId);

        if (!message) {
            throw new Error("Message not found");
        }

        const member = await getMember(ctx, message.workspaceId, userId);

        if (!member) {
            throw new Error("Unauthorized");
        }

        const exisingMessageReactionFromUser = await ctx.db.query("reactions").filter((q) =>
            q.and(
                q.eq(q.field("messageId"), args.messageId),
                q.eq(q.field("memberId"), member._id),
                q.eq(q.field("value"), args.value),
            )
        ).first();

        if (exisingMessageReactionFromUser) {
            await ctx.db.delete(exisingMessageReactionFromUser._id)
            return exisingMessageReactionFromUser._id
        } else {
            const newReactionId = await ctx.db.insert("reactions", {
                value: args.value,
                memberId: member._id,
                messageId: message._id,
                workspaceId: message.workspaceId
            })
            return newReactionId;
        }
    }
});