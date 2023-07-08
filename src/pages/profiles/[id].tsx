import type { NextPage, GetStaticPropsContext, GetStaticPaths } from "next";
import Head from "next/head";
import { ssgHelper } from "~/server/api/ssgHelper";
import ErrorPage from "next/error";
import { api } from "~/utils/api";
import Link from "next/link";
import { VscArrowLeft } from "react-icons/vsc";
import { IconHoverEffect } from "~/components/IconHoverEffect";
import { InfiniteTweetList } from "~/components/InfiniteTweetList";
import { ProfileImage } from "~/components/ProfileImage";
import { Button } from "~/components/Button";
import { useSession } from "next-auth/react";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ id }) => {

	const { data: profile } = api.profile.getById.useQuery({ id });
	const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
		{ userId: id}, 
		{ getNextPageParam: ( lastPage ) => lastPage.nextCursor }
	);

	const trpcUtilis = api.useContext();
	const toggleFollow = api.profile.toggleFollow.useMutation({ onSuccess: ({ addedFollow }) => {
		trpcUtilis.profile.getById.setData({ id }, oldData => {
				if(oldData == null) return;

				const countModifier = addedFollow ? 1 : -1

				return {
					...oldData,
					isFollowing: addedFollow,
					followersCount: oldData.followersCount + countModifier,
				}
		})
	}});

	if(profile == null || profile.name == null ) return <ErrorPage statusCode={404} />

	return (
		  <>
		    <Head>
		      <title>{`Twitter clone - ${profile.name}`}</title>
		    </Head>
		    <header className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
		      <Link href=".." className="mr-2">
		        <IconHoverEffect>
		          <VscArrowLeft className="w-6 h-6" />
		        </IconHoverEffect>
		      </Link>
		      <ProfileImage src={profile.image} className="flex-shrink-0" />
		      <div className="ml-2 flex-grow">
		        <h1 className="font-bold text-lg">{profile.name}</h1>
		        <div className="text-gray-500">
		          {profile.tweetsCount}{" "}
		          {getPlural(profile.tweetsCount, "Tweet", "Tweets")} - {" "}
		          {profile.followersCount}{" "}
		          {getPlural(profile.followersCount, "Follower", "Followers")} - {" "}
		          {profile.followsCount} Following
		        </div>
		      </div>
		      <FollowButton 
			      isFollowing={profile.isFollowing}
			      userId={id}
			      isLoading={toggleFollow.isLoading}
			      onClick={() => toggleFollow.mutate({ userId: id })}
		      />
		    </header>
		    <main>
	      		<InfiniteTweetList 
	      		  tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
			      isError={tweets.isError}
			      isLoading={tweets.isLoading}
			      hasMore={tweets.hasNextPage}
			      fetchNewTweets={tweets.fetchNextPage}
			    />
		    </main>
		  </>
	);
	
};

function FollowButton({ userId, isFollowing, onClick, isLoading }
: { userId: string, isLoading: boolean, isFollowing: boolean, onClick: () => void; }) {
	
	const session = useSession();

	if(session.status !== "authenticated" || session.data.user.id === userId) {
		return null;
	}

	return (
		<Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
			{isFollowing ? "Unfollow" : "Follow"}
		</Button>
	);
}

const pluralRules = new Intl.PluralRules()
function getPlural(number: number, singular: string, plural: string) {
	return pluralRules.select(number) === "one" ? singular : plural
}

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking"
	}
}

export async function getStaticProps(context: GetStaticPropsContext<{ id: string }>){
	const id = context.params?.id

	if(id == null) {
		return {
			redirect: {
				destination: "/"
			}
		}
	}

	const ssg = ssgHelper();
	await ssg.profile.getById.prefetch({ id });

	return {
		props: {
			id,
			trpcState: ssg.dehydrate(),
		}
	}
} 

export default ProfilePage;