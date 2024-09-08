import { MessageSquareText, Pencil, Smile, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";

interface ToolbarProps {
    isAuthor: boolean;
    isPending: boolean;
    handleEdit: () => void;
    handleThread: () => void;
    handleDelete: () => void;
    handleReaction: (value: string) => void;
    hideThreadButton?: boolean;
};

export const Toolbar = ({ isAuthor, isPending, handleDelete, handleEdit, handleReaction, handleThread, hideThreadButton }: ToolbarProps) => {
    return (
        <div className="absolute top-0 right-5">
            <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
                <EmojiPopover hint="Add reaction" onEmojiSelect={(emoji) => handleReaction(emoji.native)}>
                    <Button variant="ghost" size="sm" disabled={isPending}>
                        <Smile className="size-4" />
                    </Button>
                </EmojiPopover>
                {!hideThreadButton && (
                    <Hint label="Reply in thread">
                        <Button variant="ghost" size="sm" disabled={isPending} onClick={handleThread}>
                            <MessageSquareText className="size-4" />
                        </Button>
                    </Hint>
                )}
                {isAuthor && (
                    <Hint label="Edit message">
                        <Button variant="ghost" size="sm" disabled={isPending} onClick={handleEdit}>
                            <Pencil className="size-4" />
                        </Button>
                    </Hint>
                )}
                {isAuthor && (
                    <Hint label="Delete message">
                        <Button variant="ghost" size="sm" disabled={isPending} onClick={handleDelete}>
                            <Trash className="size-4" />
                        </Button>
                    </Hint>
                )}
            </div>
        </div>
    );
};