import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import useOnboardingDemo from '../hooks/useOnboardingDemo'

function OnboardingPage() {
  const demo = useOnboardingDemo()
  const steps = [
    { title: 'What is your English level?', options: demo.levels, select: demo.setLevel, multi: false },
    { title: 'Choose your target exam', options: demo.exams, select: demo.setExam, multi: false },
    { title: 'Pick your learning goals', options: demo.goalOptions, select: demo.toggleGoal, multi: true, selected: demo.goals },
    { title: 'Favorite topics', options: demo.topicOptions, select: demo.toggleTopic, multi: true, selected: demo.topics },
  ]
  const current = steps[demo.step] ?? steps[0]

  return (
    <AuthLayout>
      <header className="center-header compact">
        <span className="chip">Step {Math.min(demo.step + 1, 4)} of 4</span>
        <h1>Personalize your learning</h1>
        <ProgressBar value={demo.step + 1} max={4} />
      </header>

      <Card className="onboarding-card">
        <h2>{current.title}</h2>
        <div className="option-grid">
          {current.options.map((option) => {
            const selected = current.selected?.includes(option)
            return (
              <button key={option} className={selected ? 'option-card selected' : 'option-card'} onClick={() => current.select(option)} type="button">
                <strong>{option}</strong>
                <small>{current.multi ? 'Tap to toggle' : 'Tap to choose'}</small>
              </button>
            )
          })}
        </div>
      </Card>

      <div className="action-row">
        <Button variant="ghost" onClick={demo.step === 0 ? demo.skip : demo.back}>{demo.step === 0 ? 'Skip' : 'Back'}</Button>
        <Button onClick={demo.step === 3 ? demo.finish : demo.next}>{demo.step === 3 ? 'Finish' : 'Next'}</Button>
      </div>
    </AuthLayout>
  )
}

export default OnboardingPage
