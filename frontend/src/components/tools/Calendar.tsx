'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '', description: '' });

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error('Error loading events:', e);
      }
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const addEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) return;

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate.toISOString().split('T')[0],
      time: newEvent.time,
      description: newEvent.description,
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', time: '', description: '' });
    setShowEventModal(false);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Generate calendar days
  const generateDays = () => {
    const days = [];
    const today = new Date();

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      days.push({ day, date, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      days.push({ day, date, isCurrentMonth: true, isToday });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ day, date, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateDays();

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xl font-semibold text-white">
            {monthNames[month]} {year}
          </div>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
        >
          Today
        </button>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Calendar Grid */}
        <div className="flex-1 bg-gray-900 rounded-xl p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(({ day, date, isCurrentMonth, isToday }, index) => {
              const dateEvents = getEventsForDate(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDate(date);
                    setShowEventModal(true);
                  }}
                  className={`
                    min-h-[80px] p-2 rounded-lg cursor-pointer transition border border-transparent
                    ${isCurrentMonth ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-800/30 text-gray-600'}
                    ${isToday ? 'ring-2 ring-green-500' : ''}
                    ${isSelected ? 'bg-green-600/20 border-green-500' : ''}
                  `}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-green-500' : isCurrentMonth ? 'text-white' : 'text-gray-600'}`}>
                    {day}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dateEvents.slice(0, 2).map((event, i) => (
                      <div
                        key={event.id}
                        className="text-xs bg-green-600/80 text-white px-1.5 py-0.5 rounded truncate"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dateEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dateEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Panel */}
        <div className="w-80 bg-gray-900 rounded-xl p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-white">
              {selectedDate ? formatDate(selectedDate) : 'Select a date'}
            </h2>
          </div>

          {selectedDate && (
            <>
              <div className="mb-4">
                <button
                  onClick={() => setShowEventModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>
              </div>

              <div className="space-y-3">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No events for this day</p>
                ) : (
                  getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{event.title}</h3>
                          {event.time && (
                            <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </div>
                          )}
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-1 text-gray-500 hover:text-red-500 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {!selectedDate && (
            <p className="text-gray-500 text-center py-8">Click on a date to view or add events</p>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Event</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 text-gray-400">
              {formatDate(selectedDate)}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Add details..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={addEvent}
                disabled={!newEvent.title.trim()}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
