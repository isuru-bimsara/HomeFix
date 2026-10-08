import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";

import {
  CreateTodoData,
  Todo,
  TodoListResponse,
  TodoResponse,
  UpdateTodoData,
} from "../types/todo";


export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // GET ALL TODOS
  const getTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await api.get<TodoListResponse>("/todos");

      setTodos(response.data.data);
    } catch (error: any) {
      console.error(
        "Get Todos Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to get todos"
      );
    } finally {
      setLoading(false);
    }
  }, []);


  // GET ONE TODO
  const getTodoById = async (
    id: number | string
  ): Promise<Todo> => {
    try {
      setError(null);

      const response =
        await api.get<TodoResponse>(
          `/todos/${id}`
        );

      return response.data.data;
    } catch (error: any) {
      console.error(
        "Get Todo By ID Error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        "Failed to get todo";

      setError(message);

      throw error;
    }
  };


  // CREATE TODO
  const createTodo = async (
    data: CreateTodoData
  ) => {
    try {
      setError(null);

      const response =
        await api.post<TodoResponse>(
          "/todos",
          data
        );

      const newTodo = response.data.data;

      setTodos((currentTodos) => [
        newTodo,
        ...currentTodos,
      ]);

      return newTodo;
    } catch (error: any) {
      console.error(
        "Create Todo Error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        "Failed to create todo";

      setError(message);

      throw error;
    }
  };


  // UPDATE TODO
  const updateTodo = async (
    id: number,
    data: UpdateTodoData
  ) => {
    try {
      setError(null);

      const response =
        await api.patch<TodoResponse>(
          `/todos/${id}`,
          data
        );

      const updatedTodo =
        response.data.data;

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id
            ? updatedTodo
            : todo
        )
      );

      return updatedTodo;
    } catch (error: any) {
      console.error(
        "Update Todo Error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        "Failed to update todo";

      setError(message);

      throw error;
    }
  };


  // DELETE TODO
  const deleteTodo = async (
    id: number
  ) => {
    try {
      setError(null);

      await api.delete(
        `/todos/${id}`
      );

      setTodos((currentTodos) =>
        currentTodos.filter(
          (todo) => todo.id !== id
        )
      );
    } catch (error: any) {
      console.error(
        "Delete Todo Error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        "Failed to delete todo";

      setError(message);

      throw error;
    }
  };


  // TOGGLE TODO
  const toggleTodo = async (
    todo: Todo
  ) => {
    return updateTodo(todo.id, {
      completed: !todo.completed,
    });
  };


  useEffect(() => {
    getTodos();
  }, [getTodos]);


  return {
    todos,
    loading,
    error,

    getTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  };
};