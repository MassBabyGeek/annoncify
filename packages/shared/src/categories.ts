/**
 * LeBonCoin category structure
 * Based on actual LeBonCoin category tree
 */

export interface LeBonCoinCategory {
  id: string
  label: string
  subcategories?: LeBonCoinCategory[]
}

export const LEBONCOIN_CATEGORIES: LeBonCoinCategory[] = [
  {
    id: 'emploi',
    label: 'Emploi',
    subcategories: [
      { id: 'offres_emploi', label: 'Offres d\'emploi' },
    ],
  },
  {
    id: 'vehicules',
    label: 'Véhicules',
    subcategories: [
      { id: 'voitures', label: 'Voitures' },
      { id: 'motos', label: 'Motos' },
      { id: 'caravaning', label: 'Caravaning' },
      { id: 'utilitaires', label: 'Utilitaires' },
      { id: 'nautisme', label: 'Nautisme' },
      { id: 'equipement_auto', label: 'Équipement auto' },
      { id: 'equipement_moto', label: 'Équipement moto' },
      { id: 'equipement_caravaning', label: 'Équipement caravaning' },
      { id: 'equipement_nautisme', label: 'Équipement nautisme' },
    ],
  },
  {
    id: 'immobilier',
    label: 'Immobilier',
    subcategories: [
      { id: 'ventes_immobilieres', label: 'Ventes immobilières' },
      { id: 'locations', label: 'Locations' },
      { id: 'colocations', label: 'Colocations' },
      { id: 'bureaux_commerces', label: 'Bureaux & Commerces' },
    ],
  },
  {
    id: 'locations_vacances',
    label: 'Locations de vacances',
    subcategories: [
      { id: 'locations_saisonnieres', label: 'Locations saisonnières' },
    ],
  },
  {
    id: 'electronique',
    label: 'Electronique',
    subcategories: [
      { id: 'ordinateurs', label: 'Ordinateurs' },
      { id: 'accessoires_informatique', label: 'Accessoires informatique' },
      { id: 'tablettes_liseuses', label: 'Tablettes & Liseuses' },
      { id: 'photo_audio_video', label: 'Photo, audio & vidéo' },
      { id: 'telephones_objets_connectes', label: 'Téléphones & Objets connectés' },
      { id: 'accessoires_telephone_objets_connectes', label: 'Accessoires téléphone & Objets connectés' },
      { id: 'consoles', label: 'Consoles' },
      { id: 'jeux_video', label: 'Jeux vidéo' },
    ],
  },
  {
    id: 'maison_jardin',
    label: 'Maison & Jardin',
    subcategories: [
      { id: 'ameublement', label: 'Ameublement' },
      { id: 'papeterie_fournitures_scolaires', label: 'Papeterie & Fournitures scolaires' },
      { id: 'electromenager', label: 'Électroménager' },
      { id: 'arts_table', label: 'Arts de la table' },
      { id: 'decoration', label: 'Décoration' },
      { id: 'linge_maison', label: 'Linge de maison' },
      { id: 'bricolage', label: 'Bricolage' },
      { id: 'jardin_plantes', label: 'Jardin & Plantes' },
    ],
  },
  {
    id: 'famille',
    label: 'Famille',
    subcategories: [
      { id: 'equipement_bebe', label: 'Équipement bébé' },
      { id: 'mobilier_enfant', label: 'Mobilier enfant' },
      { id: 'vetements_bebe', label: 'Vêtements bébé' },
    ],
  },
  {
    id: 'mode',
    label: 'Mode',
    subcategories: [
      { id: 'vetements', label: 'Vêtements' },
      { id: 'chaussures', label: 'Chaussures' },
      { id: 'accessoires_bagagerie', label: 'Accessoires & Bagagerie' },
      { id: 'montres_bijoux', label: 'Montres & Bijoux' },
    ],
  },
  {
    id: 'loisirs',
    label: 'Loisirs',
    subcategories: [
      { id: 'antiquites', label: 'Antiquités' },
      { id: 'collection', label: 'Collection' },
      { id: 'cd_musique', label: 'CD - Musique' },
      { id: 'dvd_films', label: 'DVD - Films' },
      { id: 'instruments_musique', label: 'Instruments de musique' },
      { id: 'livres', label: 'Livres' },
      { id: 'modelisme', label: 'Modélisme' },
      { id: 'vins_gastronomie', label: 'Vins & Gastronomie' },
      { id: 'jeux_jouets', label: 'Jeux & Jouets' },
      { id: 'loisirs_creatifs', label: 'Loisirs créatifs' },
      { id: 'sport_plein_air', label: 'Sport & Plein air' },
      { id: 'velos', label: 'Vélos' },
      { id: 'equipements_velos', label: 'Équipements vélos' },
    ],
  },
  {
    id: 'animaux',
    label: 'Animaux',
    subcategories: [
      { id: 'accessoires_animaux', label: 'Accessoires animaux' },
      { id: 'animaux_perdus', label: 'Animaux perdus' },
    ],
  },
  {
    id: 'materiel_professionnel',
    label: 'Matériel Professionnel',
    subcategories: [
      { id: 'tracteurs', label: 'Tracteurs' },
      { id: 'materiel_agricole', label: 'Matériel agricole' },
      { id: 'btp_chantier_gros_oeuvre', label: 'BTP - Chantier gros-oeuvre' },
      { id: 'poids_lourds', label: 'Poids lourds' },
      { id: 'manutention_levage', label: 'Manutention - Levage' },
      { id: 'equipements_industriels', label: 'Équipements industriels' },
      { id: 'equipements_restaurants_hotels', label: 'Équipements pour restaurants & hôtels' },
      { id: 'equipements_fournitures_bureau', label: 'Équipements & Fournitures de bureau' },
      { id: 'equipements_commerces_marches', label: 'Équipements pour commerces & marchés' },
      { id: 'materiel_medical', label: 'Matériel médical' },
    ],
  },
  {
    id: 'service',
    label: 'Service',
    subcategories: [
      { id: 'artistes_musiciens', label: 'Artistes & Musiciens' },
      { id: 'baby_sitting', label: 'Baby-Sitting' },
      { id: 'billetterie', label: 'Billetterie' },
      { id: 'covoiturage', label: 'Covoiturage' },
      { id: 'cours_particuliers', label: 'Cours particuliers' },
      { id: 'entraide_voisins', label: 'Entraide entre voisins' },
      { id: 'evenements', label: 'Évènements' },
      { id: 'services_personne', label: 'Services à la personne' },
      { id: 'services_animaux', label: 'Services aux animaux' },
      { id: 'services_demenagement', label: 'Services de déménagement' },
      { id: 'services_reparations_electroniques', label: 'Services de réparations électroniques' },
      { id: 'services_jardinerie_bricolage', label: 'Services de jardinerie & bricolage' },
      { id: 'services_evenementiels', label: 'Services évènementiels' },
      { id: 'autres_services', label: 'Autres services' },
    ],
  },
  {
    id: 'divers',
    label: 'Divers',
    subcategories: [
      { id: 'autres', label: 'Autres' },
    ],
  },
]

/**
 * Get category by ID
 */
export function getCategoryById(id: string): LeBonCoinCategory | undefined {
  const findCategory = (categories: LeBonCoinCategory[]): LeBonCoinCategory | undefined => {
    for (const category of categories) {
      if (category.id === id) return category
      if (category.subcategories) {
        const found = findCategory(category.subcategories)
        if (found) return found
      }
    }
    return undefined
  }
  return findCategory(LEBONCOIN_CATEGORIES)
}

/**
 * Get full category path
 */
export function getCategoryPath(id: string): string[] {
  const path: string[] = []

  const findPath = (categories: LeBonCoinCategory[], targetId: string): boolean => {
    for (const category of categories) {
      path.push(category.id)

      if (category.id === targetId) {
        return true
      }

      if (category.subcategories && findPath(category.subcategories, targetId)) {
        return true
      }

      path.pop()
    }
    return false
  }

  findPath(LEBONCOIN_CATEGORIES, id)
  return path
}

/**
 * Flatten categories for dropdown
 */
export function flattenCategories(): Array<{ value: string; label: string; depth: number }> {
  const result: Array<{ value: string; label: string; depth: number }> = []

  const flatten = (categories: LeBonCoinCategory[], depth = 0) => {
    for (const category of categories) {
      result.push({
        value: category.id,
        label: category.label,
        depth,
      })

      if (category.subcategories) {
        flatten(category.subcategories, depth + 1)
      }
    }
  }

  flatten(LEBONCOIN_CATEGORIES)
  return result
}
