// src/services/physician.service.ts
import type { Provider, USState } from '@prisma/client';
import prisma from '../prisma.js';
import type { Decimal } from '@prisma/client/runtime/binary';
import type { SettingsBody } from '../types/settings.js';

export type ProviderListItem = {
  user_id: string;
  display_name: string;
  avatar: string | null;
  specialty: string | null;
  specialty_id: String | null;
  provider_specialty_id: String | null;
  price_cents: Decimal | null;
  is_available: boolean;
  state: USState | null;
};

export type ProviderSpecialtyListItem = {
  user_id: string;
  display_name: string;
  avatar: string | null;
  specialty: string | null;
  specialty_id: String | null;
  provider_specialty_id: String | null;
  provider_experience_in_years: number;
  price_cents: Decimal[];
  is_available: boolean;
  states: USState[];
};

// type CustomProvider<Provider, K extends keyof Provider> = Pick<Provider, Exclude<keyof Provider, K>>;
type CustomProvider = Omit<Provider, 'id' | 'createdAt'>;

class ProviderService {
  async list() {
    return prisma.provider.findMany({
      include: {
        user: true,
        specialties: { include: { specialty: true } },
        licenses: true,
      },
    });
  }

  async listProvidersGroupedBySpecialty(): Promise<ProviderSpecialtyListItem[]> {
    const providerSpecialties = await prisma.providerSpecialty.findMany({
        where: {
          deleted_date: null,

          provider: {
            deleted_date: null,
            user: {
              deleted_date: null
            }
          },
          
          specialty: {
            deleted_date: null
          },

          provider_license: {
            some: {
              deleted_date: null
            }
          }
        },
        include: {         
          provider: {
            include: {
              user: true
            }
          },
          specialty: true,
          provider_license: true
        }
      });

    return providerSpecialties.map((ps) => ({
      user_id: ps.provider.user_id,
      display_name: ps.provider.display_name,
      avatar: ps.provider.avatar,
      specialty: ps.specialty.name,
      specialty_id: ps.specialty.id,
      provider_specialty_id: ps.id,
      provider_experience_in_years: ps.provider_experience_in_years,
      price_cents: ps.provider_license
        .filter((l) => l.deleted_date === null && l.price_cents !== null)
        .map((l) => l.price_cents as Decimal),
      is_available: ps.provider.is_available,
      states: ps.provider_license
        .filter((l) => l.deleted_date === null)
        .map((l) => l.state),
    }));
  }

  async listproviders():  Promise<ProviderListItem[]>{
    
    const providers = await prisma.provider.findMany({
      select: {
        user_id: true,
        display_name: true,
        avatar: true,
        is_available: true,
        specialties: {  
          where: {deleted_date: null},        
          select: {
            id: true,
            specialty: {
              select: {
                id: true,
                name: true,
              },
            },
            provider_license: {
              where: {
                is_available: true, // ✅ only include available licenses
              },
              select: {
                id: true,
                state: true,
                price_cents: true,                
              },
            },
          },
        },
      },
    });

    // Explicitly typecast each return value as ProviderListItem
    const results: ProviderListItem[] = providers.flatMap((p): ProviderListItem[] =>
      p.specialties.length === 0
        ? [
            {
              user_id: p.user_id,
              display_name: p.display_name,
              avatar: p.avatar,
              specialty: null,
              specialty_id: null,
              provider_specialty_id: null,
              price_cents: null,
              is_available: p.is_available,
              state: null,
            },
          ]
        : p.specialties.flatMap((ps): ProviderListItem[] =>{
              if (ps.provider_license.length === 0) return [];

              return ps.provider_license.map(
                (lic): ProviderListItem => ({
                  user_id: p.user_id,
                  display_name: p.display_name,
                  avatar: p.avatar,
                  specialty: ps.specialty?.name ?? null,
                  specialty_id: ps.specialty.id ?? null,
                  provider_specialty_id: ps.id ?? null,
                  price_cents: lic.price_cents,
                  is_available: p.is_available,
                  state: lic.state,
                })
              );
        }
            
            
    ));

    return results;

  }

  async get(id: string) {
    return prisma.provider.findUnique({
      where: {
        user_id: id,
        deleted_date: null,
      },
      include: {
        user: true,
        specialties: {
          where: {
            deleted_date: null,
          },
          include: {
            specialty: true,
          },
        },
        licenses: {
          where: {
            deleted_date: null,
          },
        },
      },
    });
  }


  async getLicensesBySpecialty(id: string) {
    
    const specialtyWithLicenses = await prisma.providerSpecialty.findUnique({
        where: { id, deleted_date: null },
        include: {
          provider: true,
          provider_license: {
            where: {
              deleted_date: null,
            },
          },
          specialty: true
        }, 
      });

      if (!specialtyWithLicenses) {
        return null;
      }

      // Assuming all licenses belong to the same specialty, pick provider_specialty once
      return {
          user_id: specialtyWithLicenses.provider_id,
          display_name: specialtyWithLicenses.provider.display_name,
          avatar: specialtyWithLicenses.provider.avatar,
          specialty: specialtyWithLicenses.specialty.name,
          specialty_id: specialtyWithLicenses.specialty_id,                
          is_available: specialtyWithLicenses.provider.is_available,
          provider_experience_in_years: specialtyWithLicenses.provider_experience_in_years,
          licenses: specialtyWithLicenses.provider_license.map((license) => ({
            id: license.id,          
            state: license.state,
            price_cents: license.price_cents,
            is_available: license.is_available,
            daily_cap: license.daily_cap,
            created_date: license.created_date,
            updated_date: license.updated_date,
            deleted_date: license.deleted_date,
          })),
      };
  }

  async getBySpecialtyId(state: string, provider_specialty_id: string) {
    return prisma.providerLicense.findUnique({
      where: {
        provider_specialty_id_state: {
          provider_specialty_id: provider_specialty_id,
          state: state as USState
        },
        deleted_date: null
      },
      select: {
        price_cents: true,
        daily_cap: true,
        is_available: true,
        provider: {
          select: {
            display_name: true,
            avatar: true,
          },
        },
      },
    }); 
  } 


   async getProviderSettings(providerId: string) {
  // Fetch provider with all specialties and licenses
        const provider = await prisma.provider.findUnique({
          where: { user_id: providerId },
          select: {
            user_id: true,
            display_name: true,
            avatar: true,
            is_available: true,
            specialties: {
              where: {deleted_date: null},
              select:{
                specialty_id:true,
                provider_experience_in_years: true,
                specialty: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                provider_license: {
                  where: {
                    deleted_date: null, // Only fetch licenses that aren't deleted
                  },
                  
                  select: {
                    id: true,
                    is_available: true,
                    state: true,
                    price_cents: true,
                    daily_cap: true             
                    
                  }
                },
              }              
            },
          },
        });

        if (!provider) {
          throw new Error(`Provider with id ${providerId} not found`);
        }

        // Transform the data into the shape your frontend expects
        const specialties = provider.specialties.map((ps) => ({
          id: ps.specialty.id,
          name: ps.specialty.name,
          experience_in_years: ps.provider_experience_in_years,
          available: ps.provider_license.every((l) => l.is_available), // optional: or custom logic
          states: ps.provider_license.map((l) => ({
            state: l.state as USState,
            price: l.price_cents ? Number(l.price_cents) : 0,
            dailyCap: l.daily_cap ?? 0,
            is_available: l.is_available,
          })),
        }));
        const existingIds = provider.specialties.map((s) => s.specialty_id);
        const availableSpecialties = await prisma.specialty.findMany({
            where: {
              id: { notIn: existingIds },
            },
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          });

        return {
          displayName: provider.display_name,
          avatar: provider.avatar ?? "",
          unavailable: !provider.is_available,
          specialties,
          availableSpecialties
        };
      }
  async upload(image_url:string, providerId: string){
    const updated = await prisma.provider.update({
          where: { user_id: providerId },
          data: { avatar: image_url },
          select: { avatar: true },
        });
        return updated.avatar;

  }

  async update(providerId: string, data: SettingsBody) {
  const { displayName, avatar, unavailable, specialties } = data;

  return await prisma.$transaction(async (tx) => {
    // Update Provider base info
    await tx.provider.update({
      where: { user_id: providerId },
      data: {
        display_name: displayName,
        avatar: avatar ?? null,
        is_available: !unavailable,
        updated_by: providerId,
      },
    });

    // Fetch existing specialties
    const existingProviderSpecialties = await tx.providerSpecialty.findMany({
      where: { provider_id: providerId, deleted_date: null },
      include: { provider_license: true },
    });

    const incomingSpecialtyIds = specialties.map((s) => s.id);

    // Remove deleted specialties
    const specialtiesToRemove = existingProviderSpecialties.filter(
      (ps) => !incomingSpecialtyIds.includes(ps.specialty_id)
    );

    for (const ps of specialtiesToRemove) {
      await tx.providerLicense.updateMany({
        where: { provider_specialty_id: ps.id, deleted_date: null },
        data: { deleted_date: new Date(), updated_by: providerId },
      });

      await tx.providerSpecialty.update({
        where: { id: ps.id },
        data: { deleted_date: new Date(), updated_by: providerId },
      });
    }

    // Handle upserts for specialties
    for (const spec of specialties) {
      const providerSpecialty = await tx.providerSpecialty.upsert({
        where: {
          provider_id_specialty_id: {
            provider_id: providerId,
            specialty_id: spec.id,
          },
        },
        update: {
          provider_experience_in_years: spec.experience_in_years,
          deleted_date: null,
          updated_by: providerId,
        },
        create: {
          provider_experience_in_years: spec.experience_in_years,
          provider_id: providerId,
          specialty_id: spec.id,
          created_by: providerId,
        },
      });

      // ============================
      // STATE-LEVEL REMOVE / ADD LOGIC
      // ============================

      // Fetch existing licenses for this specialty
      const existingLicenses = await tx.providerLicense.findMany({
        where: {
          provider_specialty_id: providerSpecialty.id,
          deleted_date: null,
        },
      });

      const incomingStates = spec.states.map((s) => s.state as USState);

      // States to remove
      const licensesToRemove = existingLicenses.filter(
        (lic) => !incomingStates.includes(lic.state)
      );

      // Soft delete removed states
      for (const lic of licensesToRemove) {
        await tx.providerLicense.update({
          where: { id: lic.id },
          data: {
            deleted_date: new Date(),
            updated_by: providerId,
          },
        });
      }

      // Add / Update states
      for (const st of spec.states) {
        const stateEnum = st.state as USState;

        await tx.providerLicense.upsert({
          where: {
            provider_specialty_id_state: {
              provider_specialty_id: providerSpecialty.id,
              state: stateEnum,
            },
          },
          update: {
            price_cents: st.price,
            daily_cap: st.dailyCap,
            is_available: spec.available,
            deleted_date: null, // restore if soft deleted
            updated_by: providerId,
          },
          create: {
            provider_id: providerId,
            provider_specialty_id: providerSpecialty.id,
            state: stateEnum,
            price_cents: st.price,
            daily_cap: st.dailyCap,
            is_available: spec.available,
            created_by: providerId,
          },
        });
      }
    }

    // Return updated provider
    return await tx.provider.findUnique({
      where: { user_id: providerId },
      include: {
        specialties: {
          include: {
            specialty: true,
            provider_license: true,
          },
        },
        licenses: true,
      },
    });
  });
}

  
  
}

export default new ProviderService();
