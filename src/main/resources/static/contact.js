document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ once: true });

    document.getElementById('contactForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('contactBtn');
        const statusDiv = document.getElementById('contactStatus');
        
        const data = {
            name: document.getElementById('contactName').value.trim(),
            email: document.getElementById('contactEmail').value.trim(),
            subject: document.getElementById('contactSubject').value.trim(),
            message: document.getElementById('contactMessage').value.trim()
        };

        btn.disabled = true;
        btn.innerHTML = `<div class="loader-circle w-5 h-5 border-2 border-slate-500 rounded-full border-t-white mr-2"></div> Sending...`;
        statusDiv.classList.add('hidden');

        try {
            const response = await fetch('/api/contact/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                document.getElementById('contactForm').reset();
                statusDiv.innerHTML = `<span class="text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200 block">✅ Your message has been sent successfully!</span>`;
            } else {
                statusDiv.innerHTML = `<span class="text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200 block">⚠️ Failed to send message. Please try again.</span>`;
            }
        } catch (error) {
            statusDiv.innerHTML = `<span class="text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200 block">⚠️ Network error occurred.</span>`;
        } finally {
            statusDiv.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = 'Send Message';
        }
    });
});