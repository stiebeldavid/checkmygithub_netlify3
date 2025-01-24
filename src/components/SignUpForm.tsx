import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";

interface SignUpFormProps {
  currentRepoUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOption?: string;
}

const SignUpForm = ({ currentRepoUrl, open, onOpenChange, selectedOption }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('Signups')
        .insert([{ 
          email, 
          github_url: currentRepoUrl,
          option_chosen: selectedOption || 'basic' 
        }]);

      if (error) throw error;

      const { error: notifyError } = await supabase.functions.invoke('notify-signup', {
        body: { 
          userEmail: email,
          repoUrl: currentRepoUrl,
          pricingOption: selectedOption || 'basic'
        }
      });

      if (notifyError) {
        console.error('Error sending notification:', notifyError);
      }

      toast.success("Thanks for signing up! We'll be in touch soon.");
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving signup:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exampleIssues = [
    "🔑 Found exposed AWS access key in commit history",
    "⚠️ Dependencies with known vulnerabilities detected",
    "🔒 Insecure authentication implementation found",
    "🚨 Hardcoded credentials in configuration files",
    "⚡ Potential SQL injection vulnerabilities",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <h2 className="text-lg font-semibold">
            Sign up to claim 40% off the price once we go live!
          </h2>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">Example issues we detect:</p>
              <ul className="space-y-2">
                {exampleIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpForm;