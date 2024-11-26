import React, { useState } from 'react';
import { Download, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from './Modal';

interface OutputDisplayProps {
  output: string;
  isStreaming: boolean;
}

export function OutputDisplay({ output, isStreaming }: OutputDisplayProps) {
  const flashcards = output.split('\n').map(card => {
    const [front, back] = card.split(':').map(part => part.trim());
    return { front, back };
  }).filter(card => card.front && card.back);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setDirection('left');
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setDirection(null);
      }, 300);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setDirection('right');
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setDirection(null);
      }, 300);
    }
  };

  const downloadCSV = () => {
    setIsModalOpen(true);
  };

  const handleDownload = (filename: string) => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Generated Flashcards {isStreaming && '(Generating...)'}
        </label>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={downloadCSV}
            className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {flashcards.length > 0 && (
        <div className="flex flex-col items-center">
          <div 
            className={`relative w-full max-w-lg aspect-[3/2] perspective-1000 cursor-pointer
              ${direction === 'left' ? 'animate-slide-left' : direction === 'right' ? 'animate-slide-right' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`absolute w-full h-full transition-transform duration-500 transform-style-3d
              ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front of card */}
              <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-6 flex items-center justify-center">
                <h2 className="text-xl font-bold text-gray-800 text-center">
                  {flashcards[currentIndex].front}
                </h2>
              </div>
              {/* Back of card */}
              <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-6 flex items-center justify-center rotate-y-180">
                <p className="text-xl text-gray-700 text-center">
                  {flashcards[currentIndex].back}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between w-full mt-6 px-4">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 text-green-600 disabled:opacity-50 transition-opacity hover:text-green-700"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {flashcards.length}
            </span>
            <button
              onClick={nextCard}
              disabled={currentIndex === flashcards.length - 1}
              className="flex items-center gap-2 text-green-600 disabled:opacity-50 transition-opacity hover:text-green-700"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDownload}
        title="Save Flashcards"
      />
    </div>
  );
}