"use client"
import { useState } from 'react';
import styles from "./Tags.module.css"
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TagsProps {
  tags?: string[];
}

export default function Tags ({ tags = [] }: TagsProps) {
    const [showAllTags, setShowAllTags] = useState(false);
    
    if (tags.length === 0) return null;

    return (
       <div>
        <div className={styles.chips} style={{ marginBottom: showAllTags ? '8px' : '0.8rem' }}>
          {tags.slice(0, 3).map((tag, index) => (
            <Chip key={index} label={tag} variant="outlined" size="small" className={styles.chip} />
          ))}
          {tags.length > 3 && !showAllTags && <div style={{ color: "#ccc", display: "flex", alignItems: "center" }}>...</div>}
        </div>
        {tags.length > 3 && (
          <>
            <Collapse in={showAllTags}>
              <div className={styles.chips}>
                {tags.slice(3).map((tag, index) => (
                  <Chip key={index + 3} label={tag} variant="outlined" size="small" className={styles.chip} />
                ))}
              </div>
            </Collapse>
            <div 
              className={styles.showMoreTags} 
              onClick={() => setShowAllTags(!showAllTags)}
            >
              {showAllTags ? (
                <>タグを閉じる <ChevronUp size={16} /></>
              ) : (
                <>タグをすべてみる <ChevronDown size={16} /></>
              )}
            </div>
          </>
        )}
       </div> 
    )
}