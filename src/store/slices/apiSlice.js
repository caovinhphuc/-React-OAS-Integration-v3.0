import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../services/api/apiClient'

// Async thunks
export const fetchAPISpecs = createAsyncThunk(
  'api/fetchAPISpecs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/specs')
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch API specs')
    }
  }
)

export const uploadAPISpec = createAsyncThunk(
  'api/uploadAPISpec',
  async (specData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/specs', specData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload API spec')
    }
  }
)

export const validateAPISpec = createAsyncThunk(
  'api/validateAPISpec',
  async (specData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/specs/validate', specData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to validate API spec')
    }
  }
)

const apiSlice = createSlice({
  name: 'api',
  initialState: {
    specs: [],
    currentSpec: null,
    validationResults: null,
    isLoading: false,
    error: null,
    filters: {
      search: '',
      category: 'all',
      version: 'all',
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentSpec: (state, action) => {
      state.currentSpec = action.payload
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearValidationResults: (state) => {
      state.validationResults = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch API Specs
      .addCase(fetchAPISpecs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAPISpecs.fulfilled, (state, action) => {
        state.isLoading = false
        state.specs = action.payload
        state.error = null
      })
      .addCase(fetchAPISpecs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Upload API Spec
      .addCase(uploadAPISpec.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadAPISpec.fulfilled, (state, action) => {
        state.isLoading = false
        state.specs.push(action.payload)
        state.error = null
      })
      .addCase(uploadAPISpec.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Validate API Spec
      .addCase(validateAPISpec.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(validateAPISpec.fulfilled, (state, action) => {
        state.isLoading = false
        state.validationResults = action.payload
        state.error = null
      })
      .addCase(validateAPISpec.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  setCurrentSpec,
  updateFilters,
  clearValidationResults,
} = apiSlice.actions

export default apiSlice.reducer