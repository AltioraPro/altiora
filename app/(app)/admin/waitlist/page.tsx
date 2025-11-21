import { AdminBreadcrumb } from "../_components/admin-breadcrumb";
import WaitlistTable from "./_components/waitlist-table";

export default function AdminWaitlistPage() {
    return (
        <div className="space-y-8 px-6 py-8">
            <AdminBreadcrumb />
            <WaitlistTable />
        </div>
    );
}
