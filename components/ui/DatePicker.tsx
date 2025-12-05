'use client'

import React, { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  label?: string
  value: string
  onChange: (date: string) => void
  required?: boolean
  minDate?: string
  maxDate?: string
}

export function DatePicker({ label, value, onChange, required, minDate, maxDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse the value to a Date object
  const selectedDate = value ? new Date(value + 'T00:00:00') : null

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  // Format date for value (YYYY-MM-DD)
  const formatDateValue = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate + 'T00:00:00')) return true
    if (maxDate && date > new Date(maxDate + 'T00:00:00')) return true
    return false
  }

  // Handle date selection
  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (!isDateDisabled(newDate)) {
      onChange(formatDateValue(newDate))
      setIsOpen(false)
    }
  }

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input field */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left bg-white hover:border-orange-300 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm sm:text-base truncate ${selectedDate ? 'text-gray-900' : 'text-gray-400'}`}>
              {selectedDate ? formatDate(selectedDate) : 'Sélectionner une date'}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-all duration-200 flex-shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </button>

        {/* Calendar dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={previousMonth}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>

              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 py-1 sm:py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {getDaysInMonth(currentMonth).map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                const disabled = isDateDisabled(dayDate)
                const selected = isSelected(day)
                const today = isToday(day)

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={disabled}
                    className={`
                      aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                      ${
                        selected
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                          : disabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : today
                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${!disabled && !selected ? 'hover:scale-105' : ''}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Quick actions */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const today = new Date()
                  if (!isDateDisabled(today)) {
                    onChange(formatDateValue(today))
                    setIsOpen(false)
                  }
                }}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
