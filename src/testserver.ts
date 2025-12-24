/* import prisma from './prisma.js';

const cardiologyConfig = await prisma.specialtyForHistory.findUnique({
  where: { name: "Cardiology" },
  include: { fields: { include: { options: true } } },
});
const ophthalmologyConfig = await prisma.specialtyForHistory.findUnique({
  where: { name: "Ophthalmology" },
  include: { fields: { include: { options: true } } },
});

//console.log(ophthalmologyConfig);
const ophtalmology = await prisma.specialtyForHistory.findUnique({
  where: { name: "Ophthalmology" },
});
if (!ophtalmology) throw new Error("Cardiology specialty not found");
const history = await prisma.medicalHistory.create({
  data: {
    patientId: "82187c25-13e7-4717-a7eb-6a1eca8c75dc",
    specialtyId: ophtalmology.id,
    data: {
      Medications: "atenolol, loratadine",
      Allergies: "None",
      "Eye history": ["Contact lenses", "LASIK"],
      Systemic: ["Diabetes"],
    },
  },
});

export async function getSpecialtyFields(specialtyId: string) {
  // Fetch the specialty fields and include their options
    const specialty = await prisma.specialtyForHistory.findUnique({
        where: { id: specialtyId },
        include: {
        fields: {
            include: {
            options: true,
            },
            orderBy: {
            order: "asc", // optional, if you want a display order
            },
        },
        },
    });

    if (!specialty) {
        throw new Error(`Specialty with ID ${specialtyId} not found`);
    }

    // Transform structure if needed — for easier frontend consumption
    const formattedFields = specialty.fields.map((field) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        isRequired: field.isRequired,
        placeholder: (field as any).placeholder ?? null, // if you had this in schema before
        options:
        field.options?.map((option) => ({
            id: option.id,
            value: option.value,
        })) ?? [],
    }));

    return {
        specialtyId: specialty.id,
        specialtyName: specialty.name,
        description: specialty.description,
        fields: formattedFields,
    };
}
//console.log("MEDICAL HISTORY", history);
(async () => {
  const specialtyId = "7531ec6d-73c0-42ab-b436-e03e6a005bce"; // ophtalmology
  //const specialtyId = "0a7f2a4e-9bd6-4bef-ba1e-643565aa289f";  //cardiology
  const result = await getSpecialtyFields(specialtyId);
  //console.dir(result, { depth: null });
})();

const records = await prisma.medicalHistory.findMany({
  where: {
    patientId: "82187c25-13e7-4717-a7eb-6a1eca8c75dc",
    specialty: { name: "Ophthalmology" },
  },
});
console.dir(records, { depth: null });

//console.dir(cardiologyConfig, { depth: null });
//console.dir(ophthalmologyConfig, { depth: null });

 */