// src/lib/db.ts

declare global {
  var prisma: any;
}

const createSafeDb = () => {
  const createMethod = (defaultValue: any) => async () => defaultValue;

  const makeModel = (defaultValue: any) => ({
    findUnique: createMethod(defaultValue),
    findMany: createMethod(defaultValue),
    count: createMethod(defaultValue),
    create: createMethod(defaultValue),
    update: createMethod(defaultValue),
    upsert: createMethod(defaultValue),
    delete: createMethod(defaultValue),
    deleteMany: createMethod(defaultValue),
  });

  return {
    user: makeModel(null),
    board: makeModel(null),
    task: makeModel([]),
    column: makeModel(null),
    attendance: makeModel([]),
    link: makeModel([]),
    account: makeModel(null),
    session: makeModel(null),
    $disconnect: async () => undefined,
  };
};

export const db = globalThis.prisma || createSafeDb();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;