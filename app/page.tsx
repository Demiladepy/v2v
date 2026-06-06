"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  ArrowRight,
  ShieldCheck,
  Coins,
  Lock,
  CheckCircle2,
  Menu,
  X,
  Command,
  Cpu,
  Layers,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";

const FLOAT_VARIANTS: Variants = {
  animate: (custom: number) => ({
    y: [0, -20, 0],
    x: [0, custom * 10, 0],
    transition: { duration: 6 + custom, repeat: Infinity, ease: "easeInOut" },
  }),
};

const BENTO_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeUseCase, setActiveUseCase] = useState<number | null>(0);
  const fullText =
    "Command your operations with voice. We handle the negotiation, execution, and instant settlement.";

  const typingContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const typingChar = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
  };

  const USE_CASES = [
    {
      title: "Retail Checkout",
      desc: "Cut checkout friction by 80%. Speak the order, generate the invoice, and get paid instantly.",
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800&h=400",
    },
    {
      title: "B2B Wholesale",
      desc: "Negotiate and settle bulk orders over voice, backed by undeniable audit trails.",
      img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800&h=400",
    },
    {
      title: "Freelance Billing",
      desc: "Generate custom billing links on the fly without ever opening a spreadsheet.",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800&h=400",
    },
    {
      title: "Event Ticketing",
      desc: "Process walk-in ticket sales via voice commands instantly at the gate.",
      img: "https://images.unsplash.com/photo-1540039155733-d7696d4eb98e?auto=format&fit=crop&q=80&w=800&h=400",
    },
    {
      title: "Inventory Restock",
      desc: "Reorder supplies vocally while auditing the stockroom, automatically updating the master ledger.",
      img: "https://images.unsplash.com/photo-1587293852726-0d614afa0bc8?auto=format&fit=crop&q=80&w=800&h=400",
    },
    {
      title: "Customer Refunds",
      desc: "Authorize secure partial or full refunds vocally while staying engaged with the customer.",
      img: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&q=80&w=800&h=400",
    },
  ];

  return (
    <main className="flex-1 flex flex-col bg-[var(--cream-bg)] min-h-dvh font-sans w-full overflow-clip relative text-foreground">
      {/* 1. Global Header */}
      <header className="sticky top-0 z-50 w-full bg-[var(--cream-bg)]/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand">
            <Mic className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tighter text-foreground">
              V2V
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              How it Works
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              Use Cases
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <button className="px-5 py-2 text-sm font-semibold bg-brand text-primary-foreground rounded-full hover:bg-brand/90 transition-all shadow-sm active:scale-95">
                Login
              </button>
            </Link>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-b border-border/40 bg-[var(--cream-bg)] overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 gap-4">
                <a
                  href="#how-it-works"
                  className="text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it Works
                </a>
                <a
                  href="#features"
                  className="text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#use-cases"
                  className="text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Use Cases
                </a>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full mt-2 px-5 py-2.5 text-sm font-semibold bg-brand text-primary-foreground rounded-xl">
                    Login
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section */}
      <section className="w-full relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* Subtle Floating Elements */}
        <motion.div
          custom={1}
          variants={FLOAT_VARIANTS}
          animate="animate"
          className="absolute top-[20%] left-[10%] opacity-20 pointer-events-none text-brand"
        >
          <Coins className="w-16 h-16" />
        </motion.div>
        <motion.div
          custom={-1}
          variants={FLOAT_VARIANTS}
          animate="animate"
          className="absolute bottom-[25%] right-[12%] opacity-20 pointer-events-none text-success"
        >
          <ShieldCheck className="w-20 h-20" />
        </motion.div>
        <motion.div
          custom={2}
          variants={FLOAT_VARIANTS}
          animate="animate"
          className="absolute top-[30%] right-[15%] opacity-15 pointer-events-none text-brand-dark"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        {/* Ambient background blur */}
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto z-10 flex flex-col items-center text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 p-2.5 bg-white/60 backdrop-blur-md rounded-full border border-brand/10 shadow-sm inline-flex items-center gap-2"
          >
            <span className="flex w-2.5 h-2.5 rounded-full bg-success animate-pulse ml-1" />
            <span className="text-xs font-bold text-brand uppercase tracking-widest pr-2">
              V2V Live
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-foreground font-serif leading-[1.05] mb-6"
          >
            The Vocal Interface <br className="hidden md:block" />
            <span className="text-brand italic">for Modern Finance.</span>
          </motion.h1>

          <div className="h-20 md:h-16 flex items-center justify-center mb-10 max-w-2xl mx-auto">
            <motion.p
              variants={typingContainer}
              initial="hidden"
              animate="visible"
              className="text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed"
            >
              {fullText.split("").map((char, index) => (
                <motion.span key={index} variants={typingChar}>
                  {char}
                </motion.span>
              ))}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-[2px] h-[1em] bg-brand ml-1 align-middle"
              />
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto py-4 px-8 bg-brand hover:bg-brand/90 text-primary-foreground font-bold text-lg rounded-full flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1 active:scale-95 group">
                Enter Dashboard{" "}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. How It Works (Sticky Split Screen) */}
      <section id="how-it-works" className="w-full relative bg-white py-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row relative">
          {/* Left Side: Sticky Image Area */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-0 h-[50vh] lg:h-screen flex items-center justify-center p-6 lg:p-12 border-r border-border/20 bg-[var(--cream-bg)]/30">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative w-full max-w-md aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1596742578443-7682ef5251cd?auto=format&fit=crop&q=80&w=1000"
                alt="Voice Interface"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </div>

          {/* Right Side: Scrolling Steps */}
          <div className="w-full lg:w-1/2 py-20 lg:py-40 px-6 lg:px-20 flex flex-col gap-32">
            <div className="mb-[-50px]">
              <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-brand">
                From Voice to Value.
              </h2>
            </div>

            {[
              {
                num: "01",
                title: "Command",
                desc: "Just hold the mic and speak naturally. Whether it's generating an invoice or checking a balance, V2V understands context.",
                icon: Mic,
              },
              {
                num: "02",
                title: "AI Processing",
                desc: "Our custom NLP models extract exact financial parameters and map them to secure backend actions instantly.",
                icon: Cpu,
              },
              {
                num: "03",
                title: "Instant Settlement",
                desc: "Invoices are generated via Paystack, and ledgers are updated in real-time. No manual data entry required.",
                icon: CheckCircle2,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-20%", once: true }}
                transition={{ duration: 0.6 }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-brand-light tracking-widest">
                    {step.num}
                  </span>
                  <div className="w-[2px] h-full bg-brand/10 mt-4 rounded-full" />
                </div>
                <div className="flex-1 pb-10">
                  <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 font-sans tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Features (Asymmetric Bento Grid) */}
      <section
        id="features"
        className="w-full py-32 px-6 bg-[var(--cream-bg)] relative"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-foreground mb-6">
              Engineered for Speed.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every component of the platform is built to shave seconds off your
              operational workflows.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]"
          >
            {/* Bento Item 1 (Wide) */}
            <motion.div
              variants={BENTO_ITEM_VARIANTS}
              className="md:col-span-2 bg-white rounded-[2.5rem] p-10 border border-border/30 shadow-sh-sm hover:shadow-sh-md transition-all relative overflow-hidden group"
            >
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-brand/5 rounded-tl-[100%] transition-transform group-hover:scale-110" />
              <div className="relative z-10 h-full flex flex-col justify-center">
                <Command className="w-10 h-10 text-brand mb-6" />
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  Vocal Precision
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  Flawlessly translates complex, multi-variable requests into
                  structured financial payloads, eliminating human input error
                  entirely.
                </p>
              </div>
            </motion.div>

            {/* Bento Item 2 (Square) */}
            <motion.div
              variants={BENTO_ITEM_VARIANTS}
              className="md:col-span-1 bg-brand text-primary-foreground rounded-[2.5rem] p-10 border border-brand-dark shadow-sh-sm hover:shadow-sh-md transition-all relative overflow-hidden group"
            >
              <div className="relative z-10 h-full flex flex-col justify-center">
                <CheckCircle2 className="w-10 h-10 text-brand-light mb-6" />
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  Real-Time Execution
                </h3>
                <p className="text-primary-foreground/80 text-lg leading-relaxed">
                  Integrated flows generate secure payment links in under 2
                  seconds.
                </p>
              </div>
            </motion.div>

            {/* Bento Item 3 (Wide Full) */}
            <motion.div
              variants={BENTO_ITEM_VARIANTS}
              className="md:col-span-3 bg-white rounded-[2.5rem] p-10 border border-border/30 shadow-sh-sm hover:shadow-sh-md transition-all flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden group"
            >
              <div className="flex-1">
                <ShieldCheck className="w-10 h-10 text-brand mb-6" />
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  Immutable Ledgers
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                  Every transaction is cryptographically logged with idempotent
                  checks, ensuring operational safety and protecting against
                  double-billing or accidental commands.
                </p>
              </div>
              <div className="flex-1 w-full h-full relative min-h-[150px] bg-muted/30 rounded-3xl border border-border/50 overflow-hidden flex items-center justify-center">
                <pre className="text-[10px] sm:text-xs text-muted-foreground/60 p-4 font-mono">
                  {`{
  "id": "led_8f92j",
  "intent": "CREATE_INVOICE",
  "amount": 15000,
  "status": "SECURE",
  "hash": "0x9f8..."
}`}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Expanded Use Cases (Interactive Accordion) */}
      <section
        id="use-cases"
        className="w-full py-32 px-6 bg-white border-y border-border/20"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-foreground mb-4">
              Built for Every Workflow.
            </h2>
            <p className="text-xl text-muted-foreground">
              Select a workflow to see how voice accelerates the process.
            </p>
          </div>

          <div className="border-t border-border/40">
            {USE_CASES.map((uc, i) => (
              <div
                key={i}
                className="border-b border-border/40 overflow-hidden group"
              >
                <button
                  onClick={() =>
                    setActiveUseCase(activeUseCase === i ? null : i)
                  }
                  className="w-full py-8 flex items-center justify-between text-left focus:outline-none"
                >
                  <h3
                    className={`text-2xl md:text-4xl font-serif font-bold transition-colors ${activeUseCase === i ? "text-brand" : "text-foreground group-hover:text-brand/70"}`}
                  >
                    {uc.title}
                  </h3>
                  <div
                    className={`w-10 h-10 rounded-full border border-border/50 flex items-center justify-center transition-transform duration-300 ${activeUseCase === i ? "rotate-45 bg-brand text-white border-brand" : "group-hover:bg-muted"}`}
                  >
                    <span className="text-2xl font-light leading-none mb-1">
                      +
                    </span>
                  </div>
                </button>
                <AnimatePresence>
                  {activeUseCase === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="pb-8 flex flex-col md:flex-row gap-8 items-center">
                        <p className="text-lg text-muted-foreground leading-relaxed flex-1">
                          {uc.desc}
                        </p>
                        <div className="flex-1 w-full max-w-md h-48 rounded-3xl overflow-hidden relative shadow-lg">
                          <div className="absolute inset-0 bg-brand/20 mix-blend-color z-10 pointer-events-none" />
                          <img
                            src={uc.img}
                            alt={uc.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Integration & Security (Infinite Marquee) */}
      <section className="w-full py-24 bg-foreground text-background overflow-hidden relative flex flex-col items-center">
        <div className="text-center mb-12 px-6 z-10 relative">
          <Layers className="w-12 h-12 text-brand-light mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 font-serif">
            Enterprise-Grade Integrations.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Plugs directly into your existing financial stack. Every voice
            command is cryptographically verified before touching the ledger.
          </p>
        </div>

        <div className="w-full relative flex whitespace-nowrap overflow-hidden py-8 before:absolute before:left-0 before:top-0 before:w-32 before:h-full before:bg-gradient-to-r before:from-foreground before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:w-32 after:h-full after:bg-gradient-to-l after:from-foreground after:to-transparent after:z-10">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex items-center gap-16 px-8 opacity-50 font-bold text-3xl tracking-widest uppercase"
          >
            <span>PAYSTACK</span>
            <span>•</span>
            <span>STRIPE</span>
            <span>•</span>
            <span>AWS SECURE</span>
            <span>•</span>
            <span>MONGODB</span>
            <span>•</span>
            <span>PLAID</span>
            <span>•</span>
            <span>PAYSTACK</span>
            <span>•</span>
            <span>STRIPE</span>
            <span>•</span>
            <span>AWS SECURE</span>
            <span>•</span>
            <span>MONGODB</span>
            <span>•</span>
            <span>PLAID</span>
          </motion.div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="w-full bg-[var(--brand-dark)] text-white pt-24 pb-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="max-w-md">
            <h2 className="text-4xl font-black tracking-tighter mb-6 font-serif">
              Ready to transform your workflow?
            </h2>
            <Link href="/login">
              <button className="py-4 px-8 bg-white text-brand-dark font-bold text-lg rounded-full flex items-center gap-3 transition-all shadow-xl hover:-translate-y-1 active:scale-95 group">
                Get Started Now{" "}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          <div className="flex gap-12 sm:gap-24 text-sm font-medium">
            <div className="flex flex-col gap-4">
              <span className="text-white/50 uppercase tracking-widest text-xs font-bold mb-2">
                Product
              </span>
              <a href="#" className="hover:text-white/70 transition-colors">
                Features
              </a>
              <a href="#" className="hover:text-white/70 transition-colors">
                Integrations
              </a>
              <a href="#" className="hover:text-white/70 transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-white/50 uppercase tracking-widest text-xs font-bold mb-2">
                Company
              </span>
              <a href="#" className="hover:text-white/70 transition-colors">
                About Us
              </a>
              <a href="#" className="hover:text-white/70 transition-colors">
                Careers
              </a>
              <a href="#" className="hover:text-white/70 transition-colors">
                Legal
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-white/40">
          <p>© 2026 V2V. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/70 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
