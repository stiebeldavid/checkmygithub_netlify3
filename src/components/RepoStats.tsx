import { Shield } from "lucide-react";

interface RepoStatsProps {
  repoData: {
    name: string;
    visibility: string;
    stars: number;
    forks: number;
    description: string;
  } | null;
}

const RepoStats = ({ repoData }: RepoStatsProps) => {
  if (!repoData) return null;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 shadow-xl border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">{repoData.name}</h2>
        <span className={`px-2 py-1 rounded-full text-xs ${
          repoData.visibility === 'public' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
        }`}>
          {repoData.visibility}
        </span>
      </div>
      
      <p className="text-gray-400 mb-4">{repoData.description}</p>
      
      <div className="flex gap-4">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span>{repoData.stars}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
          </svg>
          <span>{repoData.forks}</span>
        </div>
      </div>
    </div>
  );
};

export default RepoStats;