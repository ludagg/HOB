const categories = [
    {
        name: 'Informatique',
        subcategories: ['Développement Web', 'Développement Mobile', 'Réseaux et Sécurité', 'Administration Système', 'UI/UX Design', 'Maintenance Informatique']
    },
    {
        name: 'Agronomie',
        subcategories: ['Production Végétale', 'Production Animale', 'Transformation Agroalimentaire', 'Conseil Agricole', 'Gestion des Sols et de l\'Eau']
    },
    {
        name: 'Enseignement',
        subcategories: ['Cours de Soutien', 'Formation Professionnelle', 'Langues Etrangères', 'Coaching Scolaire']
    },
    {
        name: 'Génie Civil',
        subcategories: ['Construction de Bâtiments', 'Travaux Publics', 'Études et Plans', 'Topographie', 'Suivi de Chantier']
    },
    {
        name: 'Artisanat',
        subcategories: ['Couture et Mode', 'Menuiserie', 'Plomberie', 'Électricité', 'Mécanique', 'Coiffure et Esthétique']
    },
    {
        name: 'Santé',
        subcategories: ['Soins à Domicile', 'Assistance Médicale', 'Nutrition et Diététique', 'Psychologie']
    },
    {
        name: 'Commerce et Vente',
        subcategories: ['Marketing Digital', 'Vente en Ligne', 'Gestion de Stock', 'Service Client']
    },
    {
        name: 'Hôtellerie et Tourisme',
        subcategories: ['Cuisine et Restauration', 'Gestion Hôtelière', 'Guide Touristique', 'Organisation d\'Événements']
    },
    {
        name: 'Droit et Fiscalité',
        subcategories: ['Conseil Juridique', 'Assistance Fiscale', 'Rédaction d\'Actes', 'Médiation']
    },
    {
        name: 'Transport et Logistique',
        subcategories: ['Chauffeur', 'Livraison', 'Gestion d\'Entrepôt', 'Déménagement']
    }
];

async function seedCategories() {
    const categoriesCollection = db.collection('categories');
    for (const category of categories) {
        try {
            await categoriesCollection.add(category);
            console.log(`Category "${category.name}" seeded successfully.`);
        } catch (error) {
            console.error(`Error seeding category "${category.name}":`, error);
        }
    }
}

// To run this script, you would typically execute it in a Node.js environment
// with Firebase Admin SDK configured, or run it in the browser console
// on a page where the Firebase client SDK is initialized.
// For now, I will just leave the function here to be called when needed.
