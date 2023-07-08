import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { VscHome } from "react-icons/vsc";
import { VscAccount } from "react-icons/vsc";
import { VscSignIn } from "react-icons/vsc";
import { VscSignOut } from "react-icons/vsc";
import { IconHoverEffect } from "../components/IconHoverEffect";

export function SideNav() {
	const session = useSession();
	const user = session.data?.user

	return (
		<nav className="sticky top-0 px-2 py-4">
			<ul className="flex flex-col items-start gap-2 whitespace-nowrap">
				<li>
					<Link href="/">
						<IconHoverEffect>
							<span className="flex items-center gap-4">
								<VscHome className="w-8 h-8"/>
								<span className="hidden text-lg md:inline">Home</span>
							</span>
						</IconHoverEffect>
					</Link>
				</li>
				{user != null && (
					<li>
						<Link href={`/profiles/${user.id}`}>
							<IconHoverEffect>
								<span className="flex items-center gap-4">
									<VscAccount className="w-8 h-8"/>
									<span className="hidden text-lg md:inline">Profile</span>
								</span>
							</IconHoverEffect>
						</Link>
					</li>
				)}
				{user == null ? (
					<li>
						<button onClick={() => void signIn()}>
							<IconHoverEffect>
								<span className="flex items-center gap-4">
									<VscSignIn className="w-8 h-8 fill-green-700"/>
									<span className="hidden text-lg md:inline text-green-700">Log In</span>
								</span>
							</IconHoverEffect>
						</button>
					</li>
				) : (
					<li>
						<button onClick={() => void signOut()}>
							<IconHoverEffect>
								<span className="flex items-center gap-4">
									<VscSignOut className="w-8 h-8 fill-red-700"/>
									<span className="hidden text-lg md:inline text-red-700">Log Out</span>
								</span>
							</IconHoverEffect>
						</button>
					</li>
				)}
			</ul>	
		</nav>
	);
}