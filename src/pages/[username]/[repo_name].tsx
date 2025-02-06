
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import RepoChecker from "@/components/RepoChecker";

const AutoScanPage = () => {
  const { username, repo_name } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!username || !repo_name) {
      toast.error("Invalid repository URL");
      navigate("/");
      return;
    }

    // Construct GitHub URL and trigger scan via RepoChecker
    const repoUrl = `https://github.com/${username}/${repo_name}`;
    
    // Use a small delay to ensure the RepoChecker component is mounted
    const timer = setTimeout(() => {
      const event = new CustomEvent("auto-scan", { detail: { repoUrl } });
      window.dispatchEvent(event);
    }, 100);

    return () => clearTimeout(timer);
  }, [username, repo_name, navigate]);

  return (
    <>
      <Toaster />
      <RepoChecker initialRepoUrl={`https://github.com/${username}/${repo_name}`} />
    </>
  );
};

export default AutoScanPage;
