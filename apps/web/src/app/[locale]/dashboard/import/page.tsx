import { CreateListingFormV2 } from '@/components/create-listing-form-v2'

export default function ImportPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Créer une annonce</h1>
        <p className="text-brand-gray-400 mt-2">
          Créez votre annonce et publiez-la sur plusieurs plateformes avec des champs spécifiques pour chaque plateforme
        </p>
      </div>

      <CreateListingFormV2 />
    </div>
  )
}
