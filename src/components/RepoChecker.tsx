import { useState, useRef } from "react";
import { Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";
import RepoStats from "./RepoStats";
import SignUpForm from "./SignUpForm";
import RepoForm from "./RepoForm";
import SecurityBestPractices from "./SecurityBestPractices";
import HowItWorks from "./HowItWorks";
import Pricing from "./Pricing";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RepoChecker = () => {
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<any>(null);
  const [notFoundOrPrivate, setNotFoundOrPrivate] = useState(false);
  const [currentRepoUrl, setCurrentRepoUrl] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

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

  const handleSubmit = async (repoUrl: string) => {
    setLoading(true);
    setRepoData(null);
    setNotFoundOrPrivate(false);
    setCurrentRepoUrl(repoUrl);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-2xl font-semibold text-gray-300 mb-4">
              Protect your API keys and ensure your AI-generated code follows security best practices.
            </p>
            <h1 className="text-5xl font-bold mb-6">
              Scan Your Repository
              <span className="text-primary"> for Free</span>
            </h1>
            <p className="text-xl text-gray-300">
              Built specifically for developers using AI tools like Lovable, Bolt, Create, v0, Replit, Cursor and more.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mt-12 mb-16">
            <RepoForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {!repoData && !loading && !notFoundOrPrivate && (
            <>
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
                    Grant read-only access to <a href="https://github.com/check-my-git-hub" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Check-My-Git-Hub</a>
                    {currentRepoUrl && (
                      <ul className="list-disc ml-6 mt-1">
                        <li>
                          <a 
                            href={getAccessSettingsUrl(currentRepoUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Click here to see your repo's access page
                          </a>
                        </li>
                      </ul>
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
                      onClick={() => setShowSignUp(true)}
                      className="text-primary hover:text-primary-foreground group whitespace-normal text-center w-full md:w-auto min-h-[auto] py-8"
                    >
                      <span className="flex items-center justify-center gap-2 flex-wrap px-2">
                        <span>Sign up to have CheckMyGitHub check your repo automatically</span>
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <SecurityBestPractices />
            </div>
          </div>
        )}
      </div>
      <SignUpForm 
        currentRepoUrl={currentRepoUrl} 
        open={showSignUp} 
        onOpenChange={setShowSignUp}
      />
    </div>
  );
};

export default RepoChecker;