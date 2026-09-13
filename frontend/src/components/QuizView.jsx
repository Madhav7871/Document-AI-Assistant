import React, { useState } from "react";

export default function QuizView({ activeFile, onBack }) {
  const [step, setStep] = useState("setup"); // 'setup', 'loading', 'quiz', 'results'
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  // 1. Trigger the backend to generate questions
  const generateQuiz = async () => {
    setStep("loading");

    try {
      const response = await fetch("http://127.0.0.1:8000/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: activeFile,
          difficulty: difficulty,
          randomizer: Math.floor(Math.random() * 10000),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuestions(data);
      setStep("quiz");
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert("Error generating questions. Is your backend running?");
      setStep("setup");
    }
  };

  // 2. Handle user selecting an answer
  const handleAnswer = () => {
    if (selectedOption === questions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setStep("results");
    }
  };

  // 3. Reset to start over
  const handleRetry = () => {
    setStep("setup");
    setScore(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setQuestions([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-10 shadow-2xl shadow-black/50">
        <header className="flex justify-between items-start mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono tracking-widest text-indigo-400 uppercase flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Testing on {activeFile}
            </div>
            <h1 className="text-2xl font-bold text-white">
              Knowledge Assessment
            </h1>
          </div>
          <button
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
            onClick={onBack}
          >
            Return to Chat
          </button>
        </header>

        <main className="w-full">
          {/* STEP 1: SETUP */}
          {step === "setup" && (
            <div className="flex flex-col items-center text-center py-4">
              <h2 className="text-xl font-semibold text-slate-200 mb-6">
                Select Difficulty
              </h2>
              <div className="flex gap-4 mb-10">
                {["Easy", "Medium", "Hard"].map((lvl) => (
                  <button
                    key={lvl}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                      difficulty === lvl
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    }`}
                    onClick={() => setDifficulty(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <button
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
                onClick={generateQuiz}
              >
                Generate Questions
              </button>
            </div>
          )}

          {/* STEP 2: LOADING */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-300">
                Analyzing document and generating{" "}
                <span className="text-indigo-400 font-medium">
                  {difficulty}
                </span>{" "}
                questions...
              </p>
            </div>
          )}

          {/* STEP 3: QUIZ ACTIVE */}
          {step === "quiz" && questions.length > 0 && (
            <div className="flex flex-col">
              <div className="text-sm font-medium text-slate-400 mb-4 flex items-center justify-between">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-indigo-400">{difficulty} Level</span>
              </div>
              <h2 className="text-xl text-white font-medium leading-relaxed mb-8">
                {questions[currentIndex].question}
              </h2>
              <div className="flex flex-col gap-3 mb-8">
                {questions[currentIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`p-4 text-left rounded-xl border transition-all ${
                      selectedOption === idx
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600"
                    }`}
                    onClick={() => setSelectedOption(idx)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                disabled={selectedOption === null}
                onClick={handleAnswer}
              >
                {currentIndex + 1 === questions.length
                  ? "Finish Test"
                  : "Next Question"}
              </button>
            </div>
          )}

          {/* STEP 4: RESULTS */}
          {step === "results" && (
            <div className="flex flex-col items-center text-center py-8">
              <h2 className="text-2xl font-bold text-white mb-8">
                Assessment Complete!
              </h2>
              <div className="w-32 h-32 rounded-full border-4 border-indigo-500 flex items-center justify-center mb-6 bg-indigo-900/20 shadow-lg shadow-indigo-900/20">
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">
                    {score}
                  </span>
                  <span className="text-xl text-slate-400 ml-1">
                    / {questions.length}
                  </span>
                </div>
              </div>
              <p className="text-lg text-slate-300 mb-8">
                {score === questions.length
                  ? "Perfect score! You mastered this document."
                  : "Good effort! Review the document and try again."}
              </p>
              <button
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors"
                onClick={handleRetry}
              >
                Take Another Test
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
