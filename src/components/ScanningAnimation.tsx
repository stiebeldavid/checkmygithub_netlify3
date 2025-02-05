import { Shield, Lock, Search, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

const ScanningAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { icon: Shield, text: "Initializing security scan..." },
    { icon: Search, text: "Analyzing repository structure..." },
    { icon: Lock, text: "Checking for exposed secrets..." },
    { icon: CheckCircle2, text: "Validating security practices..." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentStep(Math.floor((progress / 100) * steps.length));
  }, [progress]);

  return (
    <div className="w-full max-w-md mx-auto space-y-8 p-6">
      <div className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          {steps.map((Step, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 transform ${
                index === currentStep
                  ? "scale-100 opacity-100"
                  : "scale-75 opacity-0"
              }`}
            >
              <Step.icon
                className={`w-full h-full animate-spin-slow ${
                  index === currentStep
                    ? "text-primary animate-pulse"
                    : "text-gray-400"
                }`}
              />
            </div>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-gray-200 min-h-[2rem] transition-all duration-300 animate-pulse">
          {steps[currentStep]?.text}
        </h3>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2 animate-pulse" />
        <p className="text-sm text-gray-400 text-center animate-pulse">
          {progress}% Complete
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index <= currentStep ? "bg-primary animate-pulse" : "bg-gray-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ScanningAnimation;