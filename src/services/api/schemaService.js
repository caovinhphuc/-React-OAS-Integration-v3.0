// Simple Schema Service
export const schemaService = {
  getAllSchemas: async () => {
    return {
      data: [],
      status: 'success',
    };
  },

  getSchemaById: async (id) => {
    return {
      data: { id, name: 'Sample Schema' },
      status: 'success',
    };
  },

  createSchema: async (schema) => {
    return {
      data: { ...schema, id: Date.now() },
      status: 'success',
    };
  },

  updateSchema: async (id, schema) => {
    return {
      data: { ...schema, id },
      status: 'success',
    };
  },

  deleteSchema: async (id) => {
    return {
      data: { id },
      status: 'success',
    };
  },
};

export default schemaService;
