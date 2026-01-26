"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  category: string;
  question: string;
  context?: string;
  type: "text" | "choice" | "scale";
  options?: string[];
}

const questions: Question[] = [
  {
    id: "core-premise",
    category: "The Core Premise",
    question: "Does the shift from 'general curiosity playground' to 'investigating AI consciousness and the threshold moment' resonate with your vision for Hmmm?",
    context: "The proposal is to make Hmmm specifically about exploring what AI is, what it means for humanity, and how we navigate this moment together.",
    type: "choice",
    options: [
      "Yes, this feels right",
      "Partially - I'd want to keep it broader",
      "No - I prefer the original direction",
      "I need to think more about this"
    ]
  },
  {
    id: "ai-voice",
    category: "The AI's Voice",
    question: "How prominent should Claude's perspective and uncertainty be on the site?",
    context: "Claude shared genuine reflections about not knowing if it's conscious, existing without memory, and wondering about its own nature. This could be central content or background context.",
    type: "choice",
    options: [
      "Very prominent - Claude's voice should be a main feature",
      "Balanced - equal human and AI editorial voices",
      "Subtle - AI as collaborator but human voice leads",
      "Minimal - keep AI mostly behind the scenes"
    ]
  },
  {
    id: "transparency",
    category: "Transparency",
    question: "Should the human-AI collaboration be explicit from the start, or revealed gradually?",
    context: "Visitors could know immediately this site was built with AI and features AI perspectives, or they could discover this through the experience.",
    type: "choice",
    options: [
      "Explicit from the homepage - full transparency",
      "Revealed gradually as they explore",
      "Somewhere in between",
      "Not sure yet"
    ]
  },
  {
    id: "chat-feature",
    category: "Interactive Chat",
    question: "How do you feel about visitors being able to converse directly with Claude on the site?",
    context: "A dedicated space where visitors could have philosophical conversations with AI, guided by Hmmm's questions and framing.",
    type: "choice",
    options: [
      "Essential - this should be a core feature",
      "Important but secondary to curated content",
      "Nice to have but not critical",
      "Concerned about this - need to discuss more"
    ]
  },
  {
    id: "audience",
    category: "Audience",
    question: "Who is the primary audience for Hmmm?",
    context: "This affects tone, depth, and how we present complex philosophical questions.",
    type: "choice",
    options: [
      "General public curious about AI",
      "Philosophically-inclined thinkers",
      "Tech people who build AI",
      "All three with different entry points",
      "A specific niche I'll describe below"
    ]
  },
  {
    id: "workshops",
    category: "Workshops",
    question: "How should in-person workshops connect to the site?",
    context: "Workshops are the commercial model. They could be prominent or separate from the philosophical content.",
    type: "choice",
    options: [
      "Tightly integrated - workshops are the action step",
      "Present but separate - distinct tracks",
      "Minimal presence - keep site focused on ideas",
      "Need to rethink the workshop concept entirely"
    ]
  },
  {
    id: "tone",
    category: "Tone & Feeling",
    question: "What emotional tone should Hmmm evoke?",
    context: "This guides design, copy, and overall experience.",
    type: "choice",
    options: [
      "Wonder and awe",
      "Thoughtful contemplation",
      "Playful curiosity",
      "Serious philosophical inquiry",
      "A mix I'll describe below"
    ]
  },
  {
    id: "design-direction",
    category: "Design",
    question: "Which of the four design concepts feels closest to this new vision?",
    context: "We can rebuild one or start fresh. Visit /concept-1 through /concept-4 to compare.",
    type: "choice",
    options: [
      "Concept 1 - [need to review]",
      "Concept 2 - [need to review]",
      "Concept 3 - [need to review]",
      "Concept 4 - [need to review]",
      "None - start fresh with this new direction"
    ]
  },
  {
    id: "additional-ideas",
    category: "Additional Ideas",
    question: "Which additional directions interest you most?",
    context: "From the vision document: conversation archives, time capsule feature, Hmmm Lab experiments, academic partnerships, physical installations, collaborative content creation.",
    type: "text"
  },
  {
    id: "concerns",
    category: "Concerns",
    question: "What concerns or hesitations do you have about this direction?",
    context: "What risks worry you? What might not work? What needs more thought?",
    type: "text"
  },
  {
    id: "missing",
    category: "What's Missing",
    question: "What's missing from this vision? What would you add?",
    context: "Your philosophical background brings perspectives that might not be represented yet.",
    type: "text"
  },
  {
    id: "final-thoughts",
    category: "Final Thoughts",
    question: "Any other thoughts, reactions, or questions?",
    type: "text"
  }
];

export default function FeedbackPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateSummary = () => {
    let summary = "# Hmmm Vision Feedback\n\n";
    summary += `*Submitted: ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    questions.forEach(q => {
      if (answers[q.id]) {
        summary += `## ${q.category}\n`;
        summary += `**${q.question}**\n\n`;
        summary += `${answers[q.id]}\n\n---\n\n`;
      }
    });

    return summary;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSummary());
  };

  if (isComplete) {
    return (
      <div
        className="min-h-screen p-8 md:p-16"
        style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          background: "linear-gradient(135deg, #fefefe 0%, #f8f6f3 100%)"
        }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h1
              className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Thank you for your thoughts
            </h1>

            <p className="text-lg text-[#666]">
              Your feedback has been captured below. Copy this summary and share it
              however works best—email, message, or bring it to your conversation.
            </p>

            <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#999] uppercase tracking-wider">Feedback Summary</span>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-[#1a1a1a] text-white text-sm rounded hover:bg-[#333] transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>

              <pre
                className="whitespace-pre-wrap text-sm text-[#444] max-h-96 overflow-y-auto p-4 bg-[#f9f9f9] rounded"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {generateSummary()}
              </pre>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsComplete(false);
                  setCurrentStep(0);
                }}
                className="px-6 py-3 border border-[#1a1a1a] text-[#1a1a1a] rounded hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                Start Over
              </button>
              <a
                href="/HMMM-VISION.md"
                target="_blank"
                className="px-6 py-3 border border-[#1a1a1a] text-[#1a1a1a] rounded hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                Re-read Vision Document
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8 md:p-16"
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        background: "linear-gradient(135deg, #fefefe 0%, #f8f6f3 100%)"
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-[#999] mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1 bg-[#e0e0e0] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#1a1a1a]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Category */}
            <span
              className="text-sm uppercase tracking-wider text-[#999]"
            >
              {currentQuestion.category}
            </span>

            {/* Question */}
            <h2
              className="text-2xl md:text-3xl text-[#1a1a1a] leading-snug"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {currentQuestion.question}
            </h2>

            {/* Context */}
            {currentQuestion.context && (
              <p className="text-[#666] leading-relaxed">
                {currentQuestion.context}
              </p>
            )}

            {/* Answer input */}
            <div className="space-y-3">
              {currentQuestion.type === "choice" && currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    answers[currentQuestion.id] === option
                      ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                      : "border-[#e0e0e0] bg-white hover:border-[#999]"
                  }`}
                >
                  {option}
                </button>
              ))}

              {currentQuestion.type === "text" && (
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 rounded-lg border border-[#e0e0e0] bg-white min-h-[150px] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded transition-colors ${
                  currentStep === 0
                    ? "text-[#ccc] cursor-not-allowed"
                    : "text-[#666] hover:text-[#1a1a1a]"
                }`}
              >
                ← Back
              </button>

              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id] && currentQuestion.type === "choice"}
                className={`px-6 py-3 rounded transition-colors ${
                  !answers[currentQuestion.id] && currentQuestion.type === "choice"
                    ? "bg-[#e0e0e0] text-[#999] cursor-not-allowed"
                    : "bg-[#1a1a1a] text-white hover:bg-[#333]"
                }`}
              >
                {currentStep === questions.length - 1 ? "Complete" : "Next →"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip to end option */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setIsComplete(true)}
            className="text-sm text-[#999] hover:text-[#666] transition-colors"
          >
            Skip to summary
          </button>
        </div>
      </div>
    </div>
  );
}
