import { isApiError } from "@/lib/api/errors";
import { isServerApiConfigured, serverRequest } from "@/lib/api/server";
import { demoTasks } from "@/features/tasks/fixtures/tasks";
import type { Task, TaskDifficulty, TaskSubject } from "@/features/tasks/types";

export const TASK_PAGE_SIZE = 4;

export type TaskFilters = {
  subject?: TaskSubject;
  level?: TaskDifficulty;
};

export type TaskListResult = {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  isDemo: boolean;
};

type TaskListDto = {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
};

function listLocalTasks(filters: TaskFilters, page: number): TaskListResult {
  const filtered = demoTasks.filter((task) => {
    if (filters.subject && task.subject !== filters.subject) return false;
    if (filters.level && task.level !== filters.level) return false;
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / TASK_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * TASK_PAGE_SIZE;

  return {
    items: filtered.slice(start, start + TASK_PAGE_SIZE),
    total: filtered.length,
    page: safePage,
    pageSize: TASK_PAGE_SIZE,
    pageCount,
    isDemo: true,
  };
}

export async function getTasks(
  filters: TaskFilters = {},
  page = 1,
): Promise<TaskListResult> {
  if (isServerApiConfigured()) {
    const response = await serverRequest<TaskListDto>("/tasks", {
      searchParams: {
        subject: filters.subject,
        level: filters.level,
        page,
        page_size: TASK_PAGE_SIZE,
      },
    });

    return {
      items: response.items,
      total: response.total,
      page: response.page,
      pageSize: response.page_size,
      pageCount: Math.max(1, Math.ceil(response.total / response.page_size)),
      isDemo: false,
    };
  }

  // Build-time / offline fallback only. In development the API origin defaults
  // to localhost, so published tasks are always served by FastAPI.
  return listLocalTasks(filters, page);
}

export async function getTaskById(id: string): Promise<Task | null> {
  if (isServerApiConfigured()) {
    try {
      return await serverRequest<Task>(`/tasks/${encodeURIComponent(id)}`);
    } catch (error) {
      if (isApiError(error) && (error.status === 404 || error.status === 422)) {
        return null;
      }
      throw error;
    }
  }

  return demoTasks.find((task) => task.id === id) ?? null;
}

export async function getFeaturedTasks(limit = 3): Promise<Task[]> {
  if (isServerApiConfigured()) {
    const response = await serverRequest<TaskListDto>("/tasks", {
      searchParams: { featured: true, page_size: limit },
    });
    return response.items;
  }

  return demoTasks.filter((task) => task.featured).slice(0, limit);
}

export async function getTasksBySubject(
  subject: TaskSubject,
  limit = 6,
): Promise<Task[]> {
  const result = await getTasks({ subject }, 1);
  return result.items.slice(0, limit);
}

export async function getRelatedTasks(task: Task, limit = 3): Promise<Task[]> {
  if (isServerApiConfigured()) {
    const response = await serverRequest<TaskListDto>(
      `/tasks/${encodeURIComponent(task.id)}/related`,
      { searchParams: { limit } },
    );
    return response.items;
  }

  const scored = demoTasks
    .filter((candidate) => candidate.id !== task.id)
    .map((candidate) => {
      const sharedTopics = candidate.topics.filter((topic) =>
        task.topics.includes(topic),
      ).length;
      const score =
        sharedTopics * 2 +
        (candidate.subject === task.subject ? 1 : 0) +
        (candidate.level === task.level ? 1 : 0);
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.candidate);
}

export function getTaskPath(id: string): string {
  return `/zadachi/${id}`;
}

export async function getTaskIds(): Promise<string[]> {
  if (!isServerApiConfigured()) {
    return demoTasks.map((task) => task.id);
  }

  const ids: string[] = [];
  const pageSize = 100;
  let page = 1;
  let total = 0;
  do {
    const response = await serverRequest<TaskListDto>("/tasks", {
      searchParams: { page, page_size: pageSize },
    });
    ids.push(...response.items.map((task) => task.id));
    total = response.total;
    page += 1;
  } while (ids.length < total);

  return ids;
}
