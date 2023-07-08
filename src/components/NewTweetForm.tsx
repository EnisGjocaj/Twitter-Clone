import { Button } from "../components/Button";
import { useSession } from "next-auth/react";
import { ProfileImage } from "../components/ProfileImage";
import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { api } from "../utils/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
	if(textArea == null) return
	textArea.style.height = "0";
	textArea.style.height = `${textArea.scrollHeight}px`;
}

export function NewTweetForm() {
	const session = useSession();
	if(session.status !== "authenticated") return null;

	return <Form />
}

function Form(){
	const [inputValue, setInputValue] = useState();
	const session = useSession();
	const textAreaRef = useRef<HTMLTextAreaElement>();
	const inputRef = useCallback((textArea:HTMLTextAreaElement) => {
		updateTextAreaSize(textArea);
		textAreaRef.current = textArea;
	}, []);

	const trpcUtilis = api.useContext();
	
	useLayoutEffect(() => {
		updateTextAreaSize(textAreaRef.current)
	}, [inputValue])

	const createTweet = api.tweet.create.useMutation({
		onSuccess: (newTweet) => {
			setInputValue("");

			if(session.status !== "authenticated") return;

			trpcUtilis.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
				if(oldData == null || oldData.pages[0] == null) return;

				newCacheTweet = {
					...newTweet,
					likeCount: 0,
					likedByMe: false,
					user: {
						id: session.data.user.id,
						name: session.data.user.name || null,
						image: session.data.user.image || null,
					}
				}

				return {
					...oldData,
					pages: [
						{
							...oldData.pages[0],
							tweets: [newCacheTweet, ...oldData.pages[0].tweets],
						},
						...oldData.pages.slice(1),
					],
				};
			});
		}
	});

	if(session.status !== "authenticated") return null;

	function handleSubmit(e: FormEvent) {
		e.preventDefault()

		createTweet.mutate({ content: inputValue })
	}

	return <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
		<div className="flex gap-4">
			<ProfileImage scr={session.data.user.image} />
			<textarea 
				ref={inputRef}
				style={{ height: 0 }}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				className="flex-grow resize-none overflow-hidden text-lg p-4 outline-none" placeholder="What's happening?"/>
		</div>
		<Button className="self-end">Tweet</Button>
	</form>
}