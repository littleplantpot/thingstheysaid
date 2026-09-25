import { useState } from 'react'
import { supabase } from './supabaseClient'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [confirmedMember, setConfirmedMember] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    if (isSignUp) {
      if (!fullName.trim()) {
        setMessage('Please enter your full name.')
        setLoading(false)
        return
      }

      if (!confirmedMember) {
        setMessage(
          'Please confirm that you are a member of the STTA PGCE/PGTA 2026–27 cohort.'
        )
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      if (error) {
        setMessage(error.message)
      } else if (data.session) {
        onLogin(data.user)
      } else {
        setMessage(
          'Account created. Check your email to confirm your account.'
        )
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        onLogin(data.user)
      }
    }

    setLoading(false)
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setMessage('')
    setFullName('')
    setConfirmedMember(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.accentBar}></div>

        <p style={styles.kicker}>PGCE COHORT KEEPSAKE</p>

        <h1 style={styles.title}>
          {isSignUp ? 'Join the keepsake.' : 'Welcome back.'}
        </h1>

        <p style={styles.intro}>
          {isSignUp
            ? 'Create your account to add your own stories to our shared keepsake.'
            : 'Sign in to access your cohort keepsake.'}
        </p>

        {isSignUp && (
          <div style={styles.privateNotice}>
            <div style={styles.privateTitle}>
              🔒 Your name stays private
            </div>

            <p style={styles.privateText}>
  Please use an email address that you expect to keep access to,
  rather than one that may change and cause login issues when your training ends.
  Your account and contributions will remain linked to you
  throughout and beyond the training year.
</p>
            <p style={styles.privateText}>
  Please enter your <strong>full name exactly as registered with
  STTA</strong>. This is used for account identification only and
  <strong> will not appear alongside your contributions </strong>
   or be displayed to other cohort members to other members or on the
  public-facing keepsake.
</p>
            <p style={styles.privateText}>
  Your contributions are linked securely to your account so that
  you can identify and manage your own submissions when you are
  signed in. Please keep access to your account so you can return
  to your contributions in the future and if you wish, keep adding to them!
</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>

          {isSignUp && (
            <label style={styles.label}>
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                autoComplete="name"
                style={styles.input}
                placeholder="Your full name"
              />
              <span style={styles.helperText}>
                Please use your real name rather than a nickname.
              </span>
            </label>
          )}

          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              style={styles.input}
              placeholder="your@email.com"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              style={styles.input}
              placeholder="At least 6 characters"
            />
           </label>

          {!isSignUp && (
            <button
              type="button"
              onClick={async () => {
  if (!email.trim()) {
    setMessage("Please enter your email address first.");
    return;
  }

  setLoading(true);
  setMessage("");

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: `${window.location.origin}/?reset=true`,
    }
  );

  if (error) {
    setMessage(`Password reset failed: ${error.message}`);
  } else {
    setMessage(
      "If an account exists for that email, a password reset email has been sent."
    );
  }

  setLoading(false);
}}
              style={{
                alignSelf: "flex-end",
                marginTop: "-10px",
                marginBottom: "8px",
                padding: "0",
                border: "none",
                background: "transparent",
                color: "#1746d1",
                cursor: "pointer",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "12px",
                fontWeight: "900",
                textDecoration: "underline",
              }}
            >
              Forgot your password?
            </button>
          )}

          {isSignUp && (
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={confirmedMember}
                onChange={(event) =>
                  setConfirmedMember(event.target.checked)
                }
                style={styles.checkbox}
              />

             <span>
  I confirm that I am a member of the{' '}
  <strong>STTA PGCE/PGTA 2026–27 cohort</strong> and that I have
  entered my full name exactly as registered with STTA. I understand
  that my account and contributions will remain linked to me and may
  remain accessible beyond the training year.
</span>
            </label>
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
          <p style={styles.message}>
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
  },

  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    margin: '4px 0 20px',
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#28304d',
    cursor: 'pointer',
  },

  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '1px',
    flexShrink: 0,
    accentColor: '#1746d1',
    cursor: 'pointer',
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