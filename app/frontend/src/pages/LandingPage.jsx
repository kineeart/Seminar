const featureCards = [
  {
    title: 'AI Tutor Chat',
    description: 'Ask anything. Get short, useful answers.',
    icon: 'CHAT',
  },
  {
    title: 'Smart Flashcards',
    description: 'AI generates cards from your weak spots.',
    icon: 'CARD',
  },
  {
    title: 'Adaptive Quizzes',
    description: 'Practice for your real exam target.',
    icon: 'QUIZ',
  },
]

function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-app fade-in">
        <header className="landing-header">
          <span className="chip">AI English Learning</span>
          <h1>
            Learn English
            <br />
            the smart way.
          </h1>
          <p>
            Your personal AI tutor for TOEIC, IELTS, VSTEP - concise, practical, no fluff.
          </p>
        </header>

        <div className="landing-actions">
          <a className="btn" href="/login">
            Start Learning
          </a>
          <a className="btn ghost" href="/onboarding">
            Continue as Guest
          </a>
        </div>

        <section className="features">
          {featureCards.map((feature) => (
            <article key={feature.title} className="card-base row">
              <div className="feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <div>
                <h3>{feature.title}</h3>
                <p className="muted">{feature.description}</p>
              </div>
            </article>
          ))}
        </section>

        <footer className="landing-footer">
          <p className="muted">Made for TOEIC - IELTS - VSTEP learners</p>
        </footer>
      </div>
    </main>
  )
}

export default LandingPage
