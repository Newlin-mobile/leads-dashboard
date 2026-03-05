import Link from 'next/link';
import { getCurrentUser, PLAN_LIMITS } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { StatsCard, ProjectsStatsCard } from '@/components/StatsCard';
import { ProjectCard } from '@/components/ProjectCard';
import db from '@/lib/db';
import { Plus, TrendingUp, Users, Activity } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // This should not happen due to layout protection
  }

  // Get user's projects
  const projects = db.prepare(`
    SELECT * FROM projects 
    WHERE user_id = ? AND is_active = 1
    ORDER BY created_at DESC 
    LIMIT 3
  `).all(user.id) as any[];

  // Get stats
  const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND is_active = 1').get(user.id) as { count: number };
  
  // Plan info
  const planLimits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || 'there'}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's what's happening with your projects.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProjectsStatsCard 
          count={totalProjects.count}
          change={{
            value: '12%',
            type: 'increase',
            period: 'from last month'
          }}
        />
        
        <StatsCard
          title="Active Monitors"
          value={totalProjects.count * 3} // Example calculation
          icon={Activity}
          color="green"
          description="Currently monitoring"
        />
        
        <StatsCard
          title="Uptime"
          value="99.9%"
          icon={TrendingUp}
          color="blue"
          description="Last 30 days"
        />
        
        <StatsCard
          title="Plan Usage"
          value={`${totalProjects.count}/${planLimits.projects}`}
          icon={Users}
          color="purple"
          description={`${user.plan} plan`}
        />
      </div>

      {/* Plan Usage Warning */}
      {totalProjects.count >= planLimits.projects * 0.8 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Plan Limit Warning
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You're using {totalProjects.count} of {planLimits.projects} projects on your {user.plan} plan.
                  {totalProjects.count === planLimits.projects && (
                    <span className="font-medium"> You've reached your limit.</span>
                  )}
                </p>
              </div>
              {totalProjects.count === planLimits.projects && (
                <div className="mt-4">
                  <Link href="/dashboard/billing">
                    <Button size="sm">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
          <Link href="/dashboard/projects" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Get started by creating your first project. It only takes a few seconds.
            </p>
            <Link href="/dashboard/projects/new">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/projects/new" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Plus className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">New Project</span>
          </Link>
          
          <Link href="/dashboard/settings" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Account Settings</span>
          </Link>
          
          <a href="#" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">View Documentation</span>
          </a>
          
          <a href="#" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">View Analytics</span>
          </a>
        </div>
      </div>
    </div>
  );
}