import { useState, useEffect } from 'react'
import { COURSE_FORM } from '../constants'
import '../styles/courseForm.css'

const emptyCourse = { course_id: '' }

/**
 * Single form for both add and edit. initialCourse null = add; object = edit.
 */
export default function CourseFormStudent({ initialCourse, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialCourse ? { ...initialCourse } : { ...emptyCourse })

  useEffect(() => {
    setForm(initialCourse ? { ...initialCourse } : { ...emptyCourse })
  }, [initialCourse])

  const isEdit = !!initialCourse?.id
  const title = isEdit ? COURSE_FORM.EDIT_TITLE : COURSE_FORM.ADD_TITLE

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.course_id?.trim()) return
    const payload = {
      course_id: form.course_id.trim(),
    }
    if (initialCourse?.id) payload.id = initialCourse.id
    onSubmit(payload)
  }

  return (
    <div className="course-form-backdrop" role="dialog" aria-modal="true" aria-labelledby="course-form-title">
      <div className="course-form">
        <h2 id="course-form-title" className="course-form__title">
          {title}
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="course-form__label">
            {COURSE_FORM.COURSE_ID}
            <input
              type="text"
              value={form.course_id ?? ''}
              onChange={handleChange('course_id')}
              placeholder={COURSE_FORM.ID_PLACEHOLDER}
              required
              className="course-form__input"
            />
          </label>
          <div className="course-form__actions">
            <button type="button" className="course-form__btn course-form__btn--secondary" onClick={onCancel}>
              {COURSE_FORM.CANCEL}
            </button>
            <button type="submit" className="course-form__btn course-form__btn--primary">
              {COURSE_FORM.SAVE}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
