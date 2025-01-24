import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Thanks for signing up! We'll be in touch soon.");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  const exampleIssues = [
    "🔑 Found exposed AWS access key in commit history",
    "⚠️ Dependencies with known vulnerabilities detected",
    "🔒 Insecure authentication implementation found",
    "🚨 Hardcoded credentials in configuration files",
    "⚡ Potential SQL injection vulnerabilities",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Get the full security scan</h3>
        <p className="text-sm text-gray-400">
          Sign up to claim 40% off full security scan price once we go live.
        </p>
        
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
  );
};

export default SignUpForm;