import Link from "next/link";
import {
  Aperture,
  Check,
  ChevronRight,
  Clapperboard,
  Film,
  ImageIcon,
  ScanSearch,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const features = [
  {
    icon: ScanSearch,
    title: "Script intelligence",
    copy: "Turn raw scenes into structured characters, locations, props, and a continuity-aware shot plan.",
  },
  {
    icon: ImageIcon,
    title: "Reusable visual assets",
    copy: "Create production-ready reference prompts and visual masters you can reuse across every shot.",
  },
  {
    icon: Film,
    title: "Local keyframe extraction",
    copy: "Find useful reference frames in your browser, so the source video stays on your device.",
  },
];

const steps = [
  ["01", "Bring the story", "Paste a script or import a text file. Add a reference video when the scene needs visual grounding."],
  ["02", "Build the production bible", "Review the extracted cast, locations, props, visual prompts, and selected keyframes in one workspace."],
  ["03", "Direct with continuity", "Move into a percentage-based shot plan with camera, action, sound, and reusable asset links."],
];

export default function Home() {
  return (
    <main className="marketing-shell">
      <header className="marketing-nav">
        <Link className="marketing-brand" href="#top" aria-label="Tessa AI home">
          <span><Aperture size={20} /></span>
          <strong>Tessa AI</strong>
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#workflow">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="marketing-button marketing-button-small marketing-button-gradient" href="mailto:founder@tessa22.cc?subject=Tessa%20AI%20early%20access">
          Request early access
        </a>
      </header>

      <section className="marketing-hero" id="top">
        <div className="marketing-hero-glow" aria-hidden="true" />
        <div className="marketing-badge"><Sparkles size={14} /> Private beta for AI film teams</div>
        <h1>Turn every script into a<br /><span>production-ready visual plan.</span></h1>
        <p>
          Tessa AI transforms scripts and reference videos into reusable assets,
          keyframes, and continuity-aware shot plans—before generation begins.
        </p>
        <div className="marketing-hero-actions">
          <Link className="marketing-button marketing-button-gradient" href="/studio">
            Open Production Lab <ChevronRight size={17} />
          </Link>
          <a className="marketing-button marketing-button-ghost" href="#product">Explore the workflow</a>
        </div>
        <div className="marketing-proof-line">
          <span><Check size={14} /> Local video analysis</span>
          <span><Check size={14} /> Structured production assets</span>
          <span><Check size={14} /> Editable shot plans</span>
        </div>
      </section>

      <section className="marketing-product" id="product">
        <div className="marketing-product-bar">
          <div className="marketing-brand marketing-brand-compact">
            <span><Aperture size={15} /></span>
            <strong>Tessa AI</strong>
            <small>Production Lab</small>
          </div>
          <div className="marketing-project"><i /> The Delayed Reflection</div>
          <Link href="/studio">Open live workspace <ChevronRight size={14} /></Link>
        </div>
        <div className="marketing-workspace-preview">
          <div className="marketing-preview-panel marketing-preview-input">
            <small>01 · INPUT</small>
            <h3>Source script</h3>
            <p>Late night inside a dark government analysis office. A lone analyst sits beneath a security camera…</p>
            <button type="button"><WandSparkles size={14} /> Analyze script</button>
          </div>
          <div className="marketing-preview-panel marketing-preview-assets">
            <small>03 · PRODUCTION BIBLE</small>
            <h2>Asset registry</h2>
            <p>A reusable source of truth for every scene.</p>
            <div className="marketing-asset-row">
              <div><span><Aperture size={19} /></span><strong>The Analyst</strong><small>Character · locked</small></div>
              <div><span><Clapperboard size={19} /></span><strong>Analysis Office</strong><small>Location · master</small></div>
            </div>
            <div className="marketing-continuity"><Check size={14} /> Identity and continuity constraints stay attached.</div>
          </div>
          <div className="marketing-preview-panel marketing-preview-shots">
            <small>04 · TIMELINE</small>
            <h3>Shot plan</h3>
            {["The scan", "It sees him", "The warning"].map((shot, index) => (
              <div className="marketing-shot" key={shot}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span><strong>{shot}</strong><small>{index === 0 ? "0–33%" : index === 1 ? "33–67%" : "67–100%"}</small></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <span>One production system</span>
          <h2>Less prompt chaos.<br />More directorial control.</h2>
          <p>Build a durable production bible first, then create every shot from the same visual source of truth.</p>
        </div>
        <div className="marketing-feature-grid">
          {features.map(({ icon: Icon, title, copy }) => (
            <article key={title}>
              <span><Icon size={21} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section marketing-workflow" id="workflow">
        <div className="marketing-section-heading marketing-section-heading-center">
          <span>How it works</span>
          <h2>From blank page to shootable plan.</h2>
        </div>
        <div className="marketing-steps">
          {steps.map(([number, title, copy]) => (
            <article key={number}>
              <b>{number}</b>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section marketing-faq" id="faq">
        <div className="marketing-section-heading">
          <span>FAQ</span>
          <h2>Clear answers,<br />before you begin.</h2>
        </div>
        <div className="marketing-faq-list">
          <details open>
            <summary>What is Tessa AI?<ChevronRight size={17} /></summary>
            <p>A pre-production workspace for turning scripts and reference video into structured assets and continuity-aware shot plans for AI filmmaking.</p>
          </details>
          <details>
            <summary>Is the product available now?<ChevronRight size={17} /></summary>
            <p>The Production Lab is available as an early working preview. We are inviting filmmakers and creative teams to help shape the private beta.</p>
          </details>
          <details>
            <summary>Does Tessa upload my reference video?<ChevronRight size={17} /></summary>
            <p>Keyframe detection runs locally in your browser. Only the frames you deliberately select are used when you request a compatible image-generation workflow.</p>
          </details>
          <details>
            <summary>Which AI providers does it support?<ChevronRight size={17} /></summary>
            <p>The current architecture supports Claude for script analysis, OpenAI for asset generation, and an optional ByteDance image workflow.</p>
          </details>
        </div>
      </section>

      <section className="marketing-access" id="contact">
        <span>Early access</span>
        <h2>Build your next story<br />with a system behind it.</h2>
        <p>Tell us what your team creates. We will reply from a real founder inbox.</p>
        <a className="marketing-email" href="mailto:founder@tessa22.cc?subject=Tessa%20AI%20early%20access">founder@tessa22.cc</a>
        <a className="marketing-button marketing-button-gradient" href="mailto:founder@tessa22.cc?subject=Tessa%20AI%20early%20access">
          Request early access <ChevronRight size={17} />
        </a>
      </section>

      <footer className="marketing-footer">
        <div className="marketing-brand marketing-brand-compact">
          <span><Aperture size={15} /></span><strong>Tessa AI</strong>
        </div>
        <p>© 2026 Tessa AI · tessa22.cc</p>
        <nav aria-label="Footer navigation">
          <a href="#product">Product</a>
          <a href="#workflow">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="mailto:founder@tessa22.cc">Contact</a>
          <a href="https://github.com/Desperato22/tessa-ai" rel="noreferrer" target="_blank">GitHub</a>
        </nav>
      </footer>
    </main>
  );
}
