import api from "./api"

export interface Student {
  _id: string
  name: string
  studentId: string
  email: string
  course: string
  yearLevel: number
  status: "Active" | "Inactive"
  createdAt?: string
  updatedAt?: string
}

interface StudentResponse {
  success: boolean
  data: Student[]
}

interface SingleStudentResponse {
  success: boolean
  message: string
  data: Student
}

export const getStudents = async (
  params?: {
    search?: string
    status?: "Active" | "Inactive"
    sort?: string
  }
): Promise<Student[]> => {
  const response = await api.get<StudentResponse>(
    "/students",
    {
      params,
    }
  )

  return response.data.data
}

export const createStudent = async (
  student: {
    name: string
    studentId: string
    email: string
    course: string
    yearLevel: number
    status?: "Active" | "Inactive"
  }
): Promise<Student> => {
  const response = await api.post<SingleStudentResponse>(
    "/students",
    student
  )

  return response.data.data
}

export const updateStudentStatus = async (
  id: string,
  status: "Active" | "Inactive"
): Promise<Student> => {
  const response = await api.patch<SingleStudentResponse>(
    `/students/${id}/status`,
    { status }
  )

  return response.data.data
}

export const deleteStudent = async (
  id: string
): Promise<void> => {
  await api.delete(`/students/${id}`)
}