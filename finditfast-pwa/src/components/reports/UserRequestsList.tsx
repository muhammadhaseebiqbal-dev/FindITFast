import React, { useState, useEffect } from 'react';
import { UserRequestService } from '../../services/userRequestService';
import type { UserRequest } from '../../types';

interface UserRequestsListProps {
  className?: string;
}

export const UserRequestsList: React.FC<UserRequestsListProps> = ({ className = '' }) => {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserRequest['status'] | 'all'>('all');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const allRequests = filter === 'all' 
        ? await UserRequestService.getAll()
        : await UserRequestService.getByStatus(filter as UserRequest['status']);
      setRequests(allRequests);
    } catch (error) {
      console.error('Error loading user requests:', error);
      setError('Failed to load user requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: UserRequest['status']) => {
    try {
      await UserRequestService.updateStatus(requestId, newStatus, 'store-owner');
      await loadRequests(); // Reload requests
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadRequests}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">User Requests</h3>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as UserRequest['status'] | 'all')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All ({requests.length})</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="implemented">Implemented</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No user requests found</p>
          <p className="text-sm text-gray-400 mt-1">
            User requests will appear here when customers submit them
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {request.requestType === 'new_store' ? 'Store' : 'Item'}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{request.title}</h4>
                  
                  <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                  
                  {request.requestType === 'new_store' && request.storeName && (
                    <p className="text-sm text-gray-500">
                      <strong>Store:</strong> {request.storeName}
                      {request.address && <span> • {request.address}</span>}
                    </p>
                  )}
                  
                  {request.requestType === 'new_item' && request.itemName && (
                    <p className="text-sm text-gray-500">
                      <strong>Item:</strong> {request.itemName}
                      {request.category && <span> • {request.category}</span>}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </span>
                    {request.userEmail && (
                      <span>by {request.userEmail}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setExpandedRequest(
                      expandedRequest === request.id ? null : request.id
                    )}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${
                        expandedRequest === request.id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {expandedRequest === request.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'reviewed')}
                          className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                        >
                          Mark as Reviewed
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'implemented')}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Mark as Implemented
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'reviewed' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'implemented')}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Mark as Implemented
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
