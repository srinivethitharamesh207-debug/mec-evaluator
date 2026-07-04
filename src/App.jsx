import { useState } from "react";

const CATEGORY_DEFS = {
  poster: {
    label: "Poster",
    inputType: "file",
    accept: "image/*,application/pdf",
    hint: "Upload the poster as an image or PDF.",
    criteria: ["Content Clarity", "Visual Design", "Creativity", "Relevance to Topic"],
  },
  ppt: {
    label: "PPT",
    inputType: "file",
    accept: "image/*,application/pdf",
    hint: "Upload the PPT exported as an image or PDF.",
    criteria: ["Content Quality", "Slide Design", "Clarity of Delivery", "Creativity"],
  },
  idea: {
    label: "Idea",
    inputType: "text",
    hint: "Describe the idea in detail — problem, solution, uniqueness.",
    criteria: ["Originality", "Feasibility", "Clarity of Explanation", "Impact / Usefulness"],
  },
  image: {
    label: "Image",
    inputType: "file",
    accept: "image/*",
    hint: "Upload the image entry.",
    criteria: ["Composition", "Creativity", "Technical Quality", "Relevance to Theme"],
  },
  video: {
    label: "Video",
    inputType: "text",
    hint: "Attach the file for reference and describe its content, quality and style.",
    allowAttach: true,
    accept: "video/*",
    criteria: ["Concept & Storyline", "Visual & Audio Quality", "Creativity", "Relevance to Theme"],
  },
  audio: {
    label: "Audio",
    inputType: "text",
    hint: "Attach the file for reference and describe its content, quality and style.",
    allowAttach: true,
    accept: "audio/*",
    criteria: ["Sound Quality", "Creativity", "Composition & Structure", "Relevance to Theme"],
  },
};

const ORDER = ["poster", "ppt", "idea", "image", "video", "audio"];

function TabIcon({ id }) {
  const p = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none" };
  switch (id) {
    case "poster":
      return (
        <svg {...p}><rect x="5" y="4" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M9 3.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M8 10h8M8 14h8M8 18h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
      );
    case "ppt":
      return (
        <svg {...p}><rect x="2.5" y="5" width="19" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M6.5 9h6M6.5 12.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M8 21h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      );
    case "idea":
      return (
        <svg {...p}><path d="M9 18h6M10 21h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M12 3a6 6 0 00-3.2 11.1c.5.35.7.9.7 1.4v.5h5v-.5c0-.5.2-1.05.7-1.4A6 6 0 0012 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      );
    case "image":
      return (
        <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /><circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" /><path d="M3 16l5.5-5.5a1.5 1.5 0 012.1 0L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M13 16l2.5-2.5a1.5 1.5 0 012.1 0L21 17" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      );
    case "video":
      return (
        <svg {...p}><rect x="2" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M16 9.5L22 6v12l-6-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      );
    case "audio":
      return (
        <svg {...p}><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      );
    default:
      return null;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

export default function MECEvaluator() {
  const [category, setCategory] = useState("poster");
  const [eventName, setEventName] = useState("");
  const [participants, setParticipants] = useState(1);
  const [maxMarks, setMaxMarks] = useState(50);

  const [file, setFile] = useState(null); // {name, mime, base64, previewUrl}
  const [attachFile, setAttachFile] = useState(null); // for video/audio filename only
  const [textInput, setTextInput] = useState("");
  const [criteriaList, setCriteriaList] = useState(() => CATEGORY_DEFS.poster.criteria.slice());
  const [selectedCriteria, setSelectedCriteria] = useState(() => CATEGORY_DEFS.poster.criteria.map(() => true));
  const [addingCriterion, setAddingCriterion] = useState(false);
  const [newCriterionText, setNewCriterionText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const def = CATEGORY_DEFS[category];
  const activeCriteria = criteriaList.filter((_, i) => selectedCriteria[i]);

  function switchCategory(id) {
    setCategory(id);
    setFile(null);
    setAttachFile(null);
    setTextInput("");
    setResult(null);
    setError("");
    setCriteriaList(CATEGORY_DEFS[id].criteria.slice());
    setSelectedCriteria(CATEGORY_DEFS[id].criteria.map(() => true));
    setAddingCriterion(false);
    setNewCriterionText("");
  }

  function toggleCriterion(i) {
    setSelectedCriteria((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function confirmAddCriterion() {
    const name = newCriterionText.trim();
    if (name) {
      setCriteriaList((prev) => [...prev, name]);
      setSelectedCriteria((prev) => [...prev, true]);
    }
    setNewCriterionText("");
    setAddingCriterion(false);
  }

  async function handleFilePick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const base64 = await fileToBase64(f);
    setFile({
      name: f.name,
      mime: f.type || "application/octet-stream",
      base64,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    });
  }

  function handleAttachPick(e) {
    const f = e.target.files?.[0];
    if (f) setAttachFile(f.name);
  }

  const hasContent = def.inputType === "file" ? !!file : textInput.trim().length > 0;
  const canEvaluate = hasContent && activeCriteria.length > 0;

  async function handleEvaluate() {
    if (!canEvaluate || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const criteriaList = activeCriteria;
      const system = `You are a fair, experienced judge evaluating a "${def.label}" entry for a college-level event named "${eventName || def.label + " Event"}".
Score the entry out of 10 (integers) on exactly these ${criteriaList.length} criteria, in this order: ${criteriaList.join(", ")}.
Also write one short, specific remark (max 25 words).
Respond with ONLY valid JSON, no markdown, no preamble, in exactly this shape:
{"scores":[0,0,0,0],"remarks":""}`;

      let userContent;
      if (def.inputType === "file") {
        const block = file.mime === "application/pdf"
          ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: file.base64 } }
          : { type: "image", source: { type: "base64", media_type: file.mime, data: file.base64 } };
        userContent = [block, { type: "text", text: `Evaluate this ${def.label.toLowerCase()} entry.` }];
      } else {
        const attachNote = attachFile ? `Attached file: ${attachFile}.\n` : "";
        userContent = `${attachNote}${def.label} entry description:\n"""${textInput.trim()}"""`;
      }

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, content: userContent }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .replace(/```json|```/g, "")
        .trim();
      const parsed = JSON.parse(text);
      const scores = parsed.scores.map((n) => Math.max(0, Math.min(10, Number(n))));
      const rawTotal = scores.reduce((a, b) => a + b, 0);
      const rawMax = criteriaList.length * 10;
      const totalMarks = Math.round((rawTotal / rawMax) * maxMarks * 10) / 10;
      const perParticipant = participants > 1 ? Math.round((totalMarks / participants) * 10) / 10 : null;
      setResult({ scores, criteria: criteriaList, remarks: parsed.remarks, totalMarks, perParticipant });
    } catch (e) {
      setError("Couldn't evaluate this entry. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mec-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        .mec-root {
          --cream: #FBF4E8;
          --cream-deep: #F1E3C9;
          --orange: #E2712E;
          --orange-deep: #C85A1E;
          --ink: #2B2420;
          --ink-soft: #8A7A63;
          --line: #E6D4AE;
          --white: #FFFDF8;
          --font-display: 'Fraunces', Georgia, serif;
          --font-body: 'Inter', system-ui, sans-serif;

          min-height: 100%;
          background: var(--cream);
          color: var(--ink);
          font-family: var(--font-body);
          padding: 40px 18px 60px;
          box-sizing: border-box;
        }
        .mec-root *{ box-sizing: border-box; }
        .mec-wrap { max-width: 600px; margin: 0 auto; }

        .mec-eyebrow { font-size: 12px; letter-spacing: 2px; color: var(--orange-deep); font-weight: 600; margin-bottom: 8px; }
        .mec-title { font-family: var(--font-display); font-size: 32px; font-weight: 600; margin: 0 0 6px; line-height: 1.15; }
        .mec-sub { color: var(--ink-soft); font-size: 14px; margin: 0 0 22px; line-height: 1.5; }

        .mec-settings {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 18px;
        }
        .mec-field label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.5px;
          color: var(--ink-soft);
          margin-bottom: 4px;
        }
        .mec-field input {
          width: 100%;
          border: 1.5px solid var(--line);
          background: var(--white);
          border-radius: 9px;
          padding: 9px 10px;
          font-family: var(--font-body);
          font-size: 13.5px;
          color: var(--ink);
          outline: none;
        }
        .mec-field input:focus { border-color: var(--orange); }

        .mec-tabs { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 16px; }
        .mec-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 13px; border-radius: 999px;
          border: 1.5px solid var(--line); background: var(--white);
          color: var(--ink-soft); font-size: 13.5px; font-weight: 500;
          cursor: pointer; transition: all 0.15s ease;
        }
        .mec-tab:hover { border-color: var(--orange); color: var(--ink); }
        .mec-tab.active { background: var(--orange); border-color: var(--orange); color: var(--white); }

        .mec-crit-card {
          background: var(--cream-deep);
          border: 1px dashed var(--orange);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 14px;
        }
        .mec-crit-title { font-size: 11px; letter-spacing: 1.2px; font-weight: 600; color: var(--orange-deep); margin-bottom: 8px; }
        .mec-crit-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .mec-crit-chip {
          border-radius: 7px; padding: 5px 10px; font-size: 12.5px;
          cursor: pointer; user-select: none; transition: all 0.12s ease;
          border: 1px solid var(--line);
        }
        .mec-crit-chip.on { background: var(--orange); border-color: var(--orange); color: var(--white); font-weight: 500; }
        .mec-crit-chip.off { background: var(--white); color: var(--ink-soft); text-decoration: line-through; opacity: 0.7; }
        .mec-crit-chip:hover { transform: translateY(-1px); }
        .mec-crit-chip.add {
          background: transparent; border: 1.5px dashed var(--orange-deep);
          color: var(--orange-deep); font-weight: 600; text-decoration: none; opacity: 1;
        }
        .mec-crit-add-input {
          border: 1.5px solid var(--orange); border-radius: 7px;
          padding: 5px 10px; font-size: 12.5px; font-family: var(--font-body);
          outline: none; background: var(--white); color: var(--ink); min-width: 140px;
        }

        .mec-card { background: var(--white); border: 1.5px solid var(--line); border-radius: 16px; padding: 18px; }

        .mec-drop {
          border: 1.5px dashed var(--line);
          border-radius: 12px;
          padding: 22px;
          text-align: center;
          cursor: pointer;
          color: var(--ink-soft);
          font-size: 13.5px;
        }
        .mec-drop:hover { border-color: var(--orange); }
        .mec-drop input { display: none; }
        .mec-preview { display: flex; align-items: center; gap: 12px; }
        .mec-preview img { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; border: 1px solid var(--line); }
        .mec-preview .name { font-size: 13.5px; color: var(--ink); word-break: break-all; }
        .mec-swap { font-size: 12px; color: var(--orange-deep); cursor: pointer; margin-left: auto; text-decoration: underline; }

        textarea.mec-input {
          width: 100%; min-height: 110px; resize: vertical;
          border: none; outline: none; background: transparent;
          font-family: var(--font-body); font-size: 14.5px; line-height: 1.5; color: var(--ink);
        }
        textarea.mec-input::placeholder { color: #B9AB8F; }

        .mec-attach-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed var(--line); font-size: 12.5px; color: var(--ink-soft); }
        .mec-attach-btn { border: 1px solid var(--line); background: var(--white); border-radius: 7px; padding: 6px 10px; cursor: pointer; color: var(--ink); }
        .mec-attach-btn input { display: none; }

        .mec-footer-row { display: flex; align-items: center; justify-content: flex-end; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); }

        .mec-btn {
          background: var(--orange); color: var(--white); border: none; border-radius: 999px;
          padding: 10px 22px; font-family: var(--font-body); font-size: 14px; font-weight: 600;
          cursor: pointer; transition: background 0.15s ease, transform 0.1s ease;
        }
        .mec-btn:hover:not(:disabled) { background: var(--orange-deep); }
        .mec-btn:active:not(:disabled) { transform: scale(0.97); }
        .mec-btn:disabled { opacity: 0.5; cursor: default; }

        .mec-error { margin-top: 14px; font-size: 13.5px; color: var(--orange-deep); }

        .mec-result { margin-top: 22px; background: var(--white); border: 1.5px solid var(--line); border-radius: 16px; padding: 22px; animation: mec-fade 0.4s ease; }
        @keyframes mec-fade { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }

        .mec-bars { display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px; }
        .mec-bar-label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; margin-bottom: 5px; }
        .mec-bar-track { height: 7px; border-radius: 4px; background: var(--cream-deep); overflow: hidden; }
        .mec-bar-fill { height: 100%; background: var(--orange); border-radius: 4px; transition: width 0.6s ease; }

        .mec-total-row { display: flex; align-items: flex-end; justify-content: space-between; border-top: 1px solid var(--line); padding-top: 16px; }
        .mec-total-num { font-family: var(--font-display); font-size: 40px; color: var(--ink); line-height: 1; }
        .mec-total-label { font-size: 11px; letter-spacing: 1px; color: var(--ink-soft); margin-top: 4px; }
        .mec-per { text-align: right; font-size: 13px; color: var(--ink-soft); }
        .mec-per b { color: var(--ink); font-size: 15px; }

        .mec-remarks { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line); font-size: 13.5px; color: var(--ink); font-style: italic; }

        @media (max-width: 480px) {
          .mec-settings { grid-template-columns: 1fr; }
          .mec-title { font-size: 26px; }
        }
      `}</style>

      <div className="mec-wrap">
        <div className="mec-eyebrow">MEC EVALUATOR</div>
        <h1 className="mec-title">What's on today's event performance?</h1>
        <p className="mec-sub">Set up the event, pick a category, choose what to score on, submit the entry and get category-wise marks plus a total.</p>

        <div className="mec-settings">
          <div className="mec-field">
            <label>EVENT NAME</label>
            <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Tech Expo 2026" />
          </div>
          <div className="mec-field">
            <label>PARTICIPANTS</label>
            <input type="number" min="1" value={participants} onChange={(e) => setParticipants(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <div className="mec-field">
            <label>MAX MARKS</label>
            <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(Math.max(1, Number(e.target.value) || 1))} />
          </div>
        </div>

        <div className="mec-tabs">
          {ORDER.map((id) => (
            <button key={id} className={"mec-tab" + (category === id ? " active" : "")} onClick={() => switchCategory(id)}>
              <TabIcon id={id} />
              {CATEGORY_DEFS[id].label}
            </button>
          ))}
        </div>

        <div className="mec-crit-card">
          <div className="mec-crit-title">EVALUATION CATEGORIES — tap to include/exclude</div>
          <div className="mec-crit-list">
            {criteriaList.map((c, i) => (
              <span
                key={c + i}
                className={"mec-crit-chip" + (selectedCriteria[i] ? " on" : " off")}
                onClick={() => toggleCriterion(i)}
              >
                {selectedCriteria[i] ? "✓ " : ""}{c}
              </span>
            ))}
            {addingCriterion ? (
              <input
                autoFocus
                className="mec-crit-add-input"
                placeholder="New category name"
                value={newCriterionText}
                onChange={(e) => setNewCriterionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddCriterion();
                  if (e.key === "Escape") { setAddingCriterion(false); setNewCriterionText(""); }
                }}
                onBlur={confirmAddCriterion}
              />
            ) : (
              <span className="mec-crit-chip add" onClick={() => setAddingCriterion(true)}>+ Add</span>
            )}
          </div>
        </div>

        <div className="mec-card">
          {def.inputType === "file" ? (
            file ? (
              <div className="mec-preview">
                {file.previewUrl ? <img src={file.previewUrl} alt="" /> : <div style={{ fontSize: 28 }}>📄</div>}
                <span className="name">{file.name}</span>
                <span className="mec-swap" onClick={() => setFile(null)}>Change</span>
              </div>
            ) : (
              <label className="mec-drop">
                <input type="file" accept={def.accept} onChange={handleFilePick} />
                Click to upload — {def.hint}
              </label>
            )
          ) : (
            <>
              {def.allowAttach && (
                <div className="mec-attach-row">
                  <label className="mec-attach-btn">
                    Attach {def.label.toLowerCase()} file
                    <input type="file" accept={def.accept} onChange={handleAttachPick} />
                  </label>
                  <span>{attachFile ? attachFile : "no file attached"}</span>
                </div>
              )}
              <textarea
                className="mec-input"
                placeholder={def.hint}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
            </>
          )}

          <div className="mec-footer-row">
            <button className="mec-btn" onClick={handleEvaluate} disabled={!canEvaluate || loading}>
              {loading ? "Evaluating…" : "Evaluate entry"}
            </button>
          </div>
        </div>

        {activeCriteria.length === 0 && <div className="mec-error">Select at least one evaluation category above.</div>}
        {error && <div className="mec-error">{error}</div>}

        {result && (
          <div className="mec-result">
            <div className="mec-bars">
              {result.criteria.map((c, i) => (
                <div key={c}>
                  <div className="mec-bar-label"><span>{c}</span><span>{result.scores[i]}/10</span></div>
                  <div className="mec-bar-track"><div className="mec-bar-fill" style={{ width: `${(result.scores[i] / 10) * 100}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="mec-total-row">
              <div>
                <div className="mec-total-num">{result.totalMarks}<span style={{ fontSize: 20, color: "var(--ink-soft)" }}> / {maxMarks}</span></div>
                <div className="mec-total-label">TOTAL MARKS</div>
              </div>
              {result.perParticipant !== null && (
                <div className="mec-per">per participant ({participants})<br /><b>{result.perParticipant}</b></div>
              )}
            </div>

            <div className="mec-remarks">"{result.remarks}"</div>
          </div>
        )}
      </div>
    </div>
  );
}
