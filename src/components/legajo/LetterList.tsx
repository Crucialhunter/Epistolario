"use client";

import { CartaSummary } from '@/lib/types';
import LetterListItem from '@/components/legajo/LetterListItem';

interface LetterListProps {
  letters: CartaSummary[];
  selectedLetterId: string | null;
  onSelect: (letterId: string) => void;
}

export default function LetterList({ letters, selectedLetterId, onSelect }: LetterListProps) {
  return (
    <div className="grid gap-3">
      {letters.map((letter) => (
        <LetterListItem key={letter.id_carta} letter={letter} active={selectedLetterId === letter.id_carta} onSelect={onSelect} />
      ))}
    </div>
  );
}
