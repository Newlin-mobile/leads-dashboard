import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { Button } from './ui/Button';
import { ExternalLink, MoreVertical, Trash2, Edit } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string | null;
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {project.name}
            </h3>
            {!project.is_active && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
          </div>
          
          {project.domain && (
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <ExternalLink className="w-4 h-4 mr-1" />
              <a
                href={project.domain.startsWith('http') ? project.domain : `https://${project.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 truncate"
              >
                {project.domain}
              </a>
            </div>
          )}
          
          <div className="mt-2 text-sm text-gray-500">
            Created {formatRelativeTime(project.created_at)}
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="flex-shrink-0 ml-4">
          <div className="relative group">
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ExternalLink className="w-4 h-4 mr-3" />
                  View Details
                </Link>
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(project)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => onDelete(project)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key preview */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">API Key:</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(project.api_key)}
          >
            Copy
          </Button>
        </div>
        <div className="mt-1 font-mono text-sm text-gray-800 break-all">
          {project.api_key.substring(0, 20)}...
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex space-x-3">
        <Link href={`/dashboard/projects/${project.id}`}>
          <Button size="sm" className="flex-1">
            View Project
          </Button>
        </Link>
      </div>
    </div>
  );
}