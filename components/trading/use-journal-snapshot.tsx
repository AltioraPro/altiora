"use client";

import html2canvas from "html2canvas";
import { useCallback, useRef, useState } from "react";

interface UseJournalSnapshotOptions {
    journalName: string;
}

export function useJournalSnapshot({ journalName }: UseJournalSnapshotOptions) {
    const captureRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleCapture = useCallback(async () => {
        if (!captureRef.current) {
            return;
        }

        setIsCapturing(true);
        try {
            const canvas = await html2canvas(captureRef.current, {
                backgroundColor: "#000000",
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: captureRef.current.scrollWidth,
                height: captureRef.current.scrollHeight,
            });

            const imageDataUrl = canvas.toDataURL("image/png", 0.95);
            setCapturedImage(imageDataUrl);
            setShowPreview(true);
        } finally {
            setIsCapturing(false);
        }
    }, []);

    const handleDownload = useCallback(() => {
        if (!capturedImage) {
            return;
        }

        const link = document.createElement("a");
        const sanitizedName = journalName.replace(/[^a-zA-Z0-9]/g, "-");
        const today = new Date().toISOString().split("T")[0];

        link.href = capturedImage;
        link.download = `altiora-${sanitizedName}-${today}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [capturedImage, journalName]);

    const handleClosePreview = useCallback(() => {
        setShowPreview(false);
        setCapturedImage(null);
    }, []);

    return {
        captureRef,
        isCapturing,
        capturedImage,
        showPreview,
        handleCapture,
        handleClosePreview,
        handleDownload,
    };
}
