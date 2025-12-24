// src/services/specialty.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class SpecialtyService  {
  /**
   * Returns a list of conditions associated with a given specialty
   */
  async getConditionsBySpecialty(providerSpecialtyId: string) {

    const providerSpecialty = await prisma.providerSpecialty.findUnique({
      where: {
        id: providerSpecialtyId,
      },
      include: {
        specialty: {
          select:{ id: true, },          
        },
      },
    });

    if (!providerSpecialty) {
      throw new Error(`Provider Specialty with ID ${providerSpecialtyId} not found`);
    }
    
    const conditions = await prisma.specialtyCondition.findMany({
      where: {
        specialty_id: providerSpecialty.specialty.id,
      },
      select: {
        id: true,
        condition: {
          select: {            
            name: true,
            description: true,
          },
        },
      },
    });

    // Flatten the result
    return conditions.map(c => ({
      id: c.id,
      name: c.condition.name,
      description: c.condition.description,
    }));
  }

  //Returns a list of redflags associated with a given specialty
  async getRedFlagsBySpecialty(providerSpecialtyId: string){
    const providerSpecialty = await prisma.providerSpecialty.findUnique({
      where: {
        id: providerSpecialtyId,
      },
      include: {
        specialty: {
          select:{ id: true, },          
        },
      },
    });

    if (!providerSpecialty) {
      throw new Error(`Provider Specialty with ID ${providerSpecialtyId} not found`);
    }

    const redflags = await prisma.specialtyRedFlag.findMany({
      where: {
        specialty_id: providerSpecialty.specialty.id,
      },
      select: {
        redFlag:{
          select:{
            id: true,
            name: true
          }
        }
      },
    });

    // Flatten the result
    return redflags.map(r => ({
      id: r.redFlag.id,
      name: r.redFlag.name      
    }));
  }

  /**
   * Returns a list of symptoms associated with a given specialty
   */
  async getSymptomsBySpecialty(specialtyId: string) {
    const symptoms = await prisma.specialtySymptom.findMany({
      where: {
        specialty_id: specialtyId,
      },
      select: {
        symptom: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return symptoms.map((ss) => ss.symptom);
  }

  async getSymptomsByProviderSpecialtyId(providerSpecialtyId: string) {
  try {
    // Fetch the provider specialty based on the providerSpecialtyId
    const providerSpecialty = await prisma.providerSpecialty.findUnique({
      where: {
        id: providerSpecialtyId,
      },
      include: {
        specialty: {
          include: {
            symptoms: {
              include: {
                symptom: true, // Include symptom details (id and name)
              },
            },
          },
        },
      },
    });

    // Check if provider specialty exists
    if (!providerSpecialty) {
      throw new Error(`Provider Specialty with ID ${providerSpecialtyId} not found`);
    }

    // Get symptoms related to the specialty
    const symptoms = providerSpecialty.specialty?.symptoms.map((specialtySymptom) => ({
      specialty_symptom_id: specialtySymptom.id,
      symptom_name: specialtySymptom.symptom.name,      
    }));

    return symptoms;
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    throw error;
  }
}

async getAllSpecialties(){
  try {
    const specialties = await prisma.specialty.findMany({
      select:{
        id: true,
        name: true
      }
    });
    return specialties;
    
  } catch (error) {
    console.error("Error fetching specialties:", error);
    throw error;
  }
}

async getHistoryFieldsByProviderSpecialtyId(providerSpecialtyId: string) {
  try {
    // Find provider specialty and traverse relations to reach history fields
    const providerSpecialty = await prisma.providerSpecialty.findUnique({
      where: {
        id: providerSpecialtyId,
      },
      include: {
        specialty: {
          include: {
            history_template: {
              include: {
                fields: {
                  include: {
                    options: true, // Include field options
                  },
                },
              },
            },
          },
        },
      },
    });

    // Handle invalid ID
    if (!providerSpecialty) {
      throw new Error(`Provider Specialty with ID ${providerSpecialtyId} not found`);
    }

    const historyTemplate = providerSpecialty.specialty?.history_template;

    if (!historyTemplate) {
      throw new Error(`No history template found for provider specialty ID ${providerSpecialtyId}`);
    }

    // Format the result: extract field id, name, type, and options
    const fields = historyTemplate.fields.map((field) => ({
      history_field_id: field.id,
      field_name: field.name,
      field_type: field.type,
      options: field.options.length
        ? field.options.map((opt) => ({
            option_id: opt.id,
            option_value: opt.value,
          }))
        : [], // Return [] if no options exist
    }));

    return fields;
  } catch (error) {
    console.error('Error fetching history fields:', error);
    throw error;
  }
}
};



export default new SpecialtyService();
