const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Types
export interface Course {
  courseId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
  level: string;
  status: string;
  sections: Section[];
  enrollments: { userId: string; progress: number }[];
}

interface Section {
  sectionId: string;
  sectionTitle: string;
  sectionDescription: string;
  chapters: Chapter[];
}

interface Chapter {
  chapterId: string;
  title: string;
  content: string;
  type: string;
}

// Utility function for fetch requests
const fetchApi = async (url: string, options: RequestInit = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  console.log('Fetching URL:', `${BASE_URL}${url}`);
  console.log('Fetch Options:', { ...options, headers });

  try {
    const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response Data:', data);

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data.data; // Return only the data part of the response
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// API functions
export const api = {
  // Courses
  getCourses: async (category?: string) => {
    const query = category && category !== "all" ? `?category=${category}` : "";
    return fetchApi(`courses${query}`) as Promise<Course[]>;
  },
  
  getCourseById: async (id: string) => {
    return fetchApi(`courses/${id}`) as Promise<Course>;
  },
  
  createCourse: async (courseData: Partial<Course>) => {
    return fetchApi("courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    }) as Promise<Course>;
  },
  
  updateCourse: async (id: string, formData: Partial<Course>) => {
    return fetchApi(`courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(formData),
    }) as Promise<Course>;
  },
  
  deleteCourse: async (id: string) => {
    return fetchApi(`courses/${id}`, { method: "DELETE" });
  },

  // User Progress
  getUserCourseProgress: async (userId: string, courseId: string) => {
    return fetchApi(`users/course-progress/${userId}/courses/${courseId}`);
  },
  
  updateUserCourseProgress: async (userId: string, courseId: string, progressData: object) => {
    return fetchApi(`users/course-progress/${userId}/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(progressData),
    });
  },
};
