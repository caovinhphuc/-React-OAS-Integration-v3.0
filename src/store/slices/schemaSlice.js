import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { schemaService } from '../../services/api/schemaService'

// Async thunks
export const fetchSchemas = createAsyncThunk(
  'schema/fetchSchemas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await schemaService.getSchemas()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch schemas')
    }
  }
)

export const createSchema = createAsyncThunk(
  'schema/createSchema',
  async (schemaData, { rejectWithValue }) => {
    try {
      const response = await schemaService.createSchema(schemaData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create schema')
    }
  }
)

export const updateSchema = createAsyncThunk(
  'schema/updateSchema',
  async ({ id, schemaData }, { rejectWithValue }) => {
    try {
      const response = await schemaService.updateSchema(id, schemaData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update schema')
    }
  }
)

export const deleteSchema = createAsyncThunk(
  'schema/deleteSchema',
  async (id, { rejectWithValue }) => {
    try {
      await schemaService.deleteSchema(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete schema')
    }
  }
)

const schemaSlice = createSlice({
  name: 'schema',
  initialState: {
    schemas: [],
    currentSchema: null,
    isLoading: false,
    error: null,
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentSchema: (state, action) => {
      state.currentSchema = action.payload
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload
    },
    clearCurrentSchema: (state) => {
      state.currentSchema = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Schemas
      .addCase(fetchSchemas.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSchemas.fulfilled, (state, action) => {
        state.isLoading = false
        state.schemas = action.payload
        state.error = null
      })
      .addCase(fetchSchemas.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Schema
      .addCase(createSchema.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createSchema.fulfilled, (state, action) => {
        state.isLoading = false
        state.schemas.push(action.payload)
        state.error = null
      })
      .addCase(createSchema.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Schema
      .addCase(updateSchema.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSchema.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.schemas.findIndex(schema => schema.id === action.payload.id)
        if (index !== -1) {
          state.schemas[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateSchema.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Schema
      .addCase(deleteSchema.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteSchema.fulfilled, (state, action) => {
        state.isLoading = false
        state.schemas = state.schemas.filter(schema => schema.id !== action.payload)
        state.error = null
      })
      .addCase(deleteSchema.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  setCurrentSchema,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  clearCurrentSchema,
} = schemaSlice.actions

export default schemaSlice.reducer