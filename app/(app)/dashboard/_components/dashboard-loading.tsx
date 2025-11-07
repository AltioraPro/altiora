export function DashboardLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
                <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div className="h-32 rounded bg-gray-200" key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

