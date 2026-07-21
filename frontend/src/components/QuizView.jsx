import React, { useState } from "react";
import "/src/QuizView.css";

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
      // NOTE: Update this URL if your backend is running on a different port/route
      const response = await fetch("http://127.0.0.1:8000/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: activeFile, // Tells backend which document to use
          difficulty: difficulty, // Easy, Medium, or Hard
          randomizer: Math.floor(Math.random() * 10000), // Forces fresh questions every time
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Assuming your backend returns the array of 5 questions directly
      setQuestions(data);
      setStep("quiz");
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert("Error generating questions. Is your backend running?");
      setStep("setup"); // Kick them back to the start button if it fails
    }
  };

  // 2. Handle user selecting an answer
  const handleAnswer = () => {
    // If you are comparing strings from the backend instead of index numbers,
    // you might need to change this logic to: if (questions[currentIndex].options[selectedOption] === questions[currentIndex].correctAnswer)
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
    <div className="quiz-wrapper">
      {/* Keeping your glassmorphism video background style */}
      <video autoPlay loop muted playsInline className="quiz-background-video">
        <source
          src="/background/12823215_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>

      <div className="quiz-glass-container">
        <header className="quiz-header">
          <div>
            <div className="header__eyebrow">
              <span className="header__dot"></span>
              Testing on {activeFile}
            </div>
            <h1 className="header__title">Knowledge Assessment</h1>
          </div>
          <button className="back-btn" onClick={onBack}>
            Return to Chat
          </button>
        </header>

        <main className="quiz-content">
          {/* STEP 1: SETUP */}
          {step === "setup" && (
            <div className="setup-panel">
              <h2>Select Difficulty</h2>
              <div className="difficulty-options">
                {["Easy", "Medium", "Hard"].map((lvl) => (
                  <button
                    key={lvl}
                    className={`diff-btn ${difficulty === lvl ? "active" : ""}`}
                    onClick={() => setDifficulty(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <button className="start-btn" onClick={generateQuiz}>
                Generate Questions
              </button>
            </div>
          )}

          {/* STEP 2: LOADING */}
          {step === "loading" && (
            <div className="loading-panel">
              <div className="spinner"></div>
              <p>Analyzing document and generating {difficulty} questions...</p>
            </div>
          )}

          {/* STEP 3: QUIZ ACTIVE */}
          {step === "quiz" && questions.length > 0 && (
            <div className="active-quiz-panel">
              <div className="progress-indicator">
                Question {currentIndex + 1} of {questions.length}
              </div>
              <h2 className="question-text">
                {questions[currentIndex].question}
              </h2>
              <div className="options-grid">
                {questions[currentIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`option-btn ${selectedOption === idx ? "selected" : ""}`}
                    onClick={() => setSelectedOption(idx)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                className="next-btn"
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
            <div className="results-panel">
              <h2>Assessment Complete!</h2>
              <div className="score-display">
                <span className="score-number">{score}</span>
                <span className="score-total">/ {questions.length}</span>
              </div>
              <p className="score-message">
                {score === questions.length
                  ? "Perfect score! You mastered this document."
                  : "Good effort! Review the document and try again."}
              </p>
              <button className="retry-btn" onClick={handleRetry}>
                Take Another Test
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
