import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type StudentStatus = "Active" | "Inactive"

export type EventStatus =
  | "Upcoming"
  | "Ongoing"
  | "Completed"
  | "Cancelled"

export type RegistrationStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"

export type AttendanceStatus = "Present" | "Absent"

export interface Student {
  id: string
  studentNumber: string
  name: string
  email: string
  course: string
  yearLevel: string
  status: StudentStatus
}

export interface UniEvent {
  id: string
  title: string
  description: string
  category: string
  date: string
  startTime: string
  endTime: string
  venue: string
  capacity: number
  status: EventStatus
}

export interface Registration {
  id: string
  eventId: string
  studentId: string
  status: RegistrationStatus
  registeredAt: string
}

export interface Attendance {
  id: string
  eventId: string
  studentId: string
  status: AttendanceStatus
  checkedInAt?: string
}

interface UniTrackContextType {
  students: Student[]
  events: UniEvent[]
  registrations: Registration[]
  attendance: Attendance[]

  addStudent: (student: Omit<Student, "id">) => void
  updateStudent: (
    id: string,
    data: Partial<Omit<Student, "id">>
  ) => void
  updateStudentStatus: (
    id: string,
    status: StudentStatus
  ) => void
  deleteStudent: (id: string) => void

  addEvent: (event: Omit<UniEvent, "id">) => void
  updateEvent: (
    id: string,
    data: Partial<Omit<UniEvent, "id">>
  ) => void
  deleteEvent: (id: string) => void
  setEventStatus: (id: string, status: EventStatus) => void

  registerStudent: (
    eventId: string,
    studentId: string,
    status?: RegistrationStatus
  ) => { success: boolean; message: string }
  confirmRegistration: (id: string) => void
  cancelRegistration: (id: string) => void
  deleteRegistration: (id: string) => void

  markAttendance: (
    eventId: string,
    studentId: string,
    status: AttendanceStatus
  ) => void
  deleteAttendance: (id: string) => void

  getEventRegistrations: (eventId: string) => Registration[]
  getStudentRegistrations: (studentId: string) => Registration[]
  getEventRegisteredCount: (eventId: string) => number
  getEventAvailableSlots: (eventId: string) => number
}

const STORAGE_KEY = "unitrack-clean-v1"
const OLD_STORAGE_KEYS = ["unitrack-data-v2", "unitrack-data"]

const UniTrackContext =
  createContext<UniTrackContextType | undefined>(undefined)

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

export function UniTrackProvider({
  children,
}: {
  children: ReactNode
}) {
  const [students, setStudents] = useState<Student[]>([])
  const [events, setEvents] = useState<UniEvent[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Remove the old temporary prototype data once.
    OLD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))

    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        setStudents(parsed.students ?? [])
        setEvents(parsed.events ?? [])
        setRegistrations(parsed.registrations ?? [])
        setAttendance(parsed.attendance ?? [])
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        students,
        events,
        registrations,
        attendance,
      })
    )
  }, [loaded, students, events, registrations, attendance])

  const addStudent = (student: Omit<Student, "id">) => {
    setStudents((current) => [
      ...current,
      { ...student, id: generateId("student") },
    ])
  }

  const updateStudent = (
    id: string,
    data: Partial<Omit<Student, "id">>
  ) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === id ? { ...student, ...data } : student
      )
    )
  }

  const updateStudentStatus = (
    id: string,
    status: StudentStatus
  ) => {
    updateStudent(id, { status })
  }

  const deleteStudent = (id: string) => {
    const hasRelatedData =
      registrations.some((item) => item.studentId === id) ||
      attendance.some((item) => item.studentId === id)

    if (hasRelatedData) {
      updateStudentStatus(id, "Inactive")
      return
    }

    setStudents((current) =>
      current.filter((student) => student.id !== id)
    )
  }

  const addEvent = (event: Omit<UniEvent, "id">) => {
    setEvents((current) => [
      ...current,
      { ...event, id: generateId("event") },
    ])
  }

  const updateEvent = (
    id: string,
    data: Partial<Omit<UniEvent, "id">>
  ) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, ...data } : event
      )
    )
  }

  const deleteEvent = (id: string) => {
    setEvents((current) =>
      current.filter((event) => event.id !== id)
    )
    setRegistrations((current) =>
      current.filter((item) => item.eventId !== id)
    )
    setAttendance((current) =>
      current.filter((item) => item.eventId !== id)
    )
  }

  const setEventStatus = (
    id: string,
    status: EventStatus
  ) => {
    updateEvent(id, { status })
  }

  const getEventRegisteredCount = (eventId: string) =>
    registrations.filter(
      (item) =>
        item.eventId === eventId &&
        item.status !== "Cancelled"
    ).length

  const getEventAvailableSlots = (eventId: string) => {
    const event = events.find((item) => item.id === eventId)
    if (!event) return 0

    return Math.max(
      event.capacity - getEventRegisteredCount(eventId),
      0
    )
  }

  const registerStudent = (
    eventId: string,
    studentId: string,
    status: RegistrationStatus = "Pending"
  ) => {
    const event = events.find((item) => item.id === eventId)
    const student = students.find((item) => item.id === studentId)

    if (!event) {
      return { success: false, message: "Event not found." }
    }

    if (!student) {
      return { success: false, message: "Student not found." }
    }

    if (student.status !== "Active") {
      return {
        success: false,
        message: "Inactive students cannot be registered.",
      }
    }

    if (
      event.status === "Completed" ||
      event.status === "Cancelled"
    ) {
      return {
        success: false,
        message: "Students cannot be registered for this event.",
      }
    }

    const duplicate = registrations.some(
      (item) =>
        item.eventId === eventId &&
        item.studentId === studentId &&
        item.status !== "Cancelled"
    )

    if (duplicate) {
      return {
        success: false,
        message: "This student is already registered for this event.",
      }
    }

    if (getEventRegisteredCount(eventId) >= event.capacity) {
      return {
        success: false,
        message: "This event is already full.",
      }
    }

    setRegistrations((current) => [
      ...current,
      {
        id: generateId("registration"),
        eventId,
        studentId,
        status,
        registeredAt: new Date().toISOString(),
      },
    ])

    return {
      success: true,
      message: "Student registered successfully.",
    }
  }

  const confirmRegistration = (id: string) => {
    setRegistrations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Confirmed" } : item
      )
    )
  }

  const cancelRegistration = (id: string) => {
    setRegistrations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Cancelled" } : item
      )
    )
  }

  const deleteRegistration = (id: string) => {
    setRegistrations((current) =>
      current.filter((item) => item.id !== id)
    )
  }

  const markAttendance = (
    eventId: string,
    studentId: string,
    status: AttendanceStatus
  ) => {
    const existing = attendance.find(
      (item) =>
        item.eventId === eventId &&
        item.studentId === studentId
    )

    if (existing) {
      setAttendance((current) =>
        current.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                status,
                checkedInAt:
                  status === "Present"
                    ? new Date().toISOString()
                    : undefined,
              }
            : item
        )
      )
      return
    }

    setAttendance((current) => [
      ...current,
      {
        id: generateId("attendance"),
        eventId,
        studentId,
        status,
        checkedInAt:
          status === "Present"
            ? new Date().toISOString()
            : undefined,
      },
    ])
  }

  const deleteAttendance = (id: string) => {
    setAttendance((current) =>
      current.filter((item) => item.id !== id)
    )
  }

  const getEventRegistrations = (eventId: string) =>
    registrations.filter(
      (item) =>
        item.eventId === eventId &&
        item.status !== "Cancelled"
    )

  const getStudentRegistrations = (studentId: string) =>
    registrations.filter((item) => item.studentId === studentId)

  const value = useMemo(
    () => ({
      students,
      events,
      registrations,
      attendance,
      addStudent,
      updateStudent,
      updateStudentStatus,
      deleteStudent,
      addEvent,
      updateEvent,
      deleteEvent,
      setEventStatus,
      registerStudent,
      confirmRegistration,
      cancelRegistration,
      deleteRegistration,
      markAttendance,
      deleteAttendance,
      getEventRegistrations,
      getStudentRegistrations,
      getEventRegisteredCount,
      getEventAvailableSlots,
    }),
    [students, events, registrations, attendance]
  )

  return (
    <UniTrackContext.Provider value={value}>
      {children}
    </UniTrackContext.Provider>
  )
}

export function useUniTrack() {
  const context = useContext(UniTrackContext)

  if (!context) {
    throw new Error(
      "useUniTrack must be used inside UniTrackProvider"
    )
  }

  return context
}
