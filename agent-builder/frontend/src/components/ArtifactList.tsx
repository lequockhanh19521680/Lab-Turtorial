import React from 'react'
import { Artifact } from '../store/slices/projectsSlice'
import { 
  FileText, 
  Code, 
  ExternalLink, 
  Download,
  TestTube,
  Eye
} from 'lucide-react'

interface ArtifactListProps {
  artifacts: Artifact[]
}

const ArtifactList: React.FC<ArtifactListProps> = ({ artifacts }) => {
  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'SRS_DOCUMENT':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'SOURCE_CODE':
        return <Code className="h-5 w-5 text-green-500" />
      case 'DEPLOYMENT_URL':
        return <ExternalLink className="h-5 w-5 text-purple-500" />
      case 'TEST_REPORT':
        return <TestTube className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getArtifactTypeLabel = (type: string) => {
    switch (type) {
      case 'SRS_DOCUMENT':
        return 'Requirements Document'
      case 'SOURCE_CODE':
        return 'Source Code'
      case 'DEPLOYMENT_URL':
        return 'Live Application'
      case 'TEST_REPORT':
        return 'Test Report'
      default:
        return type
    }
  }

  const getArtifactTypeColor = (type: string) => {
    switch (type) {
      case 'SRS_DOCUMENT':
        return 'bg-blue-100 text-blue-800'
      case 'SOURCE_CODE':
        return 'bg-green-100 text-green-800'
      case 'DEPLOYMENT_URL':
        return 'bg-purple-100 text-purple-800'
      case 'TEST_REPORT':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleArtifactClick = (artifact: Artifact) => {
    if (artifact.artifactType === 'DEPLOYMENT_URL') {
      window.open(artifact.location, '_blank')
    } else if (artifact.location.startsWith('http')) {
      window.open(artifact.location, '_blank')
    } else {
      // Handle file download or viewing
      console.log('View/Download artifact:', artifact)
    }
  }

  if (artifacts.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No artifacts generated yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Artifacts will appear here as agents complete their tasks
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {artifacts.map((artifact) => (
        <div
          key={artifact.artifactId}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                {getArtifactIcon(artifact.artifactType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {artifact.title || getArtifactTypeLabel(artifact.artifactType)}
                  </h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getArtifactTypeColor(artifact.artifactType)}`}>
                    v{artifact.version}
                  </span>
                </div>
                
                {artifact.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {artifact.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>
                    Created {new Date(artifact.createdAt).toLocaleString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${getArtifactTypeColor(artifact.artifactType)}`}>
                    {getArtifactTypeLabel(artifact.artifactType)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {artifact.artifactType === 'DEPLOYMENT_URL' ? (
                <button
                  onClick={() => handleArtifactClick(artifact)}
                  className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Visit</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleArtifactClick(artifact)}
                    className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleArtifactClick(artifact)}
                    className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ArtifactList