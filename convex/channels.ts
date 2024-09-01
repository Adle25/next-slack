import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const get = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            return [];
        }

        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique();

        if (!member) {
            return [];
        }

        const channels = await ctx.db.query("channels").withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId)).collect();

        return channels;
    }
});

export const create = mutation({
    args: {
        name: v.string(),
        workspaceId: v.id("workspaces")
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique();

        if (member && member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const parsedName = args.name.replace(/\s+/g, "-").toLowerCase();

        const channelId = await ctx.db.insert("channels", {
            name: parsedName,
            workspaceId: args.workspaceId
        });

        return channelId;

    }
});

export const getById = query({
    args: {
        id: v.id("channels")
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            return null;
        }

        const channel = await ctx.db.get(args.id);

        if (!channel) {
            return null;
        }

        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", channel.workspaceId).eq("userId", userId)).unique();

        if (!member) {
            return null;
        }

        return channel;
    }
});