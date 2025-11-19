/**
 * Définition des champs personnalisés pour chaque combinaison (catégorie + plateforme)
 */

export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'combobox'
  | 'date'
  | 'textarea'
  | 'checkbox'
  | 'radio'

export interface FieldOption {
  value: string
  label: string
}

export interface FormField {
  id: string
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
  // Pour les combobox avec groupes (comme les marques de motos)
  groupedOptions?: {
    label: string
    options: FieldOption[]
  }[]
}

export interface CategoryFormFields {
  categoryId: string
  platform: 'LEBONCOIN' | 'VINTED' | 'EBAY' | 'FACEBOOK_MARKETPLACE'
  fields: FormField[]
}

/**
 * Champs personnalisés pour LeBonCoin - Motos
 */
const leboncoinMotosFields: CategoryFormFields = {
  categoryId: 'motos',
  platform: 'LEBONCOIN',
  fields: [
    {
      id: 'argus_moto_brand',
      name: 'argus_moto_brand',
      label: 'Marque',
      type: 'combobox',
      required: true,
      placeholder: 'Choisissez',
      groupedOptions: [
        {
          label: 'Marques populaires',
          options: [
            { value: 'BMW', label: 'BMW' },
            { value: 'HONDA', label: 'HONDA' },
            { value: 'KAWASAKI', label: 'KAWASAKI' },
            { value: 'SUZUKI', label: 'SUZUKI' },
            { value: 'YAMAHA', label: 'YAMAHA' },
          ],
        },
        {
          label: 'Autres marques',
          options: [
            { value: 'APRILIA', label: 'APRILIA' },
            { value: 'DUCATI', label: 'DUCATI' },
            { value: 'HARLEY-DAVIDSON', label: 'HARLEY-DAVIDSON' },
            { value: 'KTM', label: 'KTM' },
            { value: 'TRIUMPH', label: 'TRIUMPH' },
            // ... ajouter toutes les autres marques
          ],
        },
      ],
    },
    {
      id: 'argus_moto_model',
      name: 'argus_moto_model',
      label: 'Modèle',
      type: 'text',
      required: true,
      placeholder: 'Ex: CBR 600',
    },
    {
      id: 'regdate',
      name: 'regdate',
      label: 'Année-modèle',
      type: 'number',
      required: true,
      placeholder: '2020',
    },
    {
      id: 'mileage',
      name: 'mileage',
      label: 'Kilométrage',
      type: 'number',
      required: true,
      placeholder: '15000',
    },
    {
      id: 'cubic_capacity',
      name: 'cubic_capacity',
      label: 'Cylindrée',
      type: 'number',
      required: false,
      placeholder: '600',
    },
  ],
}

/**
 * Champs personnalisés pour LeBonCoin - Motos d'occasion
 */
const leboncoinMotosOccasionFields: CategoryFormFields = {
  categoryId: 'motos_occasion',
  platform: 'LEBONCOIN',
  fields: leboncoinMotosFields.fields, // Hérite des mêmes champs
}

/**
 * Registry de tous les champs personnalisés
 */
export const FORM_FIELDS_REGISTRY: CategoryFormFields[] = [
  leboncoinMotosFields,
  leboncoinMotosOccasionFields,
]

/**
 * Récupère les champs pour une combinaison catégorie/plateforme
 */
export function getFormFields(
  categoryId: string,
  platform: 'LEBONCOIN' | 'VINTED' | 'EBAY' | 'FACEBOOK_MARKETPLACE'
): FormField[] {
  const config = FORM_FIELDS_REGISTRY.find(
    (c) => c.categoryId === categoryId && c.platform === platform
  )

  return config?.fields || []
}
