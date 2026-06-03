import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full min-h-dvh relative overflow-hidden bg-background">
      {/* Background ambient glow matching velvet aesthetic */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-64 h-64 bg-brand-light/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center justify-center space-y-8 z-10 w-full">
        {/* Logo Icon */}
        <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center shadow-sh-lg mb-4">
          <Mic className="w-10 h-10 text-cream-bg stroke-[2.5]" style={{ color: "#FDFBF7" }} />
        </div>

        {/* Hero Copy */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Voice to Value
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
            The autonomous merchant protocol. Turn spoken requests into instant financial settlement.
          </p>
        </div>

        {/* Call to Action */}
        <div className="w-full pt-8 flex flex-col gap-4">
          <Link href="/dashboard" className="w-full">
            <button className="w-full py-4 px-6 bg-foreground hover:bg-foreground/90 text-background font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sh-md">
              Enter Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          
          <p className="text-xs text-center text-muted-foreground font-medium tracking-wide">
            POWERED BY AETHANA AI & GROQ
          </p>
        </div>
      </div>
    </main>
  );
}
