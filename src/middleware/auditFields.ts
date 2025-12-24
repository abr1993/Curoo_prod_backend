import  prisma  from '../prisma.js'; // import the instance


export function attachAuditMiddleware(userId: string) {
    console.log('prisma.$use exists?', typeof (prisma as any).$use === 'function'); // ✅ should print true
  (prisma as any).$use(async (params: any, next: any) => {    
    const now = new Date();

    if (params.args?.data) {
      // CREATE
      if (params.action === 'create') {
        Object.assign(params.args.data, {
          created_by: userId,
          created_date: now,
          updated_date: now,
        });
      }

      // UPDATE
      if (params.action === 'update' || params.action === 'updateMany') {
        Object.assign(params.args.data, {
          updated_by: userId,
          updated_date: now,
        });
      }

      // SOFT DELETE
      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = {
          deleted_date: now,
          updated_by: userId,
          updated_date: now,
        };
      }
    }

    return next(params);
  });
}


