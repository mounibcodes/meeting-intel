import Link from "next/link";
import { 
  Mic, 
  FileText, 
  Brain, 
  Mail, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl rounded-2xl border-2 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="px-6">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                <div className="w-9 h-9 bg-red-600 rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center border-2 border-red-500">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">MeetingIntel</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                  Pricing
                </Link>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="font-semibold">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 shadow-md font-bold rounded-lg px-4">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-32 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4 fill-red-600" />
            <span className="tracking-tight">AI-Powered Meeting Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 max-w-5xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both delay-100">
            Never Miss a <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Follow-Up Again</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both delay-200">
            Record meetings, get instant transcriptions, AI summaries, 
            and <span className="text-foreground font-semibold">auto-generated follow-up emails</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both delay-300">
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-8 text-lg bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20 rounded-xl gap-2 font-bold transition-all hover:scale-105">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 rounded-xl gap-2 font-semibold hover:bg-muted/50 transition-all hover:scale-105">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both delay-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>2 hours free recording</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-zinc-50/50 border-y border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-5xl mb-6 transform hover:scale-110 transition-transform duration-300">😩</div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Messy Notes?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Stop scrambling to take notes while trying to stay engaged in the conversation.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-5xl mb-6 transform hover:scale-110 transition-transform duration-300">😰</div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Missing Action Items?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Forgotten follow-ups cost you deals and damage important relationships.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="text-5xl mb-6 transform hover:scale-110 transition-transform duration-300">⏰</div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Wasting Time?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Writing meeting summaries and follow-up emails takes hours every week.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32" id="features">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Smarter Meetings. <span className="text-red-600">Better Results.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From recording to follow-up, we've got you covered with enterprise-grade tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <Mic className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Real-Time Recording</h3>
                <p className="text-muted-foreground leading-relaxed">
                  One-click recording with crystal-clear audio capture directly in your browser.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Live Transcription</h3>
                <p className="text-muted-foreground leading-relaxed">
                  See words appear as they're spoken with 95%+ accuracy powered by Deepgram.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">AI Summaries</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get instant, accurate meeting summaries with key points highlighted automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Action Items</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automatically extract tasks with owners, deadlines, and priority levels.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Follow-Up Emails</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI-generated professional follow-up emails ready to send in one click.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border-2">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Sentiment Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Understand the mood and engagement level of your meetings at a glance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="container mx-auto px-4 text-center max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Start free, upgrade when you need more power.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-extrabold my-6">$0<span className="text-lg font-medium text-muted-foreground">/mo</span></div>
                <p className="text-muted-foreground mb-8 font-medium">2 hours/month</p>
                <Link href="/sign-up">
                  <Button variant="outline" className="w-full h-12 text-base font-semibold border-2">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.2)] relative scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                Most Popular
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2 text-red-600">Pro</h3>
                <div className="text-5xl font-extrabold my-6">$39<span className="text-lg font-medium text-muted-foreground">/mo</span></div>
                <p className="text-muted-foreground mb-8 font-medium">10 hours/month</p>
                <Link href="/sign-up">
                  <Button className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-sm hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-extrabold my-6">$99<span className="text-lg font-medium text-muted-foreground">/mo</span></div>
                <p className="text-muted-foreground mb-8 font-medium">50 hours/month</p>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full h-12 text-base font-semibold border-2">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-zinc-900 rounded-3xl p-12 md:p-24 text-center shadow-2xl relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent" />
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white tracking-tight relative z-10">
              Ready to Transform Your Meetings?
            </h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of professionals who never miss a follow-up.
            </p>
            <Link href="/sign-up" className="relative z-10">
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-zinc-900 hover:bg-zinc-100 hover:scale-105 transition-all font-bold rounded-xl gap-2">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-zinc-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">MeetingIntel</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-muted-foreground">
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 MeetingIntel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
