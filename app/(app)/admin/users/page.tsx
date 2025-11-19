import { AdminBreadcrumb } from "../_components/admin-breadcrumb";
import UsersTable from "./_components/users-table";

export default function AdminUsersPage() {
    return (
        <div className="space-y-8">
            <AdminBreadcrumb />
            <UsersTable />
        </div>
    );
}
