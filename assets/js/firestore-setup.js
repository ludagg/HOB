document.addEventListener('DOMContentLoaded', () => {
    const seedButton = document.getElementById('seed-button');
    const statusDiv = document.getElementById('status');

    seedButton.addEventListener('click', async () => {
        seedButton.disabled = true;
        statusDiv.textContent = 'Configuration en cours...';

        try {
            await seedCategories();
            statusDiv.textContent = 'Configuration terminée avec succès !';
            statusDiv.classList.add('text-green-500');
        } catch (error) {
            statusDiv.textContent = `Une erreur est survenue : ${error.message}`;
            statusDiv.classList.add('text-red-500');
            console.error(error);
        } finally {
            seedButton.disabled = false;
        }
    });
});
