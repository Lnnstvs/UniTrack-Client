import api from "./api"

export interface Category {
  _id: string
  name: string
  description: string
  createdAt?: string
  updatedAt?: string
}

interface CategoryResponse {
  success: boolean
  data: Category[]
}

interface SingleCategoryResponse {
  success: boolean
  message: string
  data: Category
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<CategoryResponse>("/categories")

  return response.data.data
}

export const createCategory = async (
  category: {
    name: string
    description: string
  }
): Promise<Category> => {
  const response = await api.post<SingleCategoryResponse>(
    "/categories",
    category
  )

  return response.data.data
}

export const updateCategory = async (
  id: string,
  category: {
    name: string
    description: string
  }
): Promise<Category> => {
  const response = await api.patch<SingleCategoryResponse>(
    `/categories/${id}`,
    category
  )

  return response.data.data
}

export const deleteCategory = async (
  id: string
): Promise<void> => {
  await api.delete(`/categories/${id}`)
}