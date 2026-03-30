/**
 * Route paths - single source of truth for navigation.
 * Use with react-router Link and useNavigate for consistency and future backend alignment.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  COURSE_DETAIL: '/course/:courseId',
  courseDetail: (courseId) => `/course/${courseId}`,
  DEADLINES: '/deadlines',
  CHARTS: '/charts',
}
