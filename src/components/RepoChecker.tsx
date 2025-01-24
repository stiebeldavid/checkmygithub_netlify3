import { useState } from "react";
import { Search, Shield, AlertTriangle, Lock, CheckCircle } from "lucide-react";
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

  const extractRepoInfo = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return null;
      
      // Clean up the repo name by removing any trailing slashes or .git
      const repoName = match[2].replace(/\.git\/?$/, '').replace(/\/$/, '');
      return { owner: match[1], repo: repoName };
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(repoUrl)) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }

    setLoading(true);
    setRepoData(null);

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
          toast.error("Repository not found. Please check the URL and make sure the repository exists.");
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
      });
    } catch (error) {
      console.error("Error scanning repository:", error);
      toast.error("Failed to fetch repository data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ... keep existing code (JSX for the component layout)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-4">
            AI App Security Scanner
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Protect your AI-built applications from vulnerabilities, exposed API keys, and security issues
          </p>
          
          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
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
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="url"
                  placeholder="Enter GitHub repository URL"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="pl-10 bg-gray-800 text-white placeholder:text-gray-400 border-gray-700"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <LoadingSpinner /> : "Scan Repository"}
              </Button>
            </form>

            {loading && (
              <div className="text-center py-12">
                <LoadingSpinner />
                <p className="mt-4 text-gray-400">Analyzing repository...</p>
              </div>
            )}

            {repoData && (
              <>
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
                  </div>
                )}
              </>
            )}
          </div>

          <div className="md:border-l md:border-gray-700 md:pl-8">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoChecker;
