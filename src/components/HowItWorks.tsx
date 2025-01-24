import { Search, Zap, CheckCircle } from "lucide-react";

const HowItWorks = () => (
  <section className="py-16 bg-gray-800/30">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">1. Connect Repository</h3>
          <p className="text-gray-400">Enter your GitHub repository URL and grant read-only access to CheckMyGitHub.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">2. Automated Scan</h3>
          <p className="text-gray-400">Our AI-powered tools scan your codebase for security vulnerabilities and best practices.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">3. Get Results</h3>
          <p className="text-gray-400">Receive detailed reports and actionable recommendations to improve your code security.</p>
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;