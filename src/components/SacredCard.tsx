'use client'

import React from 'react';
import { SacredGeometry } from '../../lib/iqra/13-utils/style'; // [TC] reason: relative path to canonical lib/iqra | id: c1-scard
import './SacredCard.css';

interface SacredCardProps {
  children: React.ReactNode;
  title?: string;
  resonance?: number;
  glowColor?: string;
}

export const SacredCard: React.FC<SacredCardProps> = ({ 
  children, 
  title, 
  resonance = 0, 
  glowColor = 'var(--accent-gold)' 
}) => {
  const isResonating = resonance > 0.7;

  return (
    <div className={`sacred-card ${isResonating ? 'resonating' : ''} glow-${glowColor.replace('var(--', '').replace(')', '')}`}>
      {title && <h3 className="brand-font card-title">{title}</h3>}
      <div className="card-content">
        {children}
      </div>

      
    </div>
  );
};
