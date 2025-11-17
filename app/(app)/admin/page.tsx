import { DashboardHeading } from "../_components/dashboard-heading";
import WaitlistTable from "./_components/waitlist-table";

export default function AdminPage() {
    return (
        <>
            <DashboardHeading
                description="Manage users and waitlist"
                title="Admin"
            />
            <div className="container mx-auto px-4 py-8">
                <WaitlistTable />
            </div>
        </>
    );
}
