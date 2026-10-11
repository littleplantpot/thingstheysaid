
import { useState } from 'react'
import { supabase } from './supabaseClient'


function Login({ onLogin, onPrivacyPolicy }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [confirmedTerms, setConfirmedTerms] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setMessage('Please choose a username or pseudonym.')
          return
        }

        if (!confirmedTerms) {
          setMessage(
            'Please read and accept the privacy and contribution rules before creating an account.'
          )
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        })

        if (error) {
          setMessage(error.message)
        } else if (data.session) {
          onLogin(data.user)
        } else {
          setMessage(
            'Account created. Please check your email for a confirmation message before signing in.'
          )
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })

        if (error) {
          setMessage(error.message)
        } else {
          onLogin(data.user)
        }
      }
    } catch {
      setMessage(
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setMessage('')
    setUsername('')
    setConfirmedTerms(false)
  }

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address first.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/?reset=true`,
          }
        )

      if (error) {
        setMessage(
          `Password reset failed: ${error.message}`
        )
      } else {
        setMessage(
          'If an account exists for that email, a password reset email has been sent.'
        )
      }
    } catch {
      setMessage(
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.accentBar}></div>

        <p style={styles.kicker}>
          PGCE COHORT KEEPSAKE
        </p>

        <h1 style={styles.title}>
          {isSignUp
            ? 'Join the keepsake.'
            : 'Welcome back.'}
        </h1>

        <p style={styles.intro}>
          {isSignUp
            ? 'Create an account to add your own stories to our shared keepsake.'
            : 'Sign in to access your cohort keepsake.'}
        </p>

        {isSignUp && (
          <div style={styles.privateNotice}>
            <div style={styles.privateTitle}>
              🔒 Your account and privacy
            </div>

            <p style={styles.privateText}>
              Choose a username or pseudonym that does not
              identify you. Use a personal email address that
              you can access to create and manage your account.
              Your email address is used for account purposes
              and is not intended to be displayed alongside
              your contributions to other users.
            </p>

            <p style={styles.privateText}>
              The website uses Supabase to manage accounts
              and store website data. The back end stores
              your email address, username in your account
              information, and an account identifier.
              Supabase may also process authentication
              records, timestamps and technical information
              needed to operate and secure the service.
              Contributions may be linked to your account
              internally, even when you use a pseudonym.
            </p>

            <p style={styles.privateText}>
              <strong>
                STRICT CONTRIBUTION RULE:
              </strong>{' '}
              Do not submit anything that identifies, or
              could help someone identify, you, another
              person, a child or pupil, a parent, colleague,
              school, placement, training provider or any
              other organisation.
            </p>

            <p style={styles.privateText}>
              This rule applies even when details seem vague,
              indirect or harmless on their own. Combinations
              of details can identify someone. Do not include
              names, initials, identifiable quotations,
              distinctive incidents, dates, locations or
              combinations of contextual details that could
              reveal someone's identity. If in doubt, leave
              it out.
            </p>

            <p style={styles.privateText}>
              Contributions may not be checked before other
              users can see them. Breaches may result in
              contributions being removed or deleted, an
              account being suspended or banned, and
              potential escalation where appropriate.
            </p>

            <p style={styles.privateText}>
              This is an independent, voluntary keepsake.
              It is not an official training-provider
              platform, formal safeguarding reporting route
              or disciplinary service. Contributors are
              responsible for what they submit. The
              administrator does not undertake to investigate
              every contribution or act on behalf of the
              training provider. This does not remove any
              legal obligations that may apply to the
              website administrator.
            </p>

            <p style={styles.privateText}>
              The administrator can access account
              information held in the back end. Information
              may also be processed by Supabase and retained
              in technical records or backups. The website
              does not promise complete anonymity or
              absolute security.
            </p>

            
<p style={styles.privateText}>
  Please read the{" "}
  <button
    type="button"
    onClick={onPrivacyPolicy}
    style={{
      background: "none",
      border: "none",
      padding: 0,
      color: "#1746d1",
      textDecoration: "underline",
      cursor: "pointer",
      font: "inherit",
    }}
  >
    Privacy Policy
  </button>{" "}
  before registering. It explains how information
  is used, stored, retained and how to contact the
  administrator about your personal data.
</p>

          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          {isSignUp && (
            <label style={styles.label}>
              Username or pseudonym

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
                minLength={2}
                maxLength={30}
                autoComplete="nickname"
                style={styles.input}
                placeholder="Choose a username"
              />

              <span style={styles.helperText}>
                Do not use your real name, school, placement
                or any other identifying information.
              </span>
            </label>
          )}

          <label style={styles.label}>
            Personal email address

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              style={styles.input}
              placeholder="your@email.com"
            />

            <span style={styles.helperText}>
              Use an email address you can access for
              account confirmation and password recovery.
            </span>
          </label>

          <label style={styles.label}>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={6}
              autoComplete={
                isSignUp
                  ? 'new-password'
                  : 'current-password'
              }
              style={styles.input}
              placeholder="At least 6 characters"
            />
          </label>

          {!isSignUp && (
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={loading}
              style={styles.resetButton}
            >
              Forgot your password?
            </button>
          )}

          {isSignUp && (
            <div style={styles.termsBox}>
              <p style={styles.termsHeading}>
                Required agreement
              </p>

              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={confirmedTerms}
                  onChange={(event) =>
                    setConfirmedTerms(event.target.checked)
                  }
                  required
                  style={styles.checkbox}
                />

                <span>
                  I confirm that I have read and agree to
                  the Privacy Policy and the sign-up and
                  contribution rules above. I will not
                  submit content that identifies or could
                  help identify any person, child, school,
                  placement, training provider or
                  organisation, even indirectly. I
                  understand that breaches may result in
                  content removal, account suspension or
                  a ban, and potential escalation where
                  appropriate.
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.primaryButton,
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading
              ? 'Please wait…'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        {message && (
          <p
            role="status"
            style={styles.message}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={switchMode}
          style={styles.switchButton}
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : 'Need an account? Create one'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#fff4d8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },

  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '520px',
    background: '#ffffff',
    padding: '46px',
    boxSizing: 'border-box',
    border: '3px solid #101a35',
    borderRadius: '12px',
    boxShadow: '10px 10px 0 #1746d1',
  },

  accentBar: {
    position: 'absolute',
    top: '-3px',
    left: '28px',
    right: '28px',
    height: '8px',
    background: '#f04438',
    borderRadius: '0 0 5px 5px',
  },

  kicker: {
    margin: '0 0 12px',
    fontSize: '11px',
    letterSpacing: '3px',
    fontWeight: '900',
    color: '#e83e8c',
  },

  title: {
    margin: '0 0 16px',
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '42px',
    lineHeight: '1',
    fontWeight: 'normal',
    color: '#101a35',
  },

  intro: {
    margin: '0',
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#28304d',
  },

  privateNotice: {
    marginTop: '26px',
    marginBottom: '26px',
    padding: '19px 20px',
    background: '#fff4d8',
    border: '2px solid #101a35',
    borderLeft: '8px solid #f2c230',
    borderRadius: '8px',
  },

  privateTitle: {
    marginBottom: '10px',
    fontSize: '16px',
    fontWeight: '900',
    color: '#101a35',
  },

  privateText: {
    margin: '8px 0 0',
    fontSize: '13px',
    lineHeight: '1.55',
    color: '#28304d',
  },

  form: {
    marginTop: '30px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '900',
    color: '#101a35',
    marginBottom: '19px',
  },

  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '7px',
    padding: '13px 14px',
    border: '2px solid #101a35',
    borderRadius: '6px',
    background: '#fff',
    color: '#101a35',
    fontSize: '15px',
    outline: 'none',
  },

  helperText: {
    display: 'block',
    marginTop: '6px',
    fontSize: '11px',
    fontWeight: 'normal',
    color: '#5b6075',
    lineHeight: '1.5',
  },

  termsBox: {
    margin: '8px 0 20px',
    padding: '14px',
    border: '2px solid #101a35',
    borderRadius: '7px',
    background: '#ffffff',
  },

  termsHeading: {
    margin: '0 0 10px',
    fontSize: '13px',
    fontWeight: '900',
    color: '#101a35',
  },

  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    margin: '0',
    fontSize: '12px',
    lineHeight: '1.6',
    color: '#28304d',
    cursor: 'pointer',
  },

  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    flexShrink: 0,
    accentColor: '#1746d1',
    cursor: 'pointer',
  },

  resetButton: {
    display: 'block',
    marginTop: '-10px',
    marginBottom: '19px',
    marginLeft: 'auto',
    padding: '0',
    border: 'none',
    background: 'transparent',
    color: '#1746d1',
    cursor: 'pointer',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    fontWeight: '900',
    textDecoration: 'underline',
  },

  primaryButton: {
    width: '100%',
    marginTop: '4px',
    background: '#1746d1',
    color: '#ffffff',
    border: '2px solid #101a35',
    borderRadius: '7px',
    padding: '15px 22px',
    cursor: 'pointer',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '14px',
    fontWeight: '900',
  },

  message: {
    marginTop: '20px',
    padding: '13px',
    background: '#f04438',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: '1.5',
  },

  switchButton: {
    display: 'block',
    margin: '24px auto 0',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: '#1746d1',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '13px',
    fontWeight: '700',
  },
}

export default Login
