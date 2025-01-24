import { useState, useRef } from "react";
import { Search, Shield, AlertTriangle, Lock, CheckCircle, ArrowDown, Key, Code, GitBranch, Info, DollarSign, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "./LoadingSpinner";
import RepoStats from "./RepoStats";
import SignUpForm from "./SignUpForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RepoChecker = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<any>(null);
  const [notFoundOrPrivate, setNotFoundOrPrivate] = useState(false);
  const signUpRef = useRef<HTMLDivElement>(null);

  const scrollToSignUp = () => {
    signUpRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const extractRepoInfo = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return null;
      
      const repoName = match[2].replace(/\.git\/?$/, '').replace(/\/$/, '');
      return { owner: match[1], repo: repoName };
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(repoUrl)) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }

    // Send notification about URL scan attempt
    try {
      const { error } = await supabase.functions.invoke('notify-scan', {
        body: { repoUrl }
      });
      
      if (error) {
        console.error('Error sending scan notification:', error);
        // Don't show error to user as this is not critical for the main functionality
      }
    } catch (error) {
      console.error('Failed to send scan notification:', error);
      // Don't show error to user as this is not critical for the main functionality
    }

    setLoading(true);
    setRepoData(null);
    setNotFoundOrPrivate(false);

    try {
      const repoInfo = extractRepoInfo(repoUrl);
      if (!repoInfo) {
        toast.error("Could not parse repository URL. Please check the format.");
        return;
      }

      const { data: credentials, error: credentialsError } = await supabase.functions.invoke('get-github-secret');
      
      if (credentialsError || !credentials) {
        console.error("Error fetching GitHub credentials:", credentialsError);
        toast.error("Failed to authenticate with GitHub");
        return;
      }

      const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, {
        headers: {
          Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.secret}`)}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setNotFoundOrPrivate(true);
          return;
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      setRepoData({
        name: data.name,
        visibility: data.private ? "private" : "public",
        stars: data.stargazers_count,
        forks: data.forks_count,
        description: data.description,
        language: data.language,
        updated_at: data.updated_at,
        open_issues: data.open_issues_count,
        license: data.license,
        size: data.size,
      });
    } catch (error) {
      console.error("Error scanning repository:", error);
      toast.error("Failed to fetch repository data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getAccessSettingsUrl = (repoUrl: string) => {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return '';
    const [, owner, repo] = match;
    return `https://github.com/${owner}/${repo.replace(/\.git\/?$/, '')}/settings/access`;
  };

  const SecurityBestPractices = () => (
    <section className="py-16 bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Security Best Practices</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-primary/50 transition-all">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Control</h3>
            <p className="text-gray-400">Never share full repository access. Use read-only permissions for security tools.</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-primary/50 transition-all">
            <Key className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Token Management</h3>
            <p className="text-gray-400">Regularly review and rotate access tokens. Monitor for exposed credentials.</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-primary/50 transition-all">
            <Lock className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Least Privilege</h3>
            <p className="text-gray-400">Follow the principle of least privilege. Grant minimal necessary permissions.</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-primary/50 transition-all">
            <AlertTriangle className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Regular Audits</h3>
            <p className="text-gray-400">Monitor access logs regularly. Review security settings periodically.</p>
          </div>
        </div>
      </div>
    </section>
  );

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

  const Pricing = () => (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-2">Basic Scan</h3>
            <div className="text-3xl font-bold mb-4">Free</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Single repository scan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Basic security check</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>API key detection</span>
              </li>
            </ul>
            <Button className="w-full">Start Free</Button>
          </div>
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-2">One-Time Deep Scan</h3>
            <div className="text-3xl font-bold mb-4">$20</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Comprehensive scan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Detailed report</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Security recommendations</span>
              </li>
            </ul>
            <Button className="w-full">Purchase Scan</Button>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-xl border border-primary/50">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm mb-4">Popular</div>
            <h3 className="text-xl font-semibold mb-2">Weekly Monitoring</h3>
            <div className="text-3xl font-bold mb-4">$10/month</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Weekly automated scans</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Email notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Continuous monitoring</span>
              </li>
            </ul>
            <Button className="w-full">Subscribe Now</Button>
          </div>
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-2">Pro Level</h3>
            <div className="text-3xl font-bold mb-4">$25/month</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Up to 25 repositories</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Advanced analytics</span>
              </li>
            </ul>
            <Button className="w-full">Go Pro</Button>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6">
            Scan Your Repository
            <span className="text-primary"> for Free</span>
          </h1>
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-2xl font-semibold text-gray-300 mb-4">
              Protect your API keys and ensure your AI-generated code follows security best practices.
            </p>
            <p className="text-xl text-gray-300">
              Built specifically for developers using AI tools like Lovable, Bolt, Create, v0, Replit, Cursor and more.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mt-12 mb-16">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="url"
                  placeholder="Enter your GitHub repository URL"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="pl-10 bg-gray-800 text-white placeholder:text-gray-400 border-gray-700 w-full"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? <LoadingSpinner /> : "Scan Now - It's Free"}
              </Button>
            </form>
          </div>

          {!repoData && !loading && !notFoundOrPrivate && (
            <>
              <FeatureCards />
              <SecurityBestPractices />
              <HowItWorks />
              <Pricing />
            </>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">Analyzing repository...</p>
          </div>
        )}

        {notFoundOrPrivate && (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-yellow-400 mb-4">
                <Lock className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Repository Not Accessible</h3>
              </div>
              <p className="text-gray-300 mb-4">
                This repository either doesn't exist or is private. 
              </p>
              <div className="text-gray-400">
                <p className="mb-2">For a full security report, either:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    Grant read-only access to CheckMyGitHub
                    {repoUrl && (
                      <a 
                        href={getAccessSettingsUrl(repoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline"
                      >
                        Go to access page of your repo
                      </a>
                    )}
                  </li>
                  <li>Make the repository public (not recommended)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {repoData && (
          <div className="space-y-16">
            <div className="max-w-4xl mx-auto">
              <RepoStats repoData={repoData} />
              {repoData.visibility === 'public' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-semibold">Security Warning</h3>
                  </div>
                  <p className="text-gray-300">
                    This repository is public, which means anyone can access your code. Make sure you haven't committed any sensitive information like API keys or credentials.
                  </p>
                  <div className="mt-4 text-center px-4">
                    <Button
                      variant="outline"
                      onClick={scrollToSignUp}
                      className="text-primary hover:text-primary-foreground group whitespace-normal text-center w-full md:w-auto min-h-[auto] py-8"
                    >
                      <span className="flex items-center justify-center gap-2 flex-wrap px-2">
                        <span>Sign up to have CheckMyGitHub check your repo automatically</span>
                        <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform shrink-0" />
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div ref={signUpRef} className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <SignUpForm currentRepoUrl={repoUrl} />
              <FeatureCards />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoChecker;
