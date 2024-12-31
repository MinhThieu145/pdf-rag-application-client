import { create } from 'zustand';
import { api } from '@/api/api';
import type { Course } from '@/api/api';

interface CourseStore {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCourses: (category?: string) => Promise<Course[]>;
  fetchCourseById: (id: string) => Promise<void>;
  createCourse: (courseData: Partial<Course>) => Promise<void>;
  updateCourse: (id: string, courseData: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseStore>((set) => ({
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,

  fetchCourses: async (category?: string) => {
    set({ loading: true, error: null });
    try {
      const courses = await api.getCourses(category);
      console.log('Fetched Courses:', courses);
      set({ courses, loading: false });
      return courses;
    } catch (error) {
      console.error('Fetch Courses Error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred', 
        loading: false,
        courses: [] 
      });
      throw error;
    }
  },

  fetchCourseById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const course = await api.getCourseById(id);
      set({ currentCourse: course, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createCourse: async (courseData: Partial<Course>) => {
    set({ loading: true, error: null });
    try {
      const newCourse = await api.createCourse(courseData);
      set((state) => ({ 
        courses: [...state.courses, newCourse],
        loading: false 
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateCourse: async (id: string, courseData: Partial<Course>) => {
    set({ loading: true, error: null });
    try {
      const updatedCourse = await api.updateCourse(id, courseData);
      set((state) => ({
        courses: state.courses.map(course => 
          course.courseId === id ? updatedCourse : course
        ),
        currentCourse: state.currentCourse?.courseId === id ? updatedCourse : state.currentCourse,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteCourse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.deleteCourse(id);
      set((state) => ({
        courses: state.courses.filter(course => course.courseId !== id),
        currentCourse: state.currentCourse?.courseId === id ? null : state.currentCourse,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
