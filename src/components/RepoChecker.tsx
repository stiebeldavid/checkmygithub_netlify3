import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "./LoadingSpinner";
import RepoStats from "./RepoStats";
import SignUpForm from "./SignUpForm";
import { toast } from "sonner";

const RepoChecker = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
    if (!githubRegex.test(repoUrl)) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }

    setLoading(true);

    // Simulate API call with mock data
    setTimeout(() => {
      setRepoData({
        name: repoUrl.split("/").pop(),
        visibility: "public",
        stars: 128,
        forks: 23,
        description: "A sample repository for demonstration purposes.",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Check My GitHub
          </h1>
          <p className="text-xl text-gray-400">
            Scan your repository for vulnerabilities, exposed API keys, and security issues
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="url"
              placeholder="Enter GitHub repository URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="pl-10"
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
          <div className="space-y-8">
            <RepoStats repoData={repoData} />
            <SignUpForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoChecker;