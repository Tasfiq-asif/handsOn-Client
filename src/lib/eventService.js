import api from './api';

const eventService = {
  // Get all events with optional filters
  async getEvents(filters = {}) {
    try {
      const response = await api.get('/api/events', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get a single event by ID
  async getEvent(id) {
    try {
      const response = await api.get(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  },

  // Create a new event
  async createEvent(eventData) {
    try {
      console.log('Creating event with data:', JSON.stringify(eventData));
      const response = await api.post('/api/events', eventData);
      console.log('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Update an event
  async updateEvent(id, updates) {
    try {
      console.log(`Sending update request for event ${id} with data:`, JSON.stringify(updates));
      console.log(`API endpoint: /api/events/${id}`);
      
      const response = await api.put(`/api/events/${id}`, updates);
      console.log(`Update response received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      console.error(`Error response:`, error.response?.data);
      throw error;
    }
  },

  // Delete an event
  async deleteEvent(id) {
    try {
      console.log(`Sending delete request for event ${id}`);
      console.log(`API endpoint: /api/events/${id}`);
      
      const response = await api.delete(`/api/events/${id}`);
      console.log(`Delete response received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      console.error(`Error response:`, error.response?.data);
      console.error(`Error status:`, error.response?.status);
      throw error;
    }
  },

  // Register for an event
  async registerForEvent(id) {
    try {
      const response = await api.post(`/api/events/${id}/register`);
      return response.data;
    } catch (error) {
      console.error(`Error registering for event ${id}:`, error);
      throw error;
    }
  },

  // Cancel event registration
  async cancelRegistration(id) {
    try {
      console.log(`Sending cancellation request for event ${id}`);
      console.log(`API endpoint: /api/events/${id}/cancel`);
      
      const response = await api.post(`/api/events/${id}/cancel`);
      console.log(`Cancellation response received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error canceling registration for event ${id}:`, error);
      console.error(`Error response:`, error.response?.data);
      console.error(`Error status:`, error.response?.status);
      throw error;
    }
  },

  // Check if user is registered for an event
  async checkRegistrationStatus(eventId) {
    try {
      console.log(`Checking registration status for event ${eventId}`);
      const response = await api.get(`/api/events/${eventId}/registration-status`);
      console.log(`Registration status response:`, response.data);
      return response.data.registered;
    } catch (error) {
      console.error(`Error checking registration status for event ${eventId}:`, error);
      return false;
    }
  },

  // Get user's registered events
  async getUserEvents(status) {
    try {
      const response = await api.get('/api/events/user/registered', {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  }
};

export default eventService; 