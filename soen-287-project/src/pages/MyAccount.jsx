import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES, MY_ACCOUNT } from '../constants'
import './MyAccount.css'

function roleLabel(role) {
  const r = role === 1 || role === '1' ? 1 : 0
  return r === 1 ? MY_ACCOUNT.TYPE_INSTRUCTOR : MY_ACCOUNT.TYPE_STUDENT
}

async function parseJsonResponse(res) {
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Invalid response from server')
  }
  if (!res.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export default function MyAccount() {
  const navigate = useNavigate()
  const { user, isLoggedIn, loading, replaceUser } = useAuth()
  const [editingProfile, setEditingProfile] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [deletePwd, setDeletePwd] = useState('')
  const [modalError, setModalError] = useState('')
  const [modalBusy, setModalBusy] = useState(false)

  useEffect(() => {
    document.body.classList.remove('landing-page')
    document.body.classList.add('dashboard-page')
    return () => {
      document.body.classList.remove('dashboard-page')
    }
  }, [])

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [isLoggedIn, loading, navigate])

  useEffect(() => {
    if (user) {
      setDraftName(user.name ?? '')
      setDraftEmail(user.email ?? '')
    }
  }, [user])

  const startEdit = useCallback(() => {
    if (user) {
      setDraftName(user.name ?? '')
      setDraftEmail(user.email ?? '')
    }
    setEditingProfile(true)
  }, [user])

  const cancelEdit = useCallback(() => {
    if (user) {
      setDraftName(user.name ?? '')
      setDraftEmail(user.email ?? '')
    }
    setEditingProfile(false)
  }, [user])

  const saveProfile = useCallback(() => {
    setSavingProfile(true)
    fetch('/api/account/profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: draftName, email: draftEmail }),
    })
      .then(parseJsonResponse)
      .then((data) => {
        if (data.user) replaceUser(data.user)
        setEditingProfile(false)
        alert(MY_ACCOUNT.SAVED)
      })
      .catch((e) => alert(e.message))
      .finally(() => setSavingProfile(false))
  }, [draftName, draftEmail, replaceUser])

  const closePasswordModal = useCallback(() => {
    setPasswordModalOpen(false)
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    setModalError('')
  }, [])

  const submitPassword = useCallback(() => {
    setModalError('')
    if (newPwd !== confirmPwd) {
      setModalError(MY_ACCOUNT.MISMATCH)
      return
    }
    setModalBusy(true)
    fetch('/api/account/password', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
    })
      .then(parseJsonResponse)
      .then(() => {
        closePasswordModal()
        alert(MY_ACCOUNT.PASSWORD_UPDATED)
      })
      .catch((e) => setModalError(e.message))
      .finally(() => setModalBusy(false))
  }, [currentPwd, newPwd, confirmPwd, closePasswordModal])

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false)
    setDeletePwd('')
    setModalError('')
  }, [])

  const submitDelete = useCallback(() => {
    setModalError('')
    setModalBusy(true)
    fetch('/api/account/delete', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: deletePwd }),
    })
      .then(parseJsonResponse)
      .then((data) => {
        replaceUser(null)
        navigate(data.redirect || ROUTES.LOGIN, { replace: true })
      })
      .catch((e) => setModalError(e.message))
      .finally(() => setModalBusy(false))
  }, [deletePwd, navigate, replaceUser])

  if (loading || !isLoggedIn || !user) return null

  return (
    <div className="my-account">
      <main className="my-account__main">
        <h1 className="my-account__title">{MY_ACCOUNT.PAGE_TITLE}</h1>

        <div className="my-account__card">
          <div className="my-account__card-top">
            {!editingProfile ? (
              <button type="button" className="my-account__edit" onClick={startEdit}>
                {MY_ACCOUNT.EDIT}
              </button>
            ) : (
              <span className="my-account__edit-spacer" />
            )}
          </div>

          <dl className="my-account__rows">
            <div className="my-account__row">
              <dt>{MY_ACCOUNT.NAME}</dt>
              <dd>
                {editingProfile ? (
                  <input
                    className="my-account__input"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    autoComplete="name"
                  />
                ) : (
                  user.name
                )}
              </dd>
            </div>
            <div className="my-account__row">
              <dt>{MY_ACCOUNT.EMAIL}</dt>
              <dd>
                {editingProfile ? (
                  <input
                    className="my-account__input"
                    type="email"
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    autoComplete="email"
                  />
                ) : (
                  user.email
                )}
              </dd>
            </div>
            <div className="my-account__row">
              <dt>{MY_ACCOUNT.PASSWORD}</dt>
              <dd className="my-account__row-password">
                <span className="my-account__masked">{MY_ACCOUNT.PASSWORD_MASKED}</span>
                <button
                  type="button"
                  className="my-account__linkish"
                  onClick={() => setPasswordModalOpen(true)}
                >
                  {MY_ACCOUNT.CHANGE_PASSWORD}
                </button>
              </dd>
            </div>
            <div className="my-account__row my-account__row--readonly">
              <dt>{MY_ACCOUNT.ACCOUNT_TYPE}</dt>
              <dd>{roleLabel(user.role)}</dd>
            </div>
          </dl>

          {editingProfile ? (
            <div className="my-account__actions">
              <button
                type="button"
                className="my-account__btn my-account__btn--primary"
                disabled={savingProfile}
                onClick={saveProfile}
              >
                {MY_ACCOUNT.SAVE_CHANGES}
              </button>
              <button type="button" className="my-account__btn my-account__btn--ghost" onClick={cancelEdit}>
                {MY_ACCOUNT.CANCEL}
              </button>
            </div>
          ) : null}

          {!editingProfile ? (
            <div className="my-account__danger-zone">
              <button type="button" className="my-account__delete-link" onClick={() => setDeleteModalOpen(true)}>
                {MY_ACCOUNT.DELETE_ACCOUNT}
              </button>
            </div>
          ) : null}
        </div>
      </main>

      {passwordModalOpen ? (
        <div className="my-account__modal-backdrop" role="presentation" onClick={closePasswordModal}>
          <div
            className="my-account__modal"
            role="dialog"
            aria-labelledby="pwd-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="pwd-modal-title" className="my-account__modal-title">
              {MY_ACCOUNT.CHANGE_PASSWORD}
            </h2>
            <label className="my-account__modal-label">
              {MY_ACCOUNT.MODAL_PASSWORD_CURRENT}
              <input
                type="password"
                className="my-account__input my-account__input--block"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label className="my-account__modal-label">
              {MY_ACCOUNT.MODAL_PASSWORD_NEW}
              <input
                type="password"
                className="my-account__input my-account__input--block"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="my-account__modal-label">
              {MY_ACCOUNT.MODAL_PASSWORD_CONFIRM}
              <input
                type="password"
                className="my-account__input my-account__input--block"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            {modalError ? <p className="my-account__modal-error">{modalError}</p> : null}
            <div className="my-account__modal-actions">
              <button
                type="button"
                className="my-account__btn my-account__btn--primary"
                disabled={modalBusy}
                onClick={submitPassword}
              >
                {MY_ACCOUNT.SUBMIT_PASSWORD}
              </button>
              <button type="button" className="my-account__btn my-account__btn--ghost" onClick={closePasswordModal}>
                {MY_ACCOUNT.CLOSE}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModalOpen ? (
        <div className="my-account__modal-backdrop" role="presentation" onClick={closeDeleteModal}>
          <div
            className="my-account__modal"
            role="dialog"
            aria-labelledby="del-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="del-modal-title" className="my-account__modal-title">
              {MY_ACCOUNT.DELETE_ACCOUNT}
            </h2>
            <p className="my-account__modal-warn">{MY_ACCOUNT.DELETE_WARNING}</p>
            <label className="my-account__modal-label">
              {MY_ACCOUNT.MODAL_DELETE_CONFIRM}
              <input
                type="password"
                className="my-account__input my-account__input--block"
                value={deletePwd}
                onChange={(e) => setDeletePwd(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {modalError ? <p className="my-account__modal-error">{modalError}</p> : null}
            <div className="my-account__modal-actions">
              <button
                type="button"
                className="my-account__btn my-account__btn--danger"
                disabled={modalBusy}
                onClick={submitDelete}
              >
                {MY_ACCOUNT.CONFIRM_DELETE}
              </button>
              <button type="button" className="my-account__btn my-account__btn--ghost" onClick={closeDeleteModal}>
                {MY_ACCOUNT.CLOSE}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
