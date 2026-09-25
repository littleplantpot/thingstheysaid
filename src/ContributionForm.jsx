import { useState } from 'react'
import { supabase } from './supabaseClient'

function ContributionForm({ user, onSaved }) {
  const [quote, setQuote] = useState('')
  const [context, setContext] = useState('')
  const [learnerType, setLearnerType] = useState('')
  const [yearGroup, setYearGroup] = useState('')
  const [ageBand, setAgeBand] = useState('')
  const [specificAge, setSpecificAge] = useState('')
  const [subjectArea, setSubjectArea] = useState('')
  const [subject, setSubject] = useState('')
  const [otherSubject, setOtherSubject] = useState('')
  const [dateSaid, setDateSaid] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const primarySubjects = [
    'English',
    'Maths',
    'Science',
    'History',
    'Geography',
    'Computing',
    'Art & Design',
    'Design & Technology',
    'Music',
    'PE',
    'RE / Religious Education',
    'PSHE / Personal Development',
    'Modern Foreign Languages',
    'Early Years / Foundation Stage',
    'Cross-curricular / General',
    'Other',
  ]

  const subjectGroups = {
    '📐 Mathematics & Statistics': [
      'Mathematics',
      'Further Mathematics',
      'Statistics',
      'Core Maths',
    ],

    '🧪 Sciences': [
      'Biology',
      'Chemistry',
      'Physics',
      'Environmental Science / Earth Sciences',
      'Marine Science',
      'Geology',
    ],

    '💻 Computing & Digital Technology': [
      'Computer Science',
      'ICT / Digital Technology',
      'Software Systems Development / Coding',
      'Cyber Security',
      'Creative Media Production / Moving Image Arts',
    ],

    '📚 English, Literacy & Communication': [
      'English Language',
      'English Literature',
      'Creative Writing',
      'Journalism / Media & Communications',
    ],

    '🌍 Humanities & Social Sciences': [
      'History',
      'Geography',
      'Politics / Government & Politics',
      'Sociology',
      'Psychology',
      'Philosophy',
      'Religious Studies / Theology & Ethics',
      'Criminology',
      'Anthropology',
    ],

    '💼 Business, Economics & Law': [
      'Business Studies / Management',
      'Economics',
      'Accounting / Financial Studies',
      'Law',
      'Professional Business Services',
      'Travel and Tourism',
    ],

    '🎨 Creative, Visual & Performing Arts': [
      'Fine Art',
      'Graphic Communication / Design',
      'Photography',
      'Textile Design',
      '3D Design / Architecture',
      'History of Art',
      'Drama and Theatre Studies',
      'Performing Arts',
      'Music',
      'Music Technology',
    ],

    '🛠️ Engineering, Manufacturing & Technical': [
      'Design and Technology',
      'Engineering Design / Mechanical Engineering',
      'Electronics',
      'Food Technology / Catering & Hospitality',
      'Construction and the Built Environment',
    ],

    '🗣️ Languages': [
      'French',
      'Spanish',
      'German',
      'Italian',
      'Russian',
      'Mandarin Chinese / Cantonese',
      'Japanese',
      'Arabic / Persian',
      'Urdu / Hindi / Panjabi / Gujarati / Tamil',
      'Modern Hebrew / Turkish',
      'Welsh / Irish / Scottish Gaelic',
      'Classical Civilisation',
      'Latin / Classical Greek',
    ],

    '🏃 Health, Sport & Care': [
      'Physical Education (PE) / Sports Science',
      'Health and Social Care',
      'Life and Health Sciences',
      'Nutrition and Food Science',
      'Child Development / Education & Early Years',
    ],

    '🧒 Education / General': [
      'PSHE / Personal Development',
      'Citizenship',
      'Cross-curricular / General',
    ],
  }

  const subjectAreas = Object.keys(subjectGroups)

  const primaryYears = [
    'Reception',
    'Year 1',
    'Year 2',
    'Year 3',
    'Year 4',
    'Year 5',
    'Year 6',
  ]

  const secondaryYears = [
    'Year 7',
    'Year 8',
    'Year 9',
    'Year 10',
    'Year 11',
    'Year 12',
    'Year 13',
  ]

  const ageBands = [
    '3–7',
    '8–11',
    '12–15',
    '16–18',
    '18–25',
    'Adult learner 25+',
    'Other / specific age',
  ]

  const handleLearnerTypeChange = (value) => {
    setLearnerType(value)
    setYearGroup('')
    setAgeBand('')
    setSpecificAge('')
    setSubjectArea('')
    setSubject('')
    setOtherSubject('')
  }

  const handleSubjectAreaChange = (value) => {
    setSubjectArea(value)
    setSubject('')
    setOtherSubject('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!learnerType) {
      setMessage('Please choose a learner type.')
      return
    }

    if (learnerType === 'age' && !ageBand) {
      setMessage('Please choose an age band.')
      return
    }

    if (
      learnerType === 'age' &&
      ageBand === 'Other / specific age' &&
      !specificAge
    ) {
      setMessage('Please enter the specific age.')
      return
    }

    if (subject === 'Other' && !otherSubject.trim()) {
      setMessage('Please tell us what the subject was.')
      return
    }

    setSaving(true)

    const finalSubject =
      subject === 'Other' ? otherSubject.trim() : subject

    const { error } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        quote: quote.trim(),
        context: context.trim(),
        learner_type: learnerType,
        year_group: yearGroup || null,
        age_band: ageBand || null,
        specific_age: specificAge
          ? Number(specificAge)
          : null,
        subject: finalSubject || null,
        date_said: dateSaid || null,
      })

    if (error) {
      console.error('Error saving contribution:', error)
      setMessage(error.message)
      setSaving(false)
      return
    }

    setQuote('')
    setContext('')
    setLearnerType('')
    setYearGroup('')
    setAgeBand('')
    setSpecificAge('')
    setSubjectArea('')
    setSubject('')
    setOtherSubject('')
    setDateSaid('')
   setMessage("Saved to the keepsake ✦ You can edit or delete this for 24 hours.");
    setSaving(false)

    setTimeout(() => {
      onSaved()
    }, 1800)
  }

  const showGroupedSubjects =
    learnerType === 'secondary' ||
    learnerType === 'send' ||
    learnerType === 'age'

  return (
    <section style={styles.content}>
      <p style={styles.eyebrow}>ADD TO THE KEEPSAKE</p>

      <h2 style={styles.heading}>Leave your mark.</h2>

      <p style={styles.intro}>
        Add something worth remembering from your teaching year.
      </p>

      <form onSubmit={handleSubmit} style={styles.card}>
        <label style={styles.label}>
          The quote *
          <textarea
            value={quote}
            onChange={(event) => setQuote(event.target.value)}
            required
            placeholder="What did they actually say?"
            style={styles.textarea}
          />
        </label>

        <label style={styles.label}>
          What was happening?
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="A little context makes the memory even better..."
            style={styles.textarea}
          />
        </label>

        <div style={styles.sectionTitle}>
          Who was it about?
        </div>

        <label style={styles.label}>
          Learner type *
          <select
            value={learnerType}
            onChange={(event) =>
              handleLearnerTypeChange(event.target.value)
            }
            required
            style={styles.input}
          >
            <option value="">Choose one...</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="send">SEND / Specialist</option>
            <option value="age">Let me just put the age in!</option>
          </select>
        </label>

        {(learnerType === 'primary' ||
          learnerType === 'secondary') && (
          <label style={styles.label}>
            Year group
            <select
              value={yearGroup}
              onChange={(event) =>
                setYearGroup(event.target.value)
              }
              style={styles.input}
            >
              <option value="">Not specified</option>

              {learnerType === 'primary' &&
                primaryYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}

              {learnerType === 'secondary' &&
                secondaryYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </label>
        )}

        {learnerType === 'age' && (
          <>
            <label style={styles.label}>
              Age band *
              <select
                value={ageBand}
                onChange={(event) => {
                  setAgeBand(event.target.value)

                  if (
                    event.target.value !==
                    'Other / specific age'
                  ) {
                    setSpecificAge('')
                  }
                }}
                required
                style={styles.input}
              >
                <option value="">Choose an age band...</option>

                {ageBands.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Exact age, if known
              <input
                type="number"
                min="3"
                max="100"
                value={specificAge}
                onChange={(event) =>
                  setSpecificAge(event.target.value)
                }
                placeholder="e.g. 17"
                style={styles.input}
              />
            </label>
          </>
        )}

        <div style={styles.subjectSection}>
          <div style={styles.subjectHeading}>
            Subject
          </div>

          {!showGroupedSubjects && (
            <label style={styles.label}>
              <select
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value)

                  if (event.target.value !== 'Other') {
                    setOtherSubject('')
                  }
                }}
                style={styles.input}
              >
                <option value="">Not specified</option>

                {primarySubjects.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          )}

          {showGroupedSubjects && (
            <>
              <label style={styles.label}>
                Subject area
                <select
                  value={subjectArea}
                  onChange={(event) =>
                    handleSubjectAreaChange(event.target.value)
                  }
                  style={styles.input}
                >
                  <option value="">Choose an area...</option>

                  {subjectAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}

                  <option value="Other">Other</option>
                </select>
              </label>

              {subjectArea &&
                subjectArea !== 'Other' && (
                  <label style={styles.label}>
                    Specific subject
                    <select
                      value={subject}
                      onChange={(event) =>
                        setSubject(event.target.value)
                      }
                      style={styles.input}
                    >
                      <option value="">
                        Choose a subject...
                      </option>

                      {subjectGroups[subjectArea].map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                )}

              {subjectArea === 'Other' && (
                <label style={styles.label}>
                  What subject?
                  <input
                    type="text"
                    value={otherSubject}
                    onChange={(event) =>
                      setOtherSubject(event.target.value)
                    }
                    placeholder="Tell us the subject..."
                    style={styles.input}
                  />
                </label>
              )}
            </>
          )}

          {learnerType === 'primary' &&
            subject === 'Other' && (
              <label style={styles.label}>
                What subject?
                <input
                  type="text"
                  value={otherSubject}
                  onChange={(event) =>
                    setOtherSubject(event.target.value)
                  }
                  placeholder="Tell us the subject..."
                  style={styles.input}
                />
              </label>
            )}
        </div>

        <label style={styles.label}>
          Date said
          <input
            type="date"
            value={dateSaid}
            onChange={(event) =>
              setDateSaid(event.target.value)
            }
            style={styles.input}
          />
        </label>

     {message && (
  <p style={styles.message}>{message}</p>
)}

<div style={styles.editWindowNotice}>
  <div style={styles.editWindowTitle}>
    ✦ 24-hour editing window
  </div>

  <div style={styles.editWindowText}>
    You can edit or delete your contribution for 24 hours
    after submitting it. After that, it becomes part of the
    permanent cohort archive.
  </div>
</div>

<button
  type="submit"
  disabled={saving}
  style={styles.primaryButton}
>
  {saving ? 'Saving…' : 'Save contribution ✦'}
</button>
      </form>
    </section>
  )
}

const styles = {
  content: {
    maxWidth: '800px',
    margin: '0 auto',
  },

  eyebrow: {
    margin: '0 0 14px',
    fontSize: '12px',
    letterSpacing: '2px',
    fontWeight: 'bold',
    color: '#8a5a3b',
  },

  heading: {
    margin: '0 0 15px',
    fontFamily: 'Georgia, serif',
    fontSize: '46px',
    fontWeight: 'normal',
    color: '#392c25',
  },

  intro: {
    margin: '0 0 30px',
    color: '#66564b',
    lineHeight: '1.6',
    fontSize: '17px',
  },

  card: {
    padding: '35px',
    background: '#f7f0df',
    border: '1px solid #d8c8a8',
    borderRadius: '14px',
    boxShadow: '0 8px 30px rgba(70, 50, 30, 0.08)',
  },

  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    marginBottom: '20px',
    fontWeight: 'bold',
    color: '#493b32',
  },

  sectionTitle: {
    margin: '30px 0 20px',
    paddingTop: '20px',
    borderTop: '1px solid #d8c8a8',
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    fontWeight: 'normal',
    color: '#392c25',
  },

  subjectSection: {
    marginTop: '10px',
    paddingTop: '20px',
    borderTop: '1px solid #d8c8a8',
  },

  subjectHeading: {
    marginBottom: '18px',
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    fontWeight: 'normal',
    color: '#392c25',
  },

  input: {
    padding: '12px 14px',
    border: '1px solid #cdbb9c',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    background: '#fffdf8',
    boxSizing: 'border-box',
  },

  textarea: {
    minHeight: '110px',
    padding: '12px 14px',
    border: '1px solid #cdbb9c',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    background: '#fffdf8',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  editWindowNotice: {
    marginBottom: '18px',
    padding: '14px 16px',
    background: '#fff4d8',
    border: '2px solid #101a35',
    borderLeft: '6px solid #f2c230',
    borderRadius: '7px',
  },

  editWindowTitle: {
    marginBottom: '5px',
    fontSize: '12px',
    fontWeight: '900',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#101a35',
  },

  editWindowText: {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#5b6075',
  },
  primaryButton: {
    padding: '14px 22px',
    border: 'none',
    borderRadius: '8px',
    background: '#6f3f32',
    color: '#fffaf0',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

 message: {
  margin: "0 0 20px",
  padding: "14px 16px",
  borderRadius: "8px",
  background: "#e7f4e8",
  border: "2px solid #159447",
  color: "#14532d",
  fontSize: "13px",
  fontWeight: "800",
  lineHeight: "1.5",
},
}

export default ContributionForm