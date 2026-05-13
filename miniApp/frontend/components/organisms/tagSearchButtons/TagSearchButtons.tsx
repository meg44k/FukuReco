'use client';

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import styles from "./TagSearchButtons.module.css";
import { FILTER_GROUPS } from "@/types/search";

export const TagSearchButtons = ({ onClose, onSearch }: { onClose?: () => void, onSearch?: (option: string) => void }) => {
    const router = useRouter();

    const handleSearch = (option: string) => {
        if (onSearch) {
            onSearch(option);
        } else {
            router.push(`/map?options=${encodeURIComponent(option)}`);
            if (onClose) onClose();
        }
    };

    return (
        <div>
            {FILTER_GROUPS.map((group) => (
                <div key={group.title} className={styles.section}>
                    <h2 className={styles.sectionTitle}>{group.title}</h2>
                    <div className={styles.buttonGrid}>
                        {group.options.map((option, optionIndex) => {
                            // 市松模様（チェッカーボード）の配色判定
                            const isDark = (Math.floor(optionIndex / 2) + (optionIndex % 2)) % 2 === 0;
                            const buttonClass = isDark ? styles.buttonDark : styles.buttonLight;

                            return (
                                <Button
                                    key={option}
                                    variant="contained"
                                    disableElevation
                                    className={`${styles.customButton} ${buttonClass}`}
                                    onClick={() => handleSearch(option)}
                                >
                                    {option}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
