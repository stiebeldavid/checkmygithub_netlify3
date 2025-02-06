
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RepoFormProps {
  onSubmit: (repoUrl: string) => void;
  loading: boolean;
  initialValue?: string;
}

const RepoForm = ({ onSubmit, loading, initialValue }: RepoFormProps) => {
  const [repoUrl, setRepoUrl] = useState(initialValue || "");

  useEffect(() => {
    if (initialValue) {
      setRepoUrl(initialValue);
    }
  }, [initialValue]);

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
      }
    } catch (error) {
      console.error('Failed to send scan notification:', error);
    }

    onSubmit(repoUrl);
  };

  return (
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
  );
};

export default RepoForm;
