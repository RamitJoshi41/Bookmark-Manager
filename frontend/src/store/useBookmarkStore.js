import { create } from "zustand";
import api from "../api"; // Your centralized Axios bouncer from Phase 6
const useBookmarkStore = create((set) => ({
  // --- 1. STATE ---
  bookmarks: [],
  isLoading: false,
  error: null,

  // --- 2. ACTIONS ---

  // Action to load bookmarks on Dashboard mount
  fetchBookmarks: async (searchQuery = "") => {
    set({ isLoading: true, error: null });
    try {
      // If there's a search query, append it to the URL
      const endpoint = searchQuery
        ? `/bookmarks/?search=${searchQuery}`
        : `/bookmarks/`;

      const response = await api.get(endpoint);

      set({
        bookmarks: response.data,
        isLoading: false,
      });
    } catch (e) {
      set({ error: "Failed to fetch bookmarks" + e, isLoading: false });
    }
  },

  // Action to delete a bookmark
  deleteBookmark: async (id) => {
    try {
      // YOUR TURN:
      // 1. Await an api.delete request to `/bookmarks/${id}`
      // 2. Use set() to filter the deleted bookmark out of the current 'bookmarks' array.
      // Hint: You can access current state inside set like this:
      await api.delete("/bookmarks/" + id);
      set((state) => ({
        bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
    }
  },

  addBookmark: async (bookmarkData) => {
    try {
      // 1. Do the async network request FIRST
      const response = await api.post("/bookmarks/create", bookmarkData);
      const newBookmark = response.data;

      // 2. THEN update the state synchronously
      set((state) => ({
        bookmarks: [newBookmark, ...state.bookmarks],
      }));
    } catch (e) {
      // Handle the error state
      set({ error: "Bookmark Addition failed: " + e });
    }
  },

  updateBookmark: async (id, updatedData) => {
    try {
      // 1. Network call (MUST be PUT)
      const response = await api.patch("/bookmarks/update/" + id, updatedData);
      const updatedBookmark = response.data;

      // 2. Synchronous state update
      set((state) => ({
        // .map() loops through every bookmark.
        // If the ID matches, it replaces it with the updatedBookmark.
        // If not, it just keeps the old bookmark.
        bookmarks: state.bookmarks.map((bookmark) =>
          bookmark.id === id ? updatedBookmark : bookmark,
        ),
      }));
    } catch (e) {
      set({ error: "Bookmark Update failed: " + e });
    }
  },
}));

export default useBookmarkStore;
