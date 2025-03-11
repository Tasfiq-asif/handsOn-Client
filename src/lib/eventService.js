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
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update an event
  async updateEvent(id, updates) {
    try {
      const response = await api.put(`/api/events/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  },

  // Delete an event
  async deleteEvent(id) {
    try {
      const response = await api.delete(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
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
      const response = await api.post(`/api/events/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error canceling registration for event ${id}:`, error);
      throw error;
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