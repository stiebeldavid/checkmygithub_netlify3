import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import SignUpForm from "./SignUpForm";

interface PricingProps {
  onPlanSelect: (option: string) => void;
}

const Pricing = ({ onPlanSelect }: PricingProps) => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleOptionClick = (option: string) => {
    onPlanSelect(option);
  };

  return (
    <>
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
              <Button className="w-full" onClick={() => handleOptionClick("Basic Free Scan")}>Start Free</Button>
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
              <Button className="w-full" onClick={() => handleOptionClick("One-Time Deep Scan $20")}>Purchase Scan</Button>
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
              <Button className="w-full" onClick={() => handleOptionClick("Weekly Monitoring $10/month")}>Subscribe Now</Button>
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
              <Button className="w-full" onClick={() => handleOptionClick("Pro Level $25/month")}>Go Pro</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;