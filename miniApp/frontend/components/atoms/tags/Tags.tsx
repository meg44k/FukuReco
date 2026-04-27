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
       <div className={styles.container}>
        <Collapse in={showAllTags} collapsedSize={36}>
          <div className={styles.chips}>
            {tags.map((tag, index) => (
              <Chip 
                key={`${tag}-${index}`} 
                label={tag} 
                variant="outlined" 
                size="small" 
                className={`${styles.chip} ${!showAllTags && index >= 3 ? styles.hiddenChip : ''}`}
              />
            ))}
          </div>
        </Collapse>
        
        {tags.length > 3 && (
          <button 
            type="button"
            className={styles.showMoreButton} 
            onClick={() => setShowAllTags(!showAllTags)}
            aria-expanded={showAllTags}
          >
            {showAllTags ? (
              <>タグを閉じる <ChevronUp size={16} /></>
            ) : (
              <>タグをすべてみる <ChevronDown size={16} /></>
            )}
          </button>
        )}
       </div> 
    )
}
