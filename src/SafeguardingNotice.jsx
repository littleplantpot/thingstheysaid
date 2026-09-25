import React from "react";

export default function SafeguardingNotice({ onContinue, onCancel }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.warningIcon}>⚠️</div>

        <div style={styles.kicker}>
          BEFORE YOU CONTRIBUTE
        </div>

        <h1 style={styles.title}>
          Important Safeguarding & Data Protection Reminder
        </h1>

        <p style={styles.intro}>
          By submitting a quote, you agree that your contribution is
          entirely anonymous.
        </p>

        <p style={styles.body}>
          To comply with UK GDPR, the Data Protection Act 2018 and
          educational safeguarding standards, please make sure your
          contribution does <strong>not</strong> contain any information
          that could identify an individual or where the quote came from.
        </p>

        <div style={styles.rules}>

          <div style={styles.rule}>
            <div style={styles.ruleTitle}>Names</div>
            <div style={styles.ruleText}>
              No student, staff, parent, colleague or other individual names.
            </div>
          </div>

          <div style={styles.rule}>
            <div style={styles.ruleTitle}>Identifying details</div>
            <div style={styles.ruleText}>
              No specific physical descriptions, unique circumstances,
              rare incidents or combinations of details that could identify
              an individual.
            </div>
          </div>

          <div style={styles.rule}>
            <div style={styles.ruleTitle}>Locations</div>
            <div style={styles.ruleText}>
              No school, town, organisation, placement or other location
              details that could allow someone to work out the source.
            </div>
          </div>

        </div>

        <div style={styles.important}>
          <strong>Please remember:</strong> even without a name, a
          combination of distinctive details can identify someone.
        </div>

        <div style={styles.deletionNotice}>
          Submissions that breach privacy requirements, safeguarding
          expectations or professional codes of conduct may be
          <strong> permanently deleted.</strong>
        </div>

        <div style={styles.confirmation}>
          By continuing, you confirm that you have checked your contribution
          and understand these requirements.
        </div>

        <div style={styles.buttons}>
          <button
            type="button"
            onClick={onCancel}
            style={styles.cancelButton}
          >
            ← Go back
          </button>

          <button
            type="button"
            onClick={onContinue}
            style={styles.continueButton}
          >
            I understand — let me add my contribution →
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    padding: "48px 24px 72px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    boxSizing: "border-box",
    background: "#f5f1e8",
  },

  card: {
    width: "100%",
    maxWidth: "820px",
    background: "#fff4d8",
    border: "3px solid #101a35",
    borderRadius: "18px",
    padding: "42px",
    boxSizing: "border-box",
    boxShadow: "10px 10px 0 #1746d1",
  },

  warningIcon: {
    fontSize: "42px",
    marginBottom: "12px",
  },

  kicker: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "0.14em",
    color: "#e83e8c",
    marginBottom: "10px",
  },

  title: {
    margin: "0 0 20px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "clamp(30px, 5vw, 48px)",
    lineHeight: "1.02",
    color: "#101a35",
  },

  intro: {
    margin: "0 0 16px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "19px",
    lineHeight: "1.5",
    fontWeight: "700",
    color: "#101a35",
  },

  body: {
    margin: "0 0 28px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "16px",
    lineHeight: "1.65",
    color: "#28304d",
  },

  rules: {
    display: "grid",
    gap: "14px",
    marginBottom: "24px",
  },

  rule: {
    padding: "18px 20px",
    background: "#ffffff",
    border: "2px solid #101a35",
    borderRadius: "10px",
  },

  ruleTitle: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "17px",
    fontWeight: "900",
    color: "#1746d1",
    marginBottom: "5px",
  },

  ruleText: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    lineHeight: "1.55",
    color: "#28304d",
  },

  important: {
    padding: "18px 20px",
    marginBottom: "16px",
    background: "#f2c230",
    border: "2px solid #101a35",
    borderRadius: "10px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    lineHeight: "1.55",
    color: "#101a35",
  },

  deletionNotice: {
    padding: "18px 20px",
    marginBottom: "20px",
    background: "#f04438",
    border: "2px solid #101a35",
    borderRadius: "10px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
    lineHeight: "1.55",
    color: "#ffffff",
  },

  confirmation: {
    padding: "16px 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#28304d",
  },

  buttons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "10px",
  },

  cancelButton: {
    padding: "14px 18px",
    borderRadius: "8px",
    border: "2px solid #101a35",
    background: "#ffffff",
    color: "#101a35",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },

  continueButton: {
    flex: "1",
    minWidth: "260px",
    padding: "15px 20px",
    borderRadius: "8px",
    border: "2px solid #101a35",
    background: "#1746d1",
    color: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
  },
};