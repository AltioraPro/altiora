import { SearchModal } from "@/app/(app)/_components/search/search-modal";
import { CreateJournalModal } from "@/components/trading/CreateJournalModal";
import { EditJournalModal } from "@/components/trading/EditJournalModal";

export function ModalProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <CreateJournalModal />
            <EditJournalModal />
            <SearchModal />
        </>
    );
}
