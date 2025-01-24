import { Shield, Key, Lock, AlertTriangle } from "lucide-react";

const SecurityBestPractices = () => (
  <section className="py-16 bg-gray-900/50">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Security Best Practices</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-primary/50 transition-all">
          <Shield className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Control</h3>
          <p className="text-gray-400">Never share full repository access. Use read-only permissions for security tools.</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-primary/50 transition-all">
          <Key className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Token Management</h3>
          <p className="text-gray-400">Regularly review and rotate access tokens. Monitor for exposed credentials.</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-primary/50 transition-all">
          <Lock className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Least Privilege</h3>
          <p className="text-gray-400">Follow the principle of least privilege. Grant minimal necessary permissions.</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-primary/50 transition-all">
          <AlertTriangle className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Regular Audits</h3>
          <p className="text-gray-400">Monitor access logs regularly. Review security settings periodically.</p>
        </div>
      </div>
    </div>
  </section>
);

export default SecurityBestPractices;