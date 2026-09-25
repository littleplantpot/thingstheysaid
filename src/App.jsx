import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import ContributionForm from "./ContributionForm";
import SafeguardingNotice from "./SafeguardingNotice";

const classroomQuotes = [
  "Miss, I wasn't talking. I was just telling him what you said.",
  "But why do we need to know this? I'm not going to be a Roman.",
  "Sir, technically I'm not late. I'm early for tomorrow.",
  "I know the answer, but I don't know how to explain it.",
  "Miss, you said there were no stupid questions.",
  "I didn't lose my homework. I just don't know where it is.",
  "Are we doing actual work today?",
  "Miss, can I go to the toilet? It's an emergency.",
  "I wasn't asleep. I was just resting my eyes.",
  "Can we do something fun instead?",
  "Miss, that's not fair. You didn't tell us we'd have to think.",
  "I finished it. I just haven't written it down yet.",
];

const primarySubjects = [
  "English",
  "Maths",
  "Science",
  "History",
  "Geography",
  "Computing",
  "Art & Design",
  "Music",
  "PE",
  "Languages",
  "RE",
  "PSHE",
  "Design & Technology",
  "Other",
];

const subjectGroups = {
  "English & Languages": [
    "English",
    "English Literature",
    "English Language",
    "French",
    "Spanish",
    "Other Language",
  ],
  "Mathematics & Computing": [
    "Maths",
    "Further Maths",
    "Computing",
    "Computer Science",
  ],
  Science: [
    "Biology",
    "Chemistry",
    "Physics",
    "General Science",
  ],
  Humanities: [
    "History",
    "Geography",
    "Religious Education",
    "Citizenship",
  ],
  "Creative & Performing Arts": [
    "Art & Design",
    "Music",
    "Drama",
    "Dance",
    "Design & Technology",
  ],
  "Physical & Personal Development": [
    "PE",
    "PSHE",
    "Health & Wellbeing",
  ],
  Other: ["Other"],
};

const primaryYears = [
  "Reception",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];

const secondaryYears = [
  "Year 7",
  "Year 8",
  "Year 9",
  "Year 10",
  "Year 11",
  "Year 12",
  "Year 13",
];

const ageBands = [
  "Early years",
  "Primary age",
  "Secondary age",
  "Post-16",
  "Adult learner",
  "Mixed ages",
];

function findSubjectArea(subject) {
  for (const [area, subjects] of Object.entries(subjectGroups)) {
    if (subjects.includes(subject)) return area;
  }

  return "";
}

function App() {
  const [view, setView] = useState(
  () => localStorage.getItem("pgce-keepsake-view") || "home"
);
useEffect(() => {
  localStorage.setItem("pgce-keepsake-view", view);
}, [view]);
  const [user, setUser] = useState(null);
  const [isResettingPassword, setIsResettingPassword] = useState(
  () => new URLSearchParams(window.location.search).get("reset") === "true"
);
  const [quotes, setQuotes] = useState([]);
  const [hasMoreQuotes, setHasMoreQuotes] = useState(true);
  const [classroomQuote] = useState(
    () =>
      classroomQuotes[
        Math.floor(Math.random() * classroomQuotes.length)
      ]
  );

  const [editingQuote, setEditingQuote] = useState(() => {
  const saved = localStorage.getItem("pgce-keepsake-editing-quote");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
});
useEffect(() => {
  if (editingQuote) {
    localStorage.setItem(
      "pgce-keepsake-editing-quote",
      JSON.stringify(editingQuote)
    );
  } else {
    localStorage.removeItem("pgce-keepsake-editing-quote");
  }
}, [editingQuote]);
  const [message, setMessage] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showAbout, setShowAbout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [safeguardingAccepted, setSafeguardingAccepted] =
    useState(false);

  // Browse filters
  const [searchTerm, setSearchTerm] = useState("");
  const [learnerFilter, setLearnerFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [showMineOnly, setShowMineOnly] = useState(false);

  // Memory Stream
  const [memoryStart, setMemoryStart] = useState(0);
  const [memoryPaused, setMemoryPaused] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadQuotes = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(0, 23);

      if (error) {
        setMessage(error.message);
        return;
      }

      const loadedQuotes = data ?? [];

      setQuotes(loadedQuotes);
      setHasMoreQuotes(loadedQuotes.length === 24);
    };

    loadQuotes();
  }, [user]);

  const loadMoreQuotes = async () => {
    if (!hasMoreQuotes) return;

    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(quotes.length, quotes.length + 23);

    if (error) {
      setMessage(error.message);
      return;
    }

    const newQuotes = data ?? [];

    setQuotes((current) => [...current, ...newQuotes]);
    setHasMoreQuotes(newQuotes.length === 24);
  };

  const openEditor = (quote) => {
    setEditingQuote(quote);
    setMessage("");
    setView("edit");
  };

  const canModifyQuote = (quote) => {
    if (!user || quote.user_id !== user.id) {
      return false;
    }

    if (!quote.created_at) {
      return false;
    }

    const createdAt = new Date(quote.created_at).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return Date.now() - createdAt < twentyFourHours;
  };

  const getEditTimeRemaining = (quote) => {
    if (!quote?.created_at) {
      return null;
    }

    const createdAt = new Date(quote.created_at).getTime();
    const remaining =
      24 * 60 * 60 * 1000 - (Date.now() - createdAt);

    if (remaining <= 0) {
      return null;
    }

    const hours = Math.floor(
      remaining / (60 * 60 * 1000)
    );

    const minutes = Math.floor(
      (remaining % (60 * 60 * 1000)) / (60 * 1000)
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${Math.max(1, minutes)}m`;
  };
                         const deleteQuote = async (quote) => {
  if (!canModifyQuote(quote)) {
    setMessage(
      "This contribution can no longer be edited or deleted because 24 hours have passed."
    );
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this contribution?"
  );

  if (!confirmed) {
    return;
  }

  setSaving(true);
  setMessage("Deleting…");

const { data, error } = await supabase
  .from("quotes")
  .delete()
  .eq("id", quote.id)
  .eq("user_id", user.id)
  .select();

console.log("DELETE RESULT:", { data, error });

if (error) {
    setMessage(`Delete failed: ${error.message}`);
    setSaving(false);
    return;
  }

    // Remove the deleted contribution from the screen immediately.
  setQuotes((current) =>
    current.filter((item) => item.id !== quote.id)
  );

  // If the deleted contribution was open in the Memory Stream,
  // close it too.
  setSelectedMemory((current) =>
    current?.id === quote.id ? null : current
  );

  // Clear any editing state.
  setEditingQuote(null);

  // Return to Browse.
  setView("browse");

  // Tell the user what happened.
  setMessage("Your contribution has been deleted.");

  setSaving(false);

  setEditingQuote(null);
  setView("browse");
  setMessage("Your contribution has been deleted.");

  setSaving(false);
}; 
                                      const handleUpdate = async (event) => {
                                        event.preventDefault();

                                        if (!editingQuote) return;

                                        setSaving(true);
                                        setMessage("");

    const form = new FormData(event.currentTarget);

    const learnerType = form.get("learner_type");
    const yearGroup = form.get("year_group") || null;
    const ageBand = form.get("age_band") || null;

    const specificAge = form.get("specific_age")
      ? Number(form.get("specific_age"))
      : null;

    const subjectArea = form.get("subject_area");
    const selectedSubject = form.get("subject");

    const otherSubject =
      subjectArea === "Other"
        ? form.get("other_subject")
        : null;

    const finalSubject =
      subjectArea === "Other"
        ? otherSubject
        : selectedSubject;

    const { data, error } = await supabase
      .from("quotes")
      .update({
        quote: form.get("quote"),
        context: form.get("context"),
        learner_type: learnerType,
        year_group: yearGroup,
        age_band: ageBand,
        specific_age: specificAge,
        subject: finalSubject,
        date_said: form.get("date_said") || null,
      })
      .eq("id", editingQuote.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      setMessage(error.message);
    } else {
      setQuotes((current) =>
        current.map((item) =>
          item.id === data.id ? data : item
        )
      );

      setEditingQuote(null);
      setMessage("");
      setView("browse");
    }

    setSaving(false);
  };
const changeEmail = async () => {
  const { error } = await supabase.auth.updateUser(
    {
      email: "little.plant.pot@gmail.com",
    },
    {
      emailRedirectTo: `${window.location.origin}/`,
    }
  );

  if (error) {
    alert(`Email change failed: ${error.message}`);
    return;
  }

  alert(
    "Email change requested. Check both email inboxes for the confirmation messages."
  );
};
  const signOut = async () => {
  await supabase.auth.signOut();

  localStorage.removeItem("pgce-keepsake-view");
  localStorage.removeItem("pgce-keepsake-editing-quote");

  setUser(null);
  setView("home");
  setQuotes([]);
  setEditingQuote(null);
};

  const beginContribution = () => {
    setSafeguardingAccepted(false);
    setView("safeguarding");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLearnerFilter("");
    setYearFilter("");
    setSubjectFilter("");
    setAgeFilter("");
    setShowMineOnly(false);
  };

  // Automatically move through the Memory Stream.
  useEffect(() => {
    if (memoryPaused || quotes.length <= 3) return;

    const timer = setInterval(() => {
      setMemoryStart((current) => {
        const maxStart = Math.max(0, quotes.length - 3);

        if (current >= maxStart) {
          return 0;
        }

        return current + 1;
      });
    }, 7000);

    return () => clearInterval(timer);
  }, [memoryPaused, quotes.length]);

  const memoryQuotes = useMemo(() => {
    if (!quotes.length) return [];

    const visible = [];

    for (let i = 0; i < Math.min(3, quotes.length); i++) {
      const index =
        (memoryStart + i) % quotes.length;

      visible.push(quotes[index]);
    }

    return visible;
  }, [quotes, memoryStart]);

  const moveMemory = (direction) => {
    if (quotes.length <= 3) return;

    setMemoryStart((current) => {
      const maxStart = Math.max(0, quotes.length - 3);

      if (direction === "next") {
        return current >= maxStart ? 0 : current + 1;
      }

      return current <= 0 ? maxStart : current - 1;
    });
  };

  const filteredQuotes = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return quotes.filter((item) => {
      if (showMineOnly && item.user_id !== user?.id) {
        return false;
      }

      if (
        learnerFilter &&
        item.learner_type !== learnerFilter
      ) {
        return false;
      }

      if (
        yearFilter &&
        item.year_group !== yearFilter
      ) {
        return false;
      }

      if (
        subjectFilter &&
        item.subject !== subjectFilter
      ) {
        return false;
      }

      if (
        ageFilter &&
        item.age_band !== ageFilter
      ) {
        return false;
      }

      if (search) {
        const searchable = [
          item.quote,
          item.context,
          item.subject,
          item.learner_type,
          item.year_group,
          item.age_band,
          item.specific_age,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [
    quotes,
    searchTerm,
    learnerFilter,
    yearFilter,
    subjectFilter,
    ageFilter,
    showMineOnly,
    user,
  ]);

  const availableYears =
    learnerFilter === "Primary"
      ? primaryYears
      : learnerFilter === "Secondary"
        ? secondaryYears
        : [...primaryYears, ...secondaryYears];

  const availableSubjects =
    learnerFilter === "Primary"
      ? primarySubjects
      : Object.values(subjectGroups)
          .flat()
          .filter(
            (subject, index, array) =>
              array.indexOf(subject) === index
          );
          if (isResettingPassword) {
  return (
    <ResetPasswordForm
      onComplete={() => {
        window.history.replaceState({}, "", "/");
        setIsResettingPassword(false);
      }}
    />
  );
}

if (!user) {
  return (
    <Login
      onLogin={(loggedInUser) =>
        setUser(loggedInUser)
      }
    />
  );
}

  if (!user) {
    return (
      <Login
        onLogin={(loggedInUser) =>
          setUser(loggedInUser)
        }
      />
    );
  }

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <div style={styles.headerInner}>

          <button
            type="button"
            onClick={() => setView("home")}
            style={styles.brandButton}
          >
            <div style={styles.brandMark}>✦</div>

            <div>
              <div style={styles.brandTop}>
                TEACHER TRAINING
              </div>

              <div style={styles.brandBottom}>
                COHORT 2026–27
              </div>
            </div>
          </button>

          <nav style={styles.nav}>

            <button
              type="button"
              onClick={() => setView("home")}
              style={styles.navButton}
            >
              Home
            </button>

            <button
              type="button"
              onClick={beginContribution}
              style={{
                ...styles.navButton,
                background: "#1746d1",
                color: "#fff4d8",
                border: "2px solid #101a35",
                boxShadow: "4px 4px 0 #f2c230",
                fontWeight: "900",
                padding: "11px 18px",
              }}
            >
              ✦ Add a contribution
            </button>

            <button
  type="button"
  onClick={() => setView("browse")}
  style={styles.navButton}
>
  Browse
</button>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "4px",
  }}
>
  <span
    style={{
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "10px",
      fontWeight: "900",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#101a35",
      marginRight: "2px",
    }}
  >
    Account
  </span>

  <button
    type="button"
    onClick={changeEmail}
    style={{
      padding: "7px 10px",
      background: "#f4d35e",
      color: "#101a35",
      border: "2px solid #101a35",
      boxShadow: "2px 2px 0 #e27038",
      cursor: "pointer",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "10px",
      fontWeight: "900",
      textTransform: "uppercase",
    }}
  >
    Change email
  </button>

  <button
    type="button"
    onClick={signOut}
    style={{
      padding: "7px 10px",
      background: "#fff4d8",
      color: "#101a35",
      border: "2px solid #101a35",
      cursor: "pointer",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "10px",
      fontWeight: "900",
      textTransform: "uppercase",
    }}
  >
    Sign out
  </button>
</div>
          </nav>

        </div>
      </header>

      <main>

        {view === "home" && (
          <section style={styles.hero}>

            <div style={styles.heroInner}>

              <div style={styles.heroCopy}>

                <div style={styles.heroKicker}>
                  TEACHER TRAINING · 2026–27
                </div>

                <h1 style={styles.heroTitle}>
                  The things
                  <br />
                  <em>we'll remember.</em>
                </h1>

                <p style={styles.heroIntro}>
                  A shared collection of the tiny moments,
                  brilliant observations, unexpected chaos and
                  things our learners said that we know we'll
                  still be talking about years from now.
                </p>

                <div style={styles.tagRow}>

                  <span
                    style={{
                      ...styles.tag,
                      background: "#1746d1",
                    }}
                  >
                    PRIMARY
                  </span>

                  <span
                    style={{
                      ...styles.tag,
                      background: "#f04438",
                    }}
                  >
                    SECONDARY
                  </span>

                  <span
                    style={{
                      ...styles.tag,
                      background: "#159447",
                    }}
                  >
                    SEND
                  </span>

                  <span
                    style={{
                      ...styles.tag,
                      background: "#e83e8c",
                    }}
                  >
                    BEYOND
                  </span>

                </div>

                <div style={styles.heroButtons}>

                  <button
                    type="button"
                    onClick={beginContribution}
                    style={styles.primaryButton}
                  >
                    ✦ Add your story
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("browse")}
                    style={styles.secondaryButton}
                  >
                    Explore the keepsake →
                  </button>

                </div>

                <div style={styles.credit}>
                  Sheffield Teacher Training Association ·
                  National Institute of Teaching
                </div>

              </div>

              <EditorialIllustration />

            </div>

            <div style={styles.heroBottomStrip}>
              <span>TEACH</span>
              <span>NOTICE</span>
              <span>REMEMBER</span>
              <span>SHARE</span>
            </div>

          </section>
        )}

        {view === "safeguarding" && (
          <SafeguardingNotice
            onContinue={() => {
              setSafeguardingAccepted(true);
              setView("contribute");
            }}
            onCancel={() => {
              setView("home");
            }}
          />
        )}

        {view === "contribute" && safeguardingAccepted && (
          <section style={styles.contentSection}>

            <div style={styles.sectionHeader}>

              <div>
                <div style={styles.sectionKicker}>
                  ADD TO THE KEEPSAKE
                </div>

                <h2 style={styles.sectionTitle}>
                  What happened?
                </h2>

                <p style={styles.sectionIntro}>
                  Capture the moment while you still remember
                  exactly why it made you laugh, think or stop
                  in your tracks.
                </p>
              </div>

              <div style={styles.sectionNumber}>
                01
              </div>

            </div>

            <div style={styles.formShell}>
              <ContributionForm
                user={user}
                onSaved={(newQuote) => {
                  setQuotes((current) => [
                    newQuote,
                    ...current,
                  ]);

                  setView("browse");
                  setSafeguardingAccepted(false);
                }}
              />
            </div>

          </section>
        )}

        {view === "browse" && (
          <section style={styles.contentSection}>
                      {message && (
              <div
                style={{
                  maxWidth: "700px",
                  margin: "0 auto 25px",
                  padding: "14px 18px",
                  background: "#159447",
                  color: "#fff",
                  border: "3px solid #101a35",
                  borderRadius: "7px",
                  fontWeight: "900",
                  fontSize: "13px",
                  boxShadow: "5px 5px 0 #101a35",
                }}
              >
                ✓ {message}
              </div>
            )}

            <div style={styles.sectionHeader}>

              <div>
                <div style={styles.sectionKicker}>
                  THE KEEPSAKE
                </div>

                <h2 style={styles.sectionTitle}>
                  What we've shared.
                </h2>

                <p style={styles.sectionIntro}>
                  The moments that made it out of placement,
                  survived the lesson plan and earned their place
                  here.
                </p>
              </div>

            </div>

            {quotes.length > 0 && (
              <section
                style={styles.memoryStream}
                onMouseEnter={() =>
                  setMemoryPaused(true)
                }
                onMouseLeave={() =>
                  setMemoryPaused(false)
                }
              >

                <div style={styles.memoryStreamHeader}>

                  <div>
                    <div style={styles.memoryStreamKicker}>
                      ✦ FROM THE ARCHIVE
                    </div>

                    <h3 style={styles.memoryStreamTitle}>
                      A few things worth remembering.
                    </h3>
                  </div>

                  <div style={styles.memoryControls}>

                    <button
                      type="button"
                      onClick={() =>
                        moveMemory("previous")
                      }
                      style={styles.memoryControlButton}
                      aria-label="Previous memories"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveMemory("next")
                      }
                      style={styles.memoryControlButton}
                      aria-label="Next memories"
                    >
                      →
                    </button>

                  </div>

                </div>

                <div style={styles.memoryStreamTrack}>

                  {memoryQuotes.map((item, index) => {

                    const colours = [
                      "#1746d1",
                      "#f04438",
                      "#159447",
                      "#e83e8c",
                      "#542b63",
                      "#087ea4",
                    ];

                    const colour =
                      colours[
                        (memoryStart + index) %
                          colours.length
                      ];

                    const rotations = [
                      "-1deg",
                      "1deg",
                      "-0.5deg",
                      "1.2deg",
                      "-1.2deg",
                      "0.5deg",
                    ];

                    const rotation =
                      rotations[
                        (memoryStart + index) %
                          rotations.length
                      ];

                    return (
                      <article
                        key={`${item.id}-${memoryStart}-${index}`}
                        onClick={() =>
                          setSelectedMemory(item)
                        }
                        style={{
                          ...styles.memoryCard,
                          borderTop:
                            `7px solid ${colour}`,
                          transform:
                            `rotate(${rotation})`,
                        }}
                      >

                        <div style={styles.memoryMeta}>
                          {item.learner_type ||
                            "LEARNER"}

                          {item.year_group
                            ? ` · ${item.year_group}`
                            : ""}

                          {item.age_band
                            ? ` · ${item.age_band}`
                            : ""}
                        </div>

                        <div style={styles.memoryQuote}>
                          “{item.quote}”
                        </div>

                        {item.context && (
                          <div style={styles.memoryContext}>
                            {item.context}
                          </div>
                        )}

                        {item.subject && (
                          <span
                            style={styles.memorySubject}
                          >
                            {item.subject}
                          </span>
                        )}

                      </article>
                    );
                  })}

                </div>

                <div style={styles.memoryStreamFooter}>
                  <span>
                    {quotes.length} memories
                  </span>
                </div>

              </section>
            )}

            {quotes.length > 0 && (
              <div
                style={{
                  width: "100%",
                  marginBottom: "24px",
                }}
              >

                <div
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    marginBottom: "20px",
                    padding: "24px 28px",
                    background: "#101a35",
                    border: "3px solid #101a35",
                    borderRadius: "10px",
                    boxShadow: "7px 7px 0 #e83e8c",
                  }}
                >

                  <div
                    style={{
                      color: "#f2c230",
                      fontSize: "10px",
                      fontWeight: "900",
                      letterSpacing: "0.16em",
                      marginBottom: "8px",
                    }}
                  >
                    ✦ THINGS WE'VE HEARD IN THE CLASSROOM
                  </div>

                  <div
                    style={{
                      maxWidth: "900px",
                      fontFamily: "Georgia, serif",
                      fontSize:
                        "clamp(20px, 3vw, 30px)",
                      lineHeight: "1.25",
                      color: "#fff4d8",
                    }}
                  >
                    “{classroomQuote}”
                  </div>

                </div>

                <div style={styles.filterArea}>

                  <div style={styles.searchRow}>

                    <div style={styles.searchBox}>

                      <span style={styles.searchIcon}>
                        ⌕
                      </span>

                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) =>
                          setSearchTerm(
                            event.target.value
                          )
                        }
                        placeholder="Search words, subjects, experiences..."
                        style={styles.searchInput}
                      />

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowMineOnly(
                          !showMineOnly
                        )
                      }
                      style={{
                        ...styles.mineButton,
                        ...(showMineOnly
                          ? styles.mineButtonActive
                          : {}),
                      }}
                    >
                      {showMineOnly
                        ? "✓ My contributions"
                        : "My contributions"}
                    </button>

                  </div>

                  <div style={styles.filterRow}>

                    <div style={styles.filterField}>

                      <label style={styles.filterLabel}>
                        Learner
                      </label>

                      <select
                        value={learnerFilter}
                        onChange={(event) => {
                          setLearnerFilter(
                            event.target.value
                          );
                          setYearFilter("");
                          setSubjectFilter("");
                        }}
                        style={styles.filterSelect}
                      >
                        <option value="">
                          All learners
                        </option>

                        <option value="Primary">
                          Primary
                        </option>

                        <option value="Secondary">
                          Secondary
                        </option>

                        <option value="SEND">
                          SEND
                        </option>

                        <option value="Post-16">
                          Post-16
                        </option>

                        <option value="Adult">
                          Adult learner
                        </option>
                      </select>

                    </div>

                    <div style={styles.filterField}>

                      <label style={styles.filterLabel}>
                        Year group
                      </label>

                      <select
                        value={yearFilter}
                        onChange={(event) =>
                          setYearFilter(
                            event.target.value
                          )
                        }
                        style={styles.filterSelect}
                      >
                        <option value="">
                          All years
                        </option>

                        {availableYears.map(
                          (year) => (
                            <option
                              key={year}
                              value={year}
                            >
                              {year}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div style={styles.filterField}>

                      <label style={styles.filterLabel}>
                        Subject
                      </label>

                      <select
                        value={subjectFilter}
                        onChange={(event) =>
                          setSubjectFilter(
                            event.target.value
                          )
                        }
                        style={styles.filterSelect}
                      >
                        <option value="">
                          All subjects
                        </option>

                        {availableSubjects.map(
                          (subject) => (
                            <option
                              key={subject}
                              value={subject}
                            >
                              {subject}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div style={styles.filterField}>

                      <label style={styles.filterLabel}>
                        Age band
                      </label>

                      <select
                        value={ageFilter}
                        onChange={(event) =>
                          setAgeFilter(
                            event.target.value
                          )
                        }
                        style={styles.filterSelect}
                      >
                        <option value="">
                          All ages
                        </option>

                        {ageBands.map(
                          (band) => (
                            <option
                              key={band}
                              value={band}
                            >
                              {band}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <button
                      type="button"
                      onClick={clearFilters}
                      style={styles.clearButton}
                    >
                      Clear
                    </button>

                  </div>

                  <div style={styles.resultsBar}>

                    <span>
                      Showing{" "}
                      <strong>
                        {filteredQuotes.length}
                      </strong>{" "}
                      of{" "}
                      <strong>
                        {quotes.length}
                      </strong>{" "}
                      contributions
                    </span>

                    {(searchTerm ||
                      learnerFilter ||
                      yearFilter ||
                      subjectFilter ||
                      ageFilter ||
                      showMineOnly) && (
                      <span
                        style={
                          styles.filterActive
                        }
                      >
                        Filters active
                      </span>
                    )}

                  </div>

                </div>

              </div>
            )}

            {quotes.length === 0 ? (

              <div style={styles.emptyState}>

                <div style={styles.emptyMark}>
                  ✦
                </div>

                <h3 style={styles.emptyTitle}>
                  It's quiet in here.
                </h3>

                <p style={styles.emptyText}>
                  Be the first person to add something.
                </p>

                <button
                  type="button"
                  onClick={beginContribution}
                  style={styles.primaryButton}
                >
                  Add the first story →
                </button>

              </div>

            ) : filteredQuotes.length === 0 ? (

              <div style={styles.emptyState}>

                <div style={styles.emptyMark}>
                  ⌕
                </div>

                <h3 style={styles.emptyTitle}>
                  Nothing quite matches.
                </h3>

                <p style={styles.emptyText}>
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  style={styles.primaryButton}
                >
                  Clear all filters →
                </button>

              </div>

            ) : (

              <>

                <div style={styles.quoteGrid}>

                  {filteredQuotes.map(
                    (item, index) => {

                      const colours = [
                        "#1746d1",
                        "#f04438",
                        "#159447",
                        "#e83e8c",
                        "#542b63",
                        "#087ea4",
                      ];

                      const colour =
                        colours[
                          index % colours.length
                        ];

                      const rotations = [
                        "-1deg",
                        "1deg",
                        "-0.5deg",
                        "1.2deg",
                        "-1.2deg",
                        "0.5deg",
                      ];

                      const rotation =
                        rotations[
                          index %
                            rotations.length
                        ];

                      return (
                        <article
                          key={item.id}
                          style={{
                            ...styles.quoteCard,
                            borderTop:
                              `8px solid ${colour}`,
                            transform:
                              `rotate(${rotation})`,
                          }}
                        >

                          <div style={styles.quoteMeta}>
                            {item.learner_type ||
                              "LEARNER"}

                            {item.year_group
                              ? ` · ${item.year_group}`
                              : ""}

                            {item.age_band
                              ? ` · ${item.age_band}`
                              : ""}
                          </div>

                          <blockquote
                            style={styles.quoteText}
                          >
                            “{item.quote}”
                          </blockquote>

                          {item.context && (
                            <p style={styles.context}>
                              {item.context}
                            </p>
                          )}

                          <div
                            style={styles.quoteFooter}
                          >

                            <div>
                              {item.subject && (
                                <span
                                  style={
                                    styles.subjectPill
                                  }
                                >
                                  {item.subject}
                                </span>
                              )}
                            </div>

                            {item.user_id ===
                              user.id && (
                              canModifyQuote(item) ? (
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    flexDirection:
                                      "column",
                                    alignItems:
                                      "flex-end",
                                    gap: "7px",
                                  }}
                                >

                                  <div
                                    style={{
                                      fontSize:
                                        "9px",
                                      fontWeight:
                                        "900",
                                      letterSpacing:
                                        "0.08em",
                                      color:
                                        "#5b6075",
                                      textTransform:
                                        "uppercase",
                                    }}
                                  >
                                    Editable for
                                    24 hours
                                  </div>

                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      gap: "7px",
                                      flexWrap:
                                        "wrap",
                                      justifyContent:
                                        "flex-end",
                                    }}
                                  >

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditor(
                                          item
                                        )
                                      }
                                      style={
                                        styles.editButton
                                      }
                                    >
                                      Edit →
                                    </button>

                                    <button
  type="button"
  onClick={() => {
        deleteQuote(item);
  }}
  disabled={
    saving
  }
  style={{
    ...styles.editButton,
    background:
      "#fff",
    color:
      "#f04438",
    border:
      "2px solid #f04438",
  }}
>
  Delete
</button>

                                  </div>

                                </div>
                              ) : (
                                <div
                                  style={{
                                    fontSize:
                                      "9px",
                                    fontWeight:
                                      "900",
                                    letterSpacing:
                                      "0.08em",
                                    color:
                                      "#5b6075",
                                    textTransform:
                                      "uppercase",
                                    textAlign:
                                      "right",
                                  }}
                                >
                                  Archive entry ·
                                  editing closed
                                </div>
                              )
                            )}

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>

                {hasMoreQuotes && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "center",
                      marginTop: "28px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={loadMoreQuotes}
                      style={
                        styles.loadMoreButton
                      }
                    >
                      Load more memories ↓
                    </button>
                  </div>
                )}

              </>

            )}

          </section>
        )}

        {view === "edit" && editingQuote && (
          <section style={styles.contentSection}>

            <div style={styles.sectionHeader}>

              <div>

                <div style={styles.sectionKicker}>
                  YOUR CONTRIBUTION · EDITING OPEN
                </div>

                <h2 style={styles.sectionTitle}>
                  Edit your story.
                </h2>

                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px 15px",
                    background: "#fff4d8",
                    border: "2px solid #101a35",
                    borderLeft:
                      "6px solid #f2c230",
                    borderRadius: "7px",
                    maxWidth: "620px",
                    fontSize: "12px",
                    lineHeight: "1.5",
                    color: "#5b6075",
                  }}
                >

                  <strong
                    style={{
                      color: "#101a35",
                    }}
                  >
                    ✦ Editing window
                  </strong>

                  <br />

                  You can edit or delete this
                  contribution for another{" "}

                  <strong
                    style={{
                      color: "#101a35",
                    }}
                  >
                    {getEditTimeRemaining(
                      editingQuote
                    ) ??
                      "less than a minute"}
                  </strong>

                  {" "}from now.

                </div>

                <p style={styles.sectionIntro}>
                  Make any changes you need, then save
                  your contribution back to the keepsake.
                </p>

              </div>

              <div style={styles.sectionNumber}>
                03
              </div>

            </div>

            <form
              onSubmit={handleUpdate}
              style={styles.editCard}
            >

              <label style={styles.formLabel}>
                Quote

                <textarea
                  name="quote"
                  defaultValue={editingQuote.quote}
                  required
                  rows={5}
                  style={styles.textarea}
                />
              </label>

              <label style={styles.formLabel}>
                Context

                <textarea
                  name="context"
                  defaultValue={
                    editingQuote.context || ""
                  }
                  rows={4}
                  style={styles.textarea}
                />
              </label>

              <div style={styles.formDivider}>
                LEARNER DETAILS
              </div>

              <label style={styles.formLabel}>
                Learner type

                <select
                  name="learner_type"
                  defaultValue={
                    editingQuote.learner_type || ""
                  }
                  required
                  style={styles.select}
                >

                  <option value="">
                    Select one
                  </option>

                  <option value="Primary">
                    Primary
                  </option>

                  <option value="Secondary">
                    Secondary
                  </option>

                  <option value="SEND">
                    SEND
                  </option>

                  <option value="Post-16">
                    Post-16
                  </option>

                  <option value="Adult">
                    Adult learner
                  </option>

                </select>
              </label>

              {editingQuote.learner_type ===
                "Primary" && (
                <label style={styles.formLabel}>
                  Year group

                  <select
                    name="year_group"
                    defaultValue={
                      editingQuote.year_group ||
                      ""
                    }
                    style={styles.select}
                  >

                    <option value="">
                      Select year group
                    </option>

                    {primaryYears.map(
                      (year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      )
                    )}

                  </select>
                </label>
              )}

              {editingQuote.learner_type ===
                "Secondary" && (
                <label style={styles.formLabel}>
                  Year group

                  <select
                    name="year_group"
                    defaultValue={
                      editingQuote.year_group ||
                      ""
                    }
                    style={styles.select}
                  >

                    <option value="">
                      Select year group
                    </option>

                    {secondaryYears.map(
                      (year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      )
                    )}

                  </select>
                </label>
              )}

              {(editingQuote.learner_type ===
                "SEND" ||
                editingQuote.learner_type ===
                  "Post-16" ||
                editingQuote.learner_type ===
                  "Adult") && (
                <>
                  <label
                    style={styles.formLabel}
                  >
                    Age band

                    <select
                      name="age_band"
                      defaultValue={
                        editingQuote.age_band ||
                        ""
                      }
                      style={styles.select}
                    >

                      <option value="">
                        Select age band
                      </option>

                      {ageBands.map(
                        (band) => (
                          <option
                            key={band}
                            value={band}
                          >
                            {band}
                          </option>
                        )
                      )}

                    </select>
                  </label>

                  <label
                    style={styles.formLabel}
                  >
                    Exact age

                    <input
                      type="number"
                      name="specific_age"
                      min="3"
                      max="100"
                      defaultValue={
                        editingQuote.specific_age ||
                        ""
                      }
                      style={styles.input}
                    />
                  </label>
                </>
              )}

              <div style={styles.formDivider}>
                SUBJECT
              </div>

              <label style={styles.formLabel}>
                Subject area

                <select
                  name="subject_area"
                  defaultValue={findSubjectArea(
                    editingQuote.subject
                  )}
                  style={styles.select}
                >

                  <option value="">
                    Select subject area
                  </option>

                  {Object.keys(
                    subjectGroups
                  ).map((area) => (
                    <option
                      key={area}
                      value={area}
                    >
                      {area}
                    </option>
                  ))}

                </select>
              </label>

              <label style={styles.formLabel}>
                Subject

                <select
                  name="subject"
                  defaultValue={
                    editingQuote.subject || ""
                  }
                  style={styles.select}
                >

                  <option value="">
                    Select subject
                  </option>

                  {Object.values(
                    subjectGroups
                  )
                    .flat()
                    .filter(
                      (
                        subject,
                        index,
                        array
                      ) =>
                        array.indexOf(
                          subject
                        ) === index
                    )
                    .map((subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}

                </select>
              </label>

              <label style={styles.formLabel}>
                If you selected Other

                <input
                  type="text"
                  name="other_subject"
                  defaultValue=""
                  style={styles.input}
                  placeholder="Enter subject"
                />
              </label>

              <label style={styles.formLabel}>
                Date said

                <input
                  type="date"
                  name="date_said"
                  defaultValue={
                    editingQuote.date_said ||
                    ""
                  }
                  style={styles.input}
                />
              </label>

              {message && (
                <div style={styles.errorMessage}>
                  {message}
                </div>
              )}

              <div style={styles.editButtons}>

                <button
                  type="button"
                  onClick={() => {
                    setEditingQuote(null);
                    setMessage("");
                    setView("browse");
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={styles.primaryButton}
                >
                  {saving
                    ? "Saving changes…"
                    : "Save changes ✦"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingQuote(null);
                    setMessage("");
                    setView("browse");
                  }}
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    padding: "11px 16px",
                    background: "transparent",
                    color: "#101a35",
                    border: "2px solid #101a35",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: "900",
                    cursor: "pointer",
                  }}
                >
                  ← Cancel editing
                </button>

              </div>

            </form>

          </section>
        )}

      </main>

      {selectedMemory && (
        <div
          style={styles.memoryOverlay}
          onClick={() =>
            setSelectedMemory(null)
          }
        >

          <article
            style={styles.memoryExpanded}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              onClick={() =>
                setSelectedMemory(null)
              }
              style={styles.memoryClose}
              aria-label="Close memory"
            >
              ×
            </button>

            <div
              style={styles.memoryExpandedMeta}
            >
              {selectedMemory.learner_type ||
                "LEARNER"}

              {selectedMemory.year_group
                ? ` · ${selectedMemory.year_group}`
                : ""}

              {selectedMemory.age_band
                ? ` · ${selectedMemory.age_band}`
                : ""}
            </div>

            <blockquote
              style={styles.memoryExpandedQuote}
            >
              “{selectedMemory.quote}”
            </blockquote>

            {selectedMemory.context && (
              <p
                style={
                  styles.memoryExpandedContext
                }
              >
                {selectedMemory.context}
              </p>
            )}

            {selectedMemory.subject && (
              <span
                style={
                  styles.memoryExpandedSubject
                }
              >
                {selectedMemory.subject}
              </span>
            )}

          </article>

        </div>
      )}

      <footer style={styles.footer}>
        <div style={styles.footerInner}>

          <div>

            <div style={styles.footerBrand}>
              THE THINGS WE'LL REMEMBER.
              </div>
            
            

              <div style={styles.footerSmall}>
              Teacher Training · Cohort 2026–27
             </div>

            </div>

          <div style={styles.footerSymbol}>
                            <button
                  type="button"
                  onClick={() => setShowDisclaimer(true)}
                  style={styles.disclaimerButton}
                    
                  
                >
                  About this project
                   </button>

            ✦
          </div>
          

        </div>
        
      </footer>

      {showDisclaimer && (
        <div
          style={styles.modalOverlay}
          
          onClick={() => setShowDisclaimer(false)}
        >
          <div
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowDisclaimer(false)}
              style={styles.modalClose}
            >
              ×
            </button>

            <p style={styles.modalKicker}>
              ABOUT THIS PROJECT
            </p>

            <h2 style={styles.modalTitle}>
              A keepsake made by us, for us.
            </h2>

            <div style={styles.modalText}>
              <p>
                This is a personal trainee-teacher project created for our
                PGCE/PGTA cohort.
              </p>

              <p>
                This digital keepsake has been independently designed and
                developed as a private space for members of our cohort to
                record, share and revisit memories, experiences, quotations
                and moments from our training year.
              </p>

              <p>
                It is <strong>not an official STTA or NIOT platform,
                publication, resource or communication channel</strong>,
                and it has not been developed on behalf of, commissioned
                by, or endorsed by either training provider.
              </p>

              <p>
                The inclusion of STTA and/or NIOT simply identifies the
                training context of our cohort. It does not imply that
                either provider has created, approved, reviewed or adopted
                this project.
              </p>

              <p>
                Individual contributions are made by cohort members and
                represent their own experiences, memories, humour,
                observations and personal viewpoints. They should not be
                interpreted as representing the views, policies, teaching,
                guidance or professional opinions of STTA, NIOT, their
                staff, tutors, mentors, placement schools or any other
                educational professional associated with our training.
              </p>

              <p>
                This project is intended as a <strong>personal cohort
                keepsake</strong>, rather than an educational resource,
                professional publication or source of training guidance.
              </p>

              <p>
                The platform is designed primarily as a secure user account
                and contribution system, allowing members to contribute to
                and revisit shared memories throughout and beyond the
                training year.
              </p>

              <p>
                The project is independently maintained by a trainee teacher
                for the benefit of the cohort and is separate from the
                systems, policies and official communications of STTA and
                NIOT.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDisclaimer(false)}
              style={styles.modalDone}
            >
              Close
            </button>
                  </div>
        </div>
      )}

    </div>
  );
};
function ResetPasswordForm({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleReset = async (event) => {
    event.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Your password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(`Password change failed: ${error.message}`);
      setSaving(false);
      return;
    }

    setSaving(false);
    onComplete();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f4f0e8",
      }}
    >
      <form
        onSubmit={handleReset}
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "32px",
          background: "#fffdf7",
          border: "4px solid #101a35",
          boxShadow: "8px 8px 0 #e27038",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            fontFamily: "Georgia, Times New Roman, serif",
            color: "#101a35",
          }}
        >
          Choose a new password
        </h1>

        <p
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            lineHeight: 1.5,
          }}
        >
          Enter a new password for your PGCE Keepsake account.
        </p>

        <label
          style={{
            display: "block",
            marginTop: "24px",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: "700",
          }}
        >
          New password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
            style={{
              display: "block",
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              border: "2px solid #101a35",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label
          style={{
            display: "block",
            marginTop: "18px",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: "700",
          }}
        >
          Confirm new password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
            style={{
              display: "block",
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              border: "2px solid #101a35",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
        </label>

        {message && (
          <p
            style={{
              marginTop: "18px",
              color: "#b3261e",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: "700",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: "24px",
            padding: "14px 20px",
            background: "#1746d1",
            color: "#fff4d8",
            border: "3px solid #101a35",
            cursor: saving ? "wait" : "pointer",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: "900",
            textTransform: "uppercase",
          }}
        >
          {saving ? "Saving…" : "Set new password"}
        </button>
      </form>
    </div>
  );
}
function EditorialIllustration() {
  return (
    <div style={styles.illustration}>

      <svg
        viewBox="0 0 760 620"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
        aria-hidden="true"
      >

        <defs>

          <filter id="paperTexture">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="2"
              seed="8"
            />

            <feColorMatrix
              type="saturate"
              values="0"
            />

            <feComponentTransfer>
              <feFuncA
                type="table"
                tableValues="0 0.13"
              />
            </feComponentTransfer>

            <feBlend
              mode="multiply"
              in2="SourceGraphic"
            />
          </filter>

          <filter id="printShadow">
            <feDropShadow
              dx="5"
              dy="6"
              stdDeviation="0"
              floodOpacity="0.18"
            />
          </filter>

        </defs>

        <rect
          x="0"
          y="0"
          width="760"
          height="620"
          rx="28"
          fill="#fff4d8"
        />

        <path
          d="M0 90 C110 20 180 30 245 90 C290 132 278 210 205 226 C112 248 42 215 0 175Z"
          fill="#1746d1"
          filter="url(#paperTexture)"
        />

        <path
          d="M475 0 C590 20 700 30 760 0 L760 180 C688 158 632 180 590 218 C530 272 458 240 448 173 C438 100 455 50 475 0Z"
          fill="#f04438"
          filter="url(#paperTexture)"
        />

        <path
          d="M510 408 C590 350 695 366 760 414 L760 620 L560 620 C512 566 470 446 510 408Z"
          fill="#159447"
          filter="url(#paperTexture)"
        />

        <path
          d="M0 470 C75 424 160 438 205 486 C246 530 214 591 170 620 L0 620Z"
          fill="#e83e8c"
          filter="url(#paperTexture)"
        />

        <circle
          cx="598"
          cy="126"
          r="92"
          fill="none"
          stroke="#f2c230"
          strokeWidth="26"
          opacity="0.9"
        />

        <circle
          cx="608"
          cy="133"
          r="92"
          fill="none"
          stroke="#1746d1"
          strokeWidth="7"
          opacity="0.7"
        />

        <path
          d="M245 112 L475 82 L545 207 L492 410 L285 445 L190 298Z"
          fill="#fff4d8"
          stroke="#101a35"
          strokeWidth="5"
          filter="url(#printShadow)"
        />

        <path
          d="M270 138 L452 112 L500 211"
          fill="none"
          stroke="#f2c230"
          strokeWidth="13"
        />

        <g transform="translate(122 140) rotate(-8)">

          <ellipse
            cx="86"
            cy="76"
            rx="38"
            ry="42"
            fill="#101a35"
          />

          <path
            d="M50 122 C26 162 28 235 48 275 L117 269 C138 214 130 164 113 126Z"
            fill="#f2c230"
          />

          <path
            d="M52 152 C15 180 4 220 0 270"
            fill="none"
            stroke="#101a35"
            strokeWidth="18"
            strokeLinecap="round"
          />

          <path
            d="M111 154 C150 169 166 196 181 229"
            fill="none"
            stroke="#101a35"
            strokeWidth="18"
            strokeLinecap="round"
          />

          <path
            d="M64 268 L43 330"
            stroke="#101a35"
            strokeWidth="18"
            strokeLinecap="round"
          />

          <path
            d="M104 268 L131 329"
            stroke="#101a35"
            strokeWidth="18"
            strokeLinecap="round"
          />

        </g>

        <g transform="translate(302 225)">

          <circle
            cx="86"
            cy="54"
            r="39"
            fill="#f04438"
            stroke="#101a35"
            strokeWidth="4"
          />

          <path
            d="M49 102 C28 150 35 220 58 255 L118 255 C143 214 143 148 116 104Z"
            fill="#1746d1"
          />

          <path
            d="M56 132 C18 151 2 177 -14 215"
            fill="none"
            stroke="#101a35"
            strokeWidth="17"
            strokeLinecap="round"
          />

          <path
            d="M117 131 C151 151 169 174 188 202"
            fill="none"
            stroke="#101a35"
            strokeWidth="17"
            strokeLinecap="round"
          />

          <path
            d="M67 253 L43 321"
            stroke="#101a35"
            strokeWidth="17"
            strokeLinecap="round"
          />

          <path
            d="M108 253 L138 318"
            stroke="#101a35"
            strokeWidth="17"
            strokeLinecap="round"
          />

        </g>

        <g transform="translate(468 172) rotate(9)">

          <ellipse
            cx="83"
            cy="57"
            rx="42"
            ry="46"
            fill="#101a35"
          />

          <path
            d="M46 105 C19 144 17 220 48 259 L116 253 C142 203 133 146 112 107Z"
            fill="#e83e8c"
          />

          <path
            d="M53 132 C14 151 0 182 -19 221"
            fill="none"
            stroke="#101a35"
            strokeWidth="19"
            strokeLinecap="round"
          />

          <path
            d="M111 135 C145 140 173 124 194 100"
            fill="none"
            stroke="#101a35"
            strokeWidth="19"
            strokeLinecap="round"
          />

          <path
            d="M67 252 L50 318"
            stroke="#101a35"
            strokeWidth="19"
            strokeLinecap="round"
          />

          <path
            d="M107 251 L137 315"
            stroke="#101a35"
            strokeWidth="19"
            strokeLinecap="round"
          />

        </g>

        <g transform="translate(485 407)">

          <circle
            cx="65"
            cy="30"
            r="30"
            fill="#542b63"
          />

          <path
            d="M39 71 C17 102 25 144 57 153 L101 142 C110 112 93 81 70 71Z"
            fill="#087ea4"
            stroke="#101a35"
            strokeWidth="4"
          />

          <circle
            cx="81"
            cy="162"
            r="43"
            fill="none"
            stroke="#101a35"
            strokeWidth="9"
          />

          <path
            d="M48 91 L7 119"
            stroke="#101a35"
            strokeWidth="14"
            strokeLinecap="round"
          />

          <path
            d="M75 151 L110 184"
            stroke="#101a35"
            strokeWidth="14"
            strokeLinecap="round"
          />

        </g>

        <path
          d="M215 398 L450 360 L475 430 L235 468Z"
          fill="#f2c230"
          stroke="#101a35"
          strokeWidth="5"
        />

        <path
          d="M238 409 L445 377"
          stroke="#101a35"
          strokeWidth="3"
        />

        <path
          d="M267 421 L312 414 M332 410 L380 403 M396 397 L437 391"
          stroke="#101a35"
          strokeWidth="3"
        />

        <g
          fill="none"
          stroke="#101a35"
          strokeWidth="4"
          strokeLinecap="round"
        >

          <path
            d="M68 329 C120 298 168 312 200 345"
          />

          <path d="M76 347 L118 347" />

          <path d="M84 365 L142 365" />

          <path
            d="M604 288 C650 270 691 282 716 315"
          />

          <path d="M616 307 L678 307" />

          <path d="M631 325 L703 325" />

        </g>

        <g
          fill="#101a35"
          fontFamily="Georgia, serif"
          fontWeight="bold"
        >

          <text
            x="66"
            y="397"
            fontSize="30"
            transform="rotate(-8 66 397)"
          >
            ∑
          </text>

          <text
            x="654"
            y="376"
            fontSize="29"
            transform="rotate(8 654 376)"
          >
            λ
          </text>

          <text
            x="590"
            y="74"
            fontSize="26"
            transform="rotate(-8 590 74)"
          >
            x + y
          </text>

        </g>

        <g
          fill="none"
          stroke="#101a35"
          strokeWidth="3"
          strokeLinecap="round"
        >

          <path
            d="M164 80 C184 62 207 55 230 59"
          />

          <path
            d="M184 73 L165 81 L181 92"
          />

          <path
            d="M520 278 C560 258 600 257 633 274"
          />

          <path
            d="M628 265 L639 275 L626 284"
          />

          <path
            d="M277 510 C340 534 407 529 459 503"
          />

        </g>

        <rect
          x="46"
          y="72"
          width="58"
          height="17"
          rx="8"
          fill="#f2c230"
          transform="rotate(-9 46 72)"
        />

        <rect
          x="625"
          y="425"
          width="76"
          height="18"
          rx="9"
          fill="#f04438"
          transform="rotate(7 625 425)"
        />

        <circle
          cx="215"
          cy="519"
          r="16"
          fill="#087ea4"
        />

        <circle
          cx="246"
          cy="531"
          r="9"
          fill="#f2c230"
        />

        <rect
          x="0"
          y="0"
          width="760"
          height="620"
          rx="28"
          fill="transparent"
          filter="url(#paperTexture)"
          opacity="0.32"
        />

      </svg>

      <div style={styles.illustrationCaption}>
        IDEAS · PEOPLE · MOMENTS
      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fff4d8",
    color: "#101a35",
    fontFamily:
      "Trebuchet MS, Arial, Helvetica, sans-serif",
  },

  header: {
    background: "#101a35",
    color: "#fff4d8",
    borderBottom: "5px solid #f2c230",
  },

  headerInner: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "20px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    flexWrap: "wrap",
  },

  brandButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "none",
    background: "transparent",
    color: "inherit",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },

  brandMark: {
    width: "42px",
    height: "42px",
    display: "grid",
    placeItems: "center",
    background: "#f04438",
    color: "#fff4d8",
    fontSize: "25px",
    transform: "rotate(-5deg)",
  },

  brandTop: {
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.14em",
  },

  brandBottom: {
    marginTop: "3px",
    fontFamily: "Georgia, serif",
    fontSize: "17px",
  },

  nav: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  navButton: {
    border: "none",
    background: "transparent",
    color: "#fff4d8",
    padding: "9px 11px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "800",
  },

  signOutButton: {
    border: "2px solid #fff4d8",
    background: "transparent",
    color: "#fff4d8",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "800",
    borderRadius: "5px",
  },

  hero: {
    background: "#fff4d8",
  },

  heroInner: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "70px 30px 60px",
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "45px",
    alignItems: "center",
  },

  heroCopy: {
    maxWidth: "580px",
  },

  heroKicker: {
    display: "inline-block",
    background: "#f2c230",
    padding: "8px 11px",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.12em",
    transform: "rotate(-1deg)",
    marginBottom: "22px",
  },

  heroTitle: {
    margin: 0,
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "clamp(52px, 7vw, 92px)",
    lineHeight: "0.88",
    fontWeight: "normal",
    letterSpacing: "-0.045em",
    color: "#101a35",
  },

  heroIntro: {
    maxWidth: "540px",
    margin: "30px 0 24px",
    fontSize: "17px",
    lineHeight: "1.7",
    color: "#28304d",
  },

  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginBottom: "28px",
  },

  tag: {
    color: "#fff",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.1em",
  },

  heroButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
  },

  loadMoreButton: {
    padding: "12px 20px",
    border: "2px solid #101a35",
    borderRadius: "7px",
    background: "#fff4d8",
    color: "#101a35",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "0.04em",
    cursor: "pointer",
    boxShadow: "4px 4px 0 #f2c230",
  },

  primaryButton: {
    border: "2px solid #101a35",
    background: "#1746d1",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "900",
    boxShadow: "4px 4px 0 #101a35",
  },

  secondaryButton: {
    border: "2px solid #101a35",
    background: "#fff",
    color: "#101a35",
    padding: "14px 20px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "900",
  },

  credit: {
    fontSize: "11px",
    lineHeight: "1.5",
    color: "#5b6075",
    maxWidth: "410px",
  },

  illustration: {
    position: "relative",
    width: "100%",
    minHeight: "560px",
    background: "#fff",
    border: "4px solid #101a35",
    borderRadius: "26px",
    overflow: "hidden",
    boxShadow: "12px 12px 0 #e83e8c",
  },

  illustrationCaption: {
    position: "absolute",
    left: "22px",
    bottom: "17px",
    background: "#101a35",
    color: "#fff4d8",
    padding: "8px 10px",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "0.16em",
  },

  heroBottomStrip: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 30px 25px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    color: "#1746d1",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.18em",
  },

  contentSection: {
    width: "100%",
    maxWidth: "none",
    margin: "0",
    padding: "70px 30px 100px",
    boxSizing: "border-box",
  },

  sectionHeader: {
    maxWidth: "1050px",
    margin: "0 auto 42px",
    textAlign: "center",
  },

  sectionKicker: {
    marginBottom: "10px",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.18em",
    color: "#1746d1",
  },

  sectionTitle: {
    margin: "0",
    fontFamily: "Georgia, serif",
    fontSize: "clamp(48px, 6vw, 76px)",
    lineHeight: "1.05",
    fontWeight: "normal",
    color: "#101a35",
  },

  sectionIntro: {
    margin: "18px auto 0",
    maxWidth: "none",
    whiteSpace: "nowrap",
    fontSize: "clamp(12px, 1.35vw, 17px)",
    lineHeight: "1.5",
    color: "#5b6075",
  },

  sectionNumber: {
    flexShrink: 0,
    width: "62px",
    height: "62px",
    display: "grid",
    placeItems: "center",
    background: "#f2c230",
    border: "3px solid #101a35",
    borderRadius: "50%",
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    transform: "rotate(7deg)",
  },

  formShell: {
    background: "#ffffff",
    border: "3px solid #101a35",
    borderRadius: "14px",
    padding: "30px",
    boxShadow: "8px 8px 0 #159447",
  },

  memoryStream: {
    marginBottom: "42px",
    padding: "25px",
    background: "#101a35",
    border: "3px solid #101a35",
    borderRadius: "14px",
    boxShadow: "8px 8px 0 #e83e8c",
    overflow: "hidden",
  },

  memoryStreamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
  },

  memoryStreamKicker: {
    color: "#f2c230",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.16em",
    marginBottom: "8px",
  },

  memoryStreamTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "30px",
    lineHeight: "1",
    fontWeight: "normal",
    color: "#fff4d8",
  },

  memoryControls: {
    display: "flex",
    gap: "7px",
    flexShrink: 0,
  },

  memoryControlButton: {
    width: "42px",
    height: "42px",
    border: "2px solid #fff4d8",
    background: "transparent",
    color: "#fff4d8",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "900",
  },

  memoryStreamTrack: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },

  memoryCard: {
    position: "relative",
    background: "#fff4d8",
    color: "#101a35",
    borderRight: "2px solid #101a35",
    borderBottom: "4px solid #101a35",
    borderLeft: "2px solid #101a35",
    padding: "21px",
    minHeight: "225px",
    boxSizing: "border-box",
    cursor: "pointer",
    transition:
      "transform 180ms ease, box-shadow 180ms ease",
  },

  memoryMeta: {
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "0.12em",
    color: "#5b6075",
    marginBottom: "17px",
  },

  memoryQuote: {
    fontFamily: "Georgia, serif",
    fontSize: "21px",
    lineHeight: "1.25",
    color: "#101a35",
  },

  memoryContext: {
    marginTop: "14px",
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#5b6075",
  },

  memorySubject: {
    display: "inline-block",
    marginTop: "17px",
    padding: "5px 7px",
    background: "#fff",
    border: "1px solid #101a35",
    fontSize: "9px",
    fontWeight: "900",
  },

  memoryStreamFooter: {
    marginTop: "18px",
    paddingTop: "13px",
    borderTop: "1px solid #5b6075",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    color: "#cfd3df",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "0.12em",
  },

  filterArea: {
    width: "100%",
    marginBottom: "28px",
    padding: "12px 16px",
    background: "#fff",
    border: "2px solid #101a35",
    borderRadius: "8px",
    boxShadow: "5px 5px 0 #f2c230",
    boxSizing: "border-box",
  },

  searchRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "10px",
    flexWrap: "wrap",
  },

  searchBox: {
    flex: "0 1 360px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "2px solid #101a35",
    borderRadius: "6px",
    background: "#fff4d8",
    padding: "0 10px",
    minHeight: "40px",
    boxSizing: "border-box",
  },

  searchIcon: {
    fontSize: "20px",
    lineHeight: 1,
    color: "#1746d1",
    fontFamily: "Georgia, serif",
  },

  searchInput: {
    width: "280px",
    maxWidth: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily:
      "Trebuchet MS, Arial, Helvetica, sans-serif",
    fontSize: "14px",
    color: "#101a35",
  },

  mineButton: {
    border: "2px solid #101a35",
    background: "#fff",
    color: "#101a35",
    padding: "12px 16px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },

  mineButtonActive: {
    background: "#159447",
    color: "#fff",
  },

  filterRow: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    alignItems: "end",
  },

  filterField: {
    minWidth: 0,
  },

  filterLabel: {
    display: "block",
    marginBottom: "6px",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#5b6075",
  },

  filterSelect: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    border: "2px solid #101a35",
    borderRadius: "5px",
    background: "#fff",
    fontFamily:
      "Trebuchet MS, Arial, Helvetica, sans-serif",
    fontSize: "13px",
    color: "#101a35",
  },

  clearButton: {
    border: "2px solid #101a35",
    background: "#f04438",
    color: "#fff",
    padding: "10px 13px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "900",
    minHeight: "42px",
  },

  resultsBar: {
    marginTop: "12px",
    paddingTop: "9px",
    borderTop: "1px solid #e3e0d4",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    fontSize: "11px",
    color: "#5b6075",
  },

  filterActive: {
    color: "#e83e8c",
    fontWeight: "900",
    letterSpacing: "0.05em",
  },

  emptyState: {
    padding: "80px 30px",
    textAlign: "center",
    background: "#fff",
    border: "3px solid #101a35",
    borderRadius: "14px",
    boxShadow: "8px 8px 0 #f2c230",
  },

  emptyMark: {
    fontSize: "48px",
    color: "#f04438",
  },

  emptyTitle: {
    margin: "15px 0 5px",
    fontFamily: "Georgia, serif",
    fontSize: "36px",
    fontWeight: "normal",
  },

  emptyText: {
    margin: "0 0 25px",
    color: "#5b6075",
  },

  quoteGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(290px, 1fr))",
    gap: "22px",
    alignItems: "start",
  },

  quoteCard: {
    background: "#ffffff",
    borderRight: "2px solid #101a35",
    borderBottom: "4px solid #101a35",
    borderLeft: "2px solid #101a35",
    padding: "28px",
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },

  quoteMeta: {
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.12em",
    color: "#5b6075",
    marginBottom: "24px",
  },

  quoteText: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "clamp(27px, 2.2vw, 34px)",
    lineHeight: "1.22",
    color: "#101a35",
    flex: 1,
  },

  context: {
    fontSize: "13px",
    lineHeight: "1.55",
    color: "#5b6075",
    margin: "20px 0",
  },

  quoteFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
  },

  subjectPill: {
    display: "inline-block",
    padding: "6px 8px",
    background: "#fff4d8",
    border: "1px solid #101a35",
    fontSize: "10px",
    fontWeight: "900",
  },

  editButton: {
    border: "2px solid #101a35",
    background: "#f2c230",
    color: "#101a35",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "900",
  },

  editCard: {
    maxWidth: "800px",
    background: "#fff",
    border: "3px solid #101a35",
    borderRadius: "14px",
    padding: "32px",
    boxShadow: "8px 8px 0 #087ea4",
  },

  formLabel: {
    display: "block",
    marginBottom: "22px",
    fontSize: "13px",
    fontWeight: "900",
    color: "#101a35",
  },

  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "8px",
    padding: "13px",
    border: "2px solid #101a35",
    borderRadius: "6px",
    background: "#fff",
    fontFamily:
      "Trebuchet MS, Arial, Helvetica, sans-serif",
    fontSize: "15px",
    lineHeight: "1.5",
    resize: "vertical",
  },

  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "8px",
    padding: "13px",
    border: "2px solid #101a35",
    borderRadius: "6px",
    background: "#fff",
    fontFamily:
      "Trebuchet MS, Arial, Helvetica, sans-serif",
    fontSize: "15px",
  },

  select: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "8px",
    padding: "13px",
    border: "2px solid #101a35",
    borderRadius: "6px",
    background: "#fff",
    fontFamily:
      "Trebuchet MS, Arial, Helvetica, sans-serif",
    fontSize: "15px",
  },

  formDivider: {
    margin: "30px 0 22px",
    paddingBottom: "8px",
    borderBottom: "3px solid #f2c230",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.15em",
    color: "#1746d1",
  },

  errorMessage: {
    marginBottom: "20px",
    padding: "13px",
    background: "#f04438",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "13px",
  },

  editButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "10px",
  },

  cancelButton: {
    border: "2px solid #101a35",
    background: "#fff",
    color: "#101a35",
    padding: "14px 20px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "900",
  },

  memoryOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(16, 26, 53, 0.78)",
    display: "grid",
    placeItems: "center",
    padding: "25px",
    boxSizing: "border-box",
  },

  memoryExpanded: {
    position: "relative",
    width: "min(720px, 100%)",
    maxHeight: "85vh",
    overflowY: "auto",
    boxSizing: "border-box",
    background: "#fff4d8",
    border: "4px solid #101a35",
    borderTop: "9px solid #f04438",
    padding: "42px",
    boxShadow: "12px 12px 0 #e83e8c",
  },

  memoryClose: {
    position: "absolute",
    top: "12px",
    right: "15px",
    width: "40px",
    height: "40px",
    border: "2px solid #101a35",
    background: "#f2c230",
    color: "#101a35",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "25px",
    lineHeight: 1,
    fontWeight: "900",
  },

  memoryExpandedMeta: {
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.14em",
    color: "#5b6075",
    marginBottom: "25px",
  },

  memoryExpandedQuote: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "clamp(28px, 5vw, 48px)",
    lineHeight: "1.18",
    color: "#101a35",
  },

  memoryExpandedContext: {
    marginTop: "28px",
    fontSize: "15px",
    lineHeight: "1.65",
    color: "#5b6075",
  },

  memoryExpandedSubject: {
    display: "inline-block",
    marginTop: "24px",
    padding: "7px 10px",
    background: "#fff",
    border: "2px solid #101a35",
    fontSize: "10px",
    fontWeight: "900",
  },

  footer: {
    background: "#101a35",
    color: "#fff4d8",
    borderTop: "6px solid #f04438",
  },

  footerInner: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerBrand: {
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.15em",
  },

  footerSmall: {
    marginTop: "7px",
    fontSize: "11px",
    color: "#cfd3df",
  },

 footerSymbol: {
  fontSize: "34px",
  color: "#f2c230",
  marginRight: "0",
},
 disclaimerButton: {
  padding: "0",
  marginLeft: "120px",
 
                background: "#1c357e",
                color: "#fff4d8",
                border: "4px solid #101a35",
                boxShadow: "1px 1px 0 #e27038",
                cursor: "pointer",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                textAlign: "left",
},
modalOverlay: {
  position: "fixed",
  inset: 0,
  background: "rgba(16, 26, 53, 0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  zIndex: 1200,
},

modal: {
  position: "relative",
  width: "100%",
  maxWidth: "680px",
  maxHeight: "85vh",
  overflowY: "auto",
  background: "#ffffff",
  border: "3px solid #101a35",
  borderRadius: "12px",
  padding: "38px",
  boxSizing: "border-box",
  boxShadow: "10px 10px 0 #1746d1",
},

modalClose: {
  position: "absolute",
  top: "12px",
  right: "16px",
  border: "none",
  background: "transparent",
  color: "#101a35",
  fontSize: "30px",
  lineHeight: "1",
  cursor: "pointer",
},

modalKicker: {
  margin: "0 0 10px",
  fontSize: "14px",
  letterSpacing: "3px",
  fontWeight: "900",
  color: "#e83e8c",
},

modalTitle: {
  margin: "0 40px 24px 0",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "32px",
  lineHeight: "1.1",
  fontWeight: "normal",
  color: "#101a35",
},

modalText: {
  fontSize: "18px",
  lineHeight: "1.65",
  color: "#28304d",
},

modalDone: {
  marginTop: "24px",
  background: "#1746d1",
  color: "#e4eaab",
  border: "2px solid #101a35",
  borderRadius: "7px",
  padding: "11px 20px",
  cursor: "pointer",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "18px",
  fontWeight: "900",
},
  
};

export default App;