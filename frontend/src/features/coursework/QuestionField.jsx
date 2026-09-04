import { useId } from 'react'
import { Textarea } from '../../components/Textarea/Textarea'
import styles from './QuestionField.module.css'

const TRUE_FALSE_CHOICES = [
  { id: 'true', text: 'True' },
  { id: 'false', text: 'False' },
]

/**
 * Renders one assessment question in a student-safe way (no correct answer is
 * present in the payload). Supports single/multiple choice, true/false, and
 * short text.
 */
export function QuestionField({ index, question, value, onChange }) {
  const groupId = useId()
  const type = question.type || 'single_choice'
  const choices =
    type === 'true_false' ? TRUE_FALSE_CHOICES : question.choices ?? []

  const prompt = (
    <legend className={styles.prompt}>
      <span className={styles.index}>{index}.</span> {question.text || question.prompt}
    </legend>
  )

  if (type === 'short_text' || type === 'text') {
    return (
      <fieldset className={styles.fieldset}>
        {prompt}
        <Textarea
          label=""
          aria-label={`Answer to question ${index}`}
          rows={3}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </fieldset>
    )
  }

  const multiple = type === 'multiple_choice'
  const selected = multiple ? value ?? [] : value

  const toggle = (choiceId) => {
    if (!multiple) {
      onChange(choiceId)
      return
    }
    const set = new Set(selected)
    if (set.has(choiceId)) set.delete(choiceId)
    else set.add(choiceId)
    onChange([...set])
  }

  return (
    <fieldset className={styles.fieldset}>
      {prompt}
      <div className={styles.choices}>
        {choices.map((choice) => {
          const checked = multiple
            ? selected.includes(choice.id)
            : selected === choice.id
          return (
            <label key={choice.id} className={styles.choice}>
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={multiple ? `${groupId}-${choice.id}` : groupId}
                className={styles.input}
                checked={checked}
                onChange={() => toggle(choice.id)}
              />
              <span>{choice.text || choice.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
