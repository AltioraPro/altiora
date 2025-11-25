import { SearchModal } from "@/app/(app)/_components/search/search-modal";
import { TimezoneSync } from "@/components/auth/TimezoneSync";
import { CreateJournalModal } from "@/components/trading/CreateJournalModal";
import { EditJournalModal } from "@/components/trading/EditJournalModal";

export function ModalProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <TimezoneSync />
            <CreateJournalModal />
            <EditJournalModal />
            <SearchModal />
        </>
    );
}
