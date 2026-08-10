import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2, Sparkles, Send } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  onCompleteAction?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  title = "Was this information helpful?",
  subtitle = "Help us keep our aisle directions & store guides accurate.",
  badgeText = "Store Experience Review",
  onCompleteAction,
}) => {
  const [rating, setRating] = useState<'UP' | 'DOWN' | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSelectRating = (selected: 'UP' | 'DOWN') => {
    setRating(selected);
    if (!showCommentBox) {
      submitAndClose();
    }
  };

  const submitAndClose = () => {
    setIsSubmitted(true);
    try {
      sessionStorage.setItem('ss_portal_reviewed', 'true');
    } catch (e) {}

    setTimeout(() => {
      setIsSubmitted(false);
      setRating(null);
      setShowCommentBox(false);
      setCommentText('');
      onClose();
      if (onCompleteAction) {
        onCompleteAction();
      }
    }, 1300);
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    submitAndClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#ffffff] border border-[#e5dec9] shadow-2xl rounded-2xl overflow-hidden p-6 text-[#1a1a1a] animate-in fade-in zoom-in duration-200">
        
        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#eae4d5] text-[#777063] transition-colors cursor-pointer"
          aria-label="Close review"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          /* THANK YOU SUCCESS STATE */
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#1a1a1a]">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-[#666052] max-w-xs mx-auto">
              Your review helps us continuously improve in-store wayfinding and shopping at Shoppers Stop.
            </p>
          </div>
        ) : (
          /* REVIEW FORM STATE */
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#122B52]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#122B52]">
                {badgeText}
              </span>
            </div>

            {/* Question Header */}
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">
                {title}
              </h3>
              <p className="text-xs text-[#666052] mt-1">
                {subtitle}
              </p>
            </div>

            {/* Thumbs Up / Down Reaction Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSelectRating('UP')}
                className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2.5 font-bold text-xs transition-all cursor-pointer shadow-2xs ${
                  rating === 'UP'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-600/30'
                    : 'bg-[#faf8f5] border-[#e8e2d5] text-[#3a352c] hover:bg-[#f5f0e3] hover:border-[#c5a059]'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${rating === 'UP' ? 'text-emerald-600' : 'text-[#122B52]'}`} />
                <span>Yes, Helpful</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRating('DOWN')}
                className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2.5 font-bold text-xs transition-all cursor-pointer shadow-2xs ${
                  rating === 'DOWN'
                    ? 'bg-rose-50 border-[#122B52] text-[#122B52] ring-2 ring-[#122B52]/30'
                    : 'bg-[#faf8f5] border-[#e8e2d5] text-[#3a352c] hover:bg-[#f5f0e3] hover:border-[#c5a059]'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${rating === 'DOWN' ? 'text-[#122B52]' : 'text-[#777063]'}`} />
                <span>Needs Improvement</span>
              </button>
            </div>

            {/* Toggle Comment Textbox Button */}
            {!showCommentBox ? (
              <button
                type="button"
                onClick={() => setShowCommentBox(true)}
                className="w-full text-center py-2 text-xs text-[#122B52] hover:underline font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Give additional details or corrections</span>
              </button>
            ) : (
              /* Expanded Text Area & Submit Form */
              <form onSubmit={handleSubmitText} className="space-y-3 pt-2 animate-fade-in">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add comments, rack corrections, or shopping suggestions..."
                  className="w-full p-3 bg-[#faf8f5] border border-[#d8d2c4] rounded-xl text-xs text-[#1a1a1a] placeholder:text-[#a39c8e] focus:outline-none focus:border-[#122B52] focus:ring-1 focus:ring-[#122B52] leading-relaxed resize-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCommentBox(false)}
                    className="px-3 py-2 text-xs text-[#666052] hover:text-[#1a1a1a] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#122B52] hover:bg-[#0B2038] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </form>
            )}

            {/* Footer note */}
            <div className="pt-2 border-t border-[#f0ebd9] flex items-center justify-between text-[10px] text-[#888172]">
              <span>Shoppers Stop Customer Voice</span>
              <button onClick={onClose} className="hover:underline text-[#122B52] font-semibold cursor-pointer">
                Skip & Continue
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
