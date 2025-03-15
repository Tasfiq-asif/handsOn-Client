import api from './api';

/**
 * Service for handling help request operations
 */
const helpRequestService = {
  /**
   * Get all help requests
   * @param {Object} filters - Optional filters for the help requests
   * @returns {Promise<Object>} - The help requests
   */
  async getHelpRequests(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      if (filters.urgency) queryParams.append('urgency', filters.urgency);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      
      const queryString = queryParams.toString();
      const endpoint = `/api/help-requests${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Fetching help requests from: ${endpoint}`);
      const response = await api.get(endpoint);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching help requests:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific help request by ID
   * @param {string} id - The help request ID
   * @returns {Promise<Object>} - The help request
   */
  async getHelpRequest(id) {
    try {
      console.log(`Fetching help request with ID: ${id}`);
      const response = await api.get(`/api/help-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching help request ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new help request
   * @param {Object} helpRequestData - The help request data
   * @returns {Promise<Object>} - The created help request
   */
  async createHelpRequest(helpRequestData) {
    try {
      console.log('Creating help request with data:', helpRequestData);
      const response = await api.post('/api/help-requests', helpRequestData);
      return response.data;
    } catch (error) {
      console.error('Error creating help request:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing help request
   * @param {string} id - The help request ID
   * @param {Object} helpRequestData - The updated help request data
   * @returns {Promise<Object>} - The updated help request
   */
  async updateHelpRequest(id, helpRequestData) {
    try {
      console.log(`Sending update request for help request ${id} with data:`, helpRequestData);
      console.log(`API endpoint: /api/help-requests/${id}`);
      const response = await api.put(`/api/help-requests/${id}`, helpRequestData);
      console.log('Update response received:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating help request ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a help request
   * @param {string} id - The help request ID
   * @returns {Promise<Object>} - The response
   */
  async deleteHelpRequest(id) {
    try {
      console.log(`Deleting help request with ID: ${id}`);
      const response = await api.delete(`/api/help-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting help request ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Offer help for a help request
   * @param {string} helpRequestId - The help request ID
   * @returns {Promise<Object>} - The response
   */
  async offerHelp(helpRequestId) {
    try {
      console.log(`Offering help for request with ID: ${helpRequestId}`);
      const response = await api.post(`/api/help-requests/${helpRequestId}/offer`);
      return response.data;
    } catch (error) {
      console.error(`Error offering help for request ${helpRequestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all helpers for a help request
   * @param {string} helpRequestId - The help request ID
   * @returns {Promise<Object>} - The helpers
   */
  async getHelpers(helpRequestId) {
    try {
      console.log(`Fetching helpers for request with ID: ${helpRequestId}`);
      const response = await api.get(`/api/help-requests/${helpRequestId}/helpers`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching helpers for request ${helpRequestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all comments for a help request
   * @param {string} helpRequestId - The help request ID
   * @returns {Promise<Object>} - The comments
   */
  async getComments(helpRequestId) {
    try {
      console.log(`Fetching comments for request with ID: ${helpRequestId}`);
      const response = await api.get(`/api/help-requests/${helpRequestId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for request ${helpRequestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Add a comment to a help request
   * @param {string} helpRequestId - The help request ID
   * @param {string} content - The comment content
   * @returns {Promise<Object>} - The created comment
   */
  async addComment(helpRequestId, content) {
    try {
      console.log(`Adding comment to request with ID: ${helpRequestId}`);
      const response = await api.post(`/api/help-requests/${helpRequestId}/comments`, { content });
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to request ${helpRequestId}:`, error);
      throw error;
    }
  }
};

export default helpRequestService; 