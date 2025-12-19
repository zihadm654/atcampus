import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfilePermissions } from "@/types/profile-types";
import type { UserData } from "@/types/types";

interface InstitutionOverviewProps {
	user: UserData;
	permissions: ProfilePermissions;
	isOwnProfile: boolean;
}

export default function InstitutionOverview({
	user,
	permissions,
	isOwnProfile,
}: InstitutionOverviewProps) {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Institution Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<div>
							<h3 className="text-lg font-medium">Institution</h3>
							<p className="text-sm text-muted-foreground">{user.name}</p>
						</div>
						<div>
							<h3 className="text-lg font-medium">Role</h3>
							<p className="text-sm text-muted-foreground">{user.role}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
