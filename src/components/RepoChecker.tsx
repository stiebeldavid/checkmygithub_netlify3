import { useState, useRef } from "react";
import { Search, Shield, AlertTriangle, Lock, CheckCircle, ArrowDown } from "lucide-react";
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

  const FeatureCards = () => (
    <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <Shield className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Vulnerability Detection</h3>
        <p className="text-gray-400">Scan your AI-generated code for potential security risks and vulnerabilities</p>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <Lock className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">API Key Protection</h3>
        <p className="text-gray-400">Identify exposed API keys and secrets in your codebase</p>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <CheckCircle className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
        <p className="text-gray-400">Get actionable recommendations to improve your app's security</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-4">
            CheckMyGitHub
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Protect your AI-built applications from vulnerabilities, exposed API keys, and security issues
          </p>

          <div className="max-w-2xl mx-auto mb-16">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="url"
                  placeholder="Enter GitHub repository URL"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="pl-10 bg-gray-800 text-white placeholder:text-gray-400 border-gray-700 w-full"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? <LoadingSpinner /> : "Scan Repository"}
              </Button>
            </form>
          </div>

          {!repoData && !loading && !notFoundOrPrivate && <FeatureCards />}
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
                  <li>Give access to check-my-git-hub</li>
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
                      <span className="flex items-center justify-center gap-2 flex-wrap px-4">
                        <span>Sign up to have CheckMyGitHub check your repo automatically</span>
                        <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform shrink-0" />
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div ref={signUpRef} className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <SignUpForm />
              <FeatureCards />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoChecker;
