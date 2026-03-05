import Link from "next/link";
import {
  Flame,
  Zap,
  Brain,
  MessageSquare,
  ListChecks,
  Search,
  Globe,
  ArrowRight,
} from "lucide-react";

const stats = [
  { value: "150,000+", label: "Regulated Entities" },
  { value: "5 Min", label: "Detection Time" },
  { value: "90%+", label: "Extraction Accuracy" },
];

const steps = [
  { num: 1, title: "Detect", desc: "Monitor RBI sources in real-time" },
  { num: 2, title: "Parse", desc: "AI reads and structures the circular" },
  { num: 3, title: "Extract", desc: "Identify obligations and deadlines" },
  { num: 4, title: "Assign", desc: "Route tasks to the right teams" },
  { num: 5, title: "Track", desc: "Monitor compliance to completion" },
];

const features = [
  { icon: Zap, title: "Live Detection", desc: "Real-time monitoring of RBI circulars, master directions, and notifications as they're published." },
  { icon: Brain, title: "AI Extraction", desc: "Automatically extract obligations, deadlines, and compliance requirements from complex regulatory text." },
  { icon: MessageSquare, title: "Compliance Chat", desc: "Ask questions about any regulation and get instant, cited answers from your compliance knowledge base." },
  { icon: ListChecks, title: "Task Automation", desc: "Auto-generate compliance tasks, assign to departments, and track completion with smart deadlines." },
  { icon: Search, title: "Gap Analysis", desc: "Identify compliance gaps across your organization with AI-powered assessment and recommendations." },
  { icon: Globe, title: "Multi-Regulator", desc: "Expand beyond RBI to SEBI, IRDAI, and other regulators with the same powerful intelligence engine." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-pampas">
      <header className="bg-pampas border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-crail" />
            <span className="text-lg font-semibold text-foreground tracking-tight">RegIntel</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-cloudy hover:text-foreground transition-colors duration-150">Features</a>
            <a href="#how-it-works" className="text-sm text-cloudy hover:text-foreground transition-colors duration-150">How It Works</a>
            <a href="#pricing" className="text-sm text-cloudy hover:text-foreground transition-colors duration-150">Pricing</a>
          </nav>
          <Link
            href="/chat"
            className="bg-crail text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#A8502F] transition-colors duration-150"
          >
            Get Early Access
          </Link>
        </div>
      </header>

      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block border border-cloudy text-cloudy text-xs px-3 py-1 rounded-full mb-6">
            RBI Compliance Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight mb-6">
            Stay Ahead of
            <br />
            Every RBI Circular.
          </h1>
          <p className="text-base text-cloudy max-w-md mx-auto mb-10">
            AI-powered platform that monitors, analyzes, and converts RBI regulations into actionable compliance tasks - automatically.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-crail text-white text-sm font-medium px-6 py-3 rounded-md hover:bg-[#A8502F] transition-colors duration-150"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/chat"
              className="bg-white border border-border-subtle text-foreground text-sm font-medium px-6 py-3 rounded-md hover:bg-pampas transition-colors duration-150"
            >
              Try Compliance Chat
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-center divide-x divide-cloudy/40">
          {stats.map((stat) => (
            <div key={stat.label} className="px-8 text-center">
              <p className="text-xl font-semibold text-crail">{stat.value}</p>
              <p className="text-xs text-cloudy mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-background py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium tracking-widest text-cloudy uppercase mb-4 text-center">
            How It Works
          </p>
          <h2 className="text-2xl font-semibold text-foreground text-center mb-16 tracking-tight">
            From Detection to Compliance in Minutes
          </h2>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="hidden md:block absolute top-5 left-[10%] right-[10%] border-t border-dashed border-cloudy" />
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center relative z-10">
                <div className="h-10 w-10 rounded-full border-2 border-crail text-crail flex items-center justify-center text-sm font-semibold bg-background mb-3">
                  {step.num}
                </div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-cloudy mt-1 max-w-[120px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-pampas py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-medium tracking-widest text-cloudy uppercase mb-4 text-center">
            Features
          </p>
          <h2 className="text-2xl font-semibold text-foreground text-center mb-12 tracking-tight">
            Everything You Need for Regulatory Compliance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-background border border-border-subtle rounded-xl p-6">
                <f.icon className="h-5 w-5 text-crail mb-4" />
                <p className="text-sm font-semibold text-foreground mb-2">{f.title}</p>
                <p className="text-sm text-cloudy leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-pampas border-t border-border-subtle py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-crail" />
            <span className="text-sm font-semibold text-foreground">RegIntel</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-cloudy hover:text-foreground transition-colors duration-150">Privacy</a>
            <a href="#" className="text-xs text-cloudy hover:text-foreground transition-colors duration-150">Terms</a>
            <a href="#" className="text-xs text-cloudy hover:text-foreground transition-colors duration-150">Contact</a>
          </div>
          <p className="text-xs text-cloudy">© 2026 RegIntel AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
