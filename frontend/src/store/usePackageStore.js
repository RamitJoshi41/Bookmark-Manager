import { create } from "zustand";
import api from "../api"; 

const usePackageStore = create((set) => ({
  packages: [],
  packageBookmarks: [],
  isLoading: false,
  error: null,

  fetchPackages: async (searchQuery = "") => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = searchQuery
        ? `/packages/?search=${searchQuery}`
        : `/packages/`;
      const response = await api.get(endpoint);
      set({ packages: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to fetch packages: " + e, isLoading: false });
    }
  },

  deletePackage: async (id) => {
    try {
      await api.delete("/packages/" + id);
      set((state) => ({
        packages: state.packages.filter((pack) => pack.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete package:", error);
    }
  },

  createPackage: async (packageData) => {
    try {
      const response = await api.post("/packages/create", packageData);
      set((state) => ({
        packages: [response.data, ...state.packages],
      }));
    } catch (e) {
      set({ error: "Package Addition failed: " + e });
    }
  },

  addBookmarkToPackage: async (packageId, bookmarkId) => {
    try {
      // Sent as a query parameter to match FastAPI requirements
      await api.post(`/packages/${packageId}/bookmarks?bookmark_id=${bookmarkId}`);
      
      // We don't update 'packages' here because the backend just returns a success message, 
      // not the updated package object.
    } catch (e) {
      set({ error: "Bookmark Addition failed: " + e });
    }
  },

  getBookmarksFromPackage: async (packageId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/packages/${packageId}/bookmarks`);
      // Replace the array entirely rather than mutating it
      set({ packageBookmarks: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Bookmark Retrieval failed: " + e, isLoading: false });
    }
  },

  updatePackage: async (id, updatedData) => {
    try {
      const response = await api.patch("/packages/" + id, updatedData);
      set((state) => ({
        packages: state.packages.map((pack) =>
          pack.id === id ? response.data : pack,
        ),
      }));
    } catch (e) {
      set({ error: "Package Update failed: " + e });
    }
  },
}));

export default usePackageStore;