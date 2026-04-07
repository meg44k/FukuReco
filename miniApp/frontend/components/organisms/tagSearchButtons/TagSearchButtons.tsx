'use client';

import { Button } from "@mui/material";
import Link from "next/link";
import styles from "./TagSearchButtons.module.css";
import { FILTER_GROUPS } from "@/types/search";

export const TagSearchButtons = () => {
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
                                    component={Link} 
                                    href={`/maps?options=${encodeURIComponent(option)}`} 
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
