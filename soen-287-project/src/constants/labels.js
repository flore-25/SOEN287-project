/**
 * UI copy and labels - avoid hardcoded text in components.
 * Easier to change later (i18n, config, backend-driven).
 */
export const APP_NAME = 'SOEN287 Project'

export const NAV = {
  LOGIN: 'Log In',
  SIGN_UP: 'Sign Up',
  LOG_OUT: 'Log out',
  MY_ACCOUNT: 'My Account',
}

export const DASHBOARD = {
  TITLE: 'My courses',
  ADD_COURSE: 'Add course',
  INSTRUCTOR_LABEL: 'Instructor',
  TERM_LABEL: 'Term',
}

export const COURSE_MENU = {
  EDIT: 'Edit',
  REMOVE: 'Remove',
}

export const LOGIN = {
  GREETING: 'Hello!',
  EMAIL_PLACEHOLDER: 'Email Address',
  PASSWORD_PLACEHOLDER: 'Password',
  SUBMIT: 'Log in',
}

export const MY_ACCOUNT = {
  PAGE_TITLE: 'My Account',
  EDIT: 'edit',
  NAME: 'Name',
  EMAIL: 'Email address',
  PASSWORD: 'Password',
  PASSWORD_MASKED: '***********',
  ACCOUNT_TYPE: 'Account type',
  TYPE_STUDENT: 'Student',
  TYPE_INSTRUCTOR: 'Instructor',
  SAVE_CHANGES: 'Save Change',
  CANCEL: 'Cancel',
  CHANGE_PASSWORD: 'Change password',
  DELETE_ACCOUNT: 'Delete account',
  DELETE_WARNING: 'This cannot be undone. All courses you teach and related data will be removed.',
  MODAL_PASSWORD_CURRENT: 'Current password',
  MODAL_PASSWORD_NEW: 'New password',
  MODAL_PASSWORD_CONFIRM: 'Confirm new password',
  MODAL_DELETE_CONFIRM: 'Type your password to confirm deletion',
  SUBMIT_PASSWORD: 'Update password',
  CONFIRM_DELETE: 'Delete my account',
  CLOSE: 'Close',
  SAVED: 'Your profile was updated.',
  PASSWORD_UPDATED: 'Password updated.',
  MISMATCH: 'New passwords do not match.',
}

export const SIGN_UP = {
  GREETING: 'Hello!',
  EMAIL_PLACEHOLDER: 'Email Address',
  PASSWORD_PLACEHOLDER: 'Password',
  SUBMIT: 'Sign up',
  NAME: 'John Doe',
  ACCOUNT_TYPE: 'Account type',
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
}


export const COURSE_FORM = {
  COURSE_ID: 'Course ID',
  ADD_TITLE: 'Add course',
  EDIT_TITLE: 'Edit course',
  CODE_LABEL: 'Course code',
  CODE_PLACEHOLDER: 'e.g. SOEN 287',
  INSTRUCTOR_LABEL: 'Instructor',
  INSTRUCTOR_PLACEHOLDER: 'e.g. John Doe',
  TERM_LABEL: 'Term',
  TERM_PLACEHOLDER: 'e.g. WINTER 2026',
  ID_PLACEHOLDER: 'e.g. d5j3d3',
  SAVE: 'Save',
  CANCEL: 'Cancel',
}

/** Assignment categories for course assessments */
export const ASSIGNMENT_CATEGORIES = ['quiz', 'lab', 'exam', 'assignment']

/** Assignment status (student view) */
export const ASSIGNMENT_STATUS = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
}

export const COURSE_DETAIL = {
  GRADE: 'Grade',
  EARNED_SO_FAR: 'earned so far',
  ASSESSMENTS: 'Assessments',
  ASSESSMENT: 'Assessment',
  DUE_DATE: 'Due date',
  CATEGORIE: 'Category',
  GRADE_LABEL: 'Grade',
  WEIGHT: 'Weight',
  STATUS: 'Status',
  ADD_ASSIGNMENT: 'Add assignment',
  REMOVE_SELECTED: 'Remove selected',
}
