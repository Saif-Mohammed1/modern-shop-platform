export const factoryControllerTranslate = {
  en: {
    controllers: {
      updateOne: {
        noValidFieldsProvidedForUpdate: "No valid fields provided for update",
      },
    },
    errors: {
      noDocumentsFound: "No documents found ",
      noDocumentsFoundWithId: "No documents found with that id",
    },
  },

  uk: {
    controllers: {
      updateOne: {
        noValidFieldsProvidedForUpdate: "Не надано дійсних полів для оновлення",
      },
    },
    errors: {
      noDocumentsFound: "Документи не знайдені ",
      noDocumentsFoundWithId: "Документи не знайдені за цим ідентифікатором",
    },
  },
} as const;
