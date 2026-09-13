import React, { useState } from "react";

export default function QuizView({ activeFile, onBack }) {
  const [step, setStep] = useState("setup");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const generateQuiz = async () => {
    setStep("loading");
    try {
      const response = await fetch("http://127.0.0.1:8000/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: activeFile,
          difficulty: difficulty,
          randomizer: Math.floor(Math.random() * 10000),
        }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setQuestions(data);
      setStep("quiz");
    } catch (error) {
      alert("Error generating questions. Is your backend running?");
      setStep("setup");
    }
  };

  const handleAnswer = () => {
    if (selectedOption === questions[currentIndex].correctAnswer)
      setScore(score + 1);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setStep("results");
    }
  };

  const handleRetry = () => {
    setStep("setup");
    setScore(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setQuestions([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full z-10">
      <div className="w-full max-w-3xl bg-[#070b0d]/90 backdrop-blur-2xl border border-[#376E6F]/50 rounded-3xl p-8 md:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.6)]">
        <header className="flex justify-between items-start mb-10 pb-6 border-b border-[#1C3334]">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#376E6F] uppercase flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#376E6F] shadow-[0_0_10px_rgba(55,110,111,0.8)] animate-pulse"></span>
              Testing on {activeFile}
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Knowledge Assessment
            </h1>
          </div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-[#1C3334] hover:bg-[#376E6F] text-white text-sm font-bold rounded-xl border border-[#376E6F]/50 transition-all duration-300 shadow-[0_0_15px_rgba(55,110,111,0.2)] hover:shadow-[0_0_20px_rgba(55,110,111,0.5)]"
          >
            Return to Chat
          </button>
        </header>

        <main className="w-full">
          {step === "setup" && (
            <div className="flex flex-col items-center text-center py-6">
              <h2 className="text-2xl font-bold text-white mb-8">
                Select Difficulty
              </h2>
              <div className="flex flex-wrap justify-center gap-5 mb-12">
                {["Easy", "Medium", "Hard"].map((lvl) => (
                  <button
                    key={lvl}
                    className={`px-8 py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 ${
                      difficulty === lvl
                        ? "bg-[#DA7B93] text-white shadow-[0_0_25px_rgba(218,123,147,0.5)] scale-105"
                        : "bg-[#1C3334] text-[#8fa9a9] hover:bg-[#2F4454] border border-[#376E6F]/30"
                    }`}
                    onClick={() => setDifficulty(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <button
                onClick={generateQuiz}
                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-[#376E6F] to-[#DA7B93] hover:from-[#DA7B93] hover:to-[#376E6F] text-white font-black text-lg tracking-wide rounded-xl transition-all duration-500 shadow-[0_0_30px_rgba(218,123,147,0.4)] hover:shadow-[0_0_40px_rgba(218,123,147,0.7)]"
              >
                Generate Questions
              </button>
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 border-4 border-[#1C3334] border-t-[#DA7B93] rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(218,123,147,0.4)]"></div>
              <p className="text-lg text-[#8fa9a9] font-medium tracking-wide">
                Analyzing document and generating{" "}
                <span className="text-[#DA7B93] font-bold">{difficulty}</span>{" "}
                questions...
              </p>
            </div>
          )}

          {step === "quiz" && questions.length > 0 && (
            <div className="flex flex-col">
              <div className="text-sm font-bold tracking-wider text-[#376E6F] uppercase mb-6 flex items-center justify-between">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[#DA7B93] bg-[#2E151B] px-3 py-1 rounded-lg border border-[#DA7B93]/30">
                  {difficulty} Level
                </span>
              </div>
              <h2 className="text-2xl text-white font-bold leading-relaxed mb-10">
                {questions[currentIndex].question}
              </h2>
              <div className="flex flex-col gap-4 mb-10">
                {questions[currentIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`p-5 text-left rounded-2xl border-2 transition-all duration-300 font-medium ${
                      selectedOption === idx
                        ? "bg-[#2E151B] border-[#DA7B93] text-white shadow-[0_0_20px_rgba(218,123,147,0.3)] scale-[1.02]"
                        : "bg-[#1C3334]/50 border-[#376E6F]/30 text-[#cbd5e1] hover:bg-[#1C3334] hover:border-[#376E6F]"
                    }`}
                    onClick={() => setSelectedOption(idx)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                disabled={selectedOption === null}
                onClick={handleAnswer}
                className="w-full py-4 bg-gradient-to-r from-[#376E6F] to-[#DA7B93] hover:from-[#DA7B93] hover:to-[#376E6F] disabled:from-[#1C3334] disabled:to-[#1C3334] disabled:text-[#376E6F] disabled:shadow-none text-white font-bold text-lg rounded-xl transition-all duration-500 shadow-[0_0_25px_rgba(218,123,147,0.4)]"
              >
                {currentIndex + 1 === questions.length
                  ? "Finish Test"
                  : "Next Question"}
              </button>
            </div>
          )}

          {step === "results" && (
            <div className="flex flex-col items-center text-center py-10">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#376E6F] to-[#DA7B93] mb-10">
                Assessment Complete!
              </h2>
              <div className="w-40 h-40 rounded-full border-8 border-[#DA7B93] flex items-center justify-center mb-10 bg-[#2E151B] shadow-[0_0_50px_rgba(218,123,147,0.5)] relative">
                <div className="absolute inset-0 rounded-full border-4 border-[#376E6F] animate-[ping_3s_ease-in-out_infinite] opacity-30"></div>
                <div className="flex items-baseline">
                  <span className="text-6xl font-black text-white">
                    {score}
                  </span>
                  <span className="text-2xl font-bold text-[#8fa9a9] ml-2">
                    / {questions.length}
                  </span>
                </div>
              </div>
              <p className="text-xl text-[#cbd5e1] font-medium mb-12 max-w-md">
                {score === questions.length
                  ? "Perfect score! You mastered this document."
                  : "Good effort! Review the document and try again."}
              </p>
              <button
                onClick={handleRetry}
                className="px-10 py-4 bg-[#1C3334] hover:bg-[#376E6F] text-white font-bold text-lg rounded-xl border border-[#376E6F]/50 transition-all duration-300 shadow-[0_0_20px_rgba(55,110,111,0.3)] hover:shadow-[0_0_30px_rgba(55,110,111,0.6)]"
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
