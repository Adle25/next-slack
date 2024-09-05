import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface ChatInputProps {
    placeholder: string;

};

type CreateMessageValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    body: string;
    image: Id<"_storage"> | undefined;
}

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

export const ChatInput = ({ placeholder }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0);
    const [pending, setPending] = useState(false);

    const editorRef = useRef<Quill | null>(null);

    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();

    const { mutate: createMessage } = useCreateMessage();
    const { mutate: generateUploadUrl } = useGenerateUploadUrl();

    const handleSubmit = async ({ body, image }: { body: string, image: File | null }) => {
        try {
            setPending(true);
            editorRef?.current?.enable(false);

            const values: CreateMessageValues = {
                channelId, workspaceId, body, image: undefined
            };

            if (image) {
                const url = await generateUploadUrl({}, { throwError: true });

                if (!url) {
                    throw new Error("Url not found");
                }

                const result = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": image.type },
                    body: image
                });

                if (!result.ok) {
                    throw new Error("Failed to upload image");
                }

                const { storageId } = await result.json();

                values.image = storageId;
            }

            await createMessage(values, {
                throwError: true
            });

            setEditorKey((prevKey) => prevKey + 1);
        } catch (error) {
            toast.error("Failed to send message")
        } finally {
            setPending(false);
            editorRef?.current?.enable(true);
        }
    }

    return (
        <div className="px-5 w-full">
            <Editor
                key={editorKey}
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={pending}
                innerRef={editorRef}
            />
        </div>
    );
};