document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const moodLogPage = document.getElementById('mood-log-page');
    const processingPage = document.getElementById('processing-page');
    const reflectionPage = document.getElementById('reflection-page');

    const startButton = document.getElementById('start-button');
    const submitButton = document.getElementById('submit-button');
    const backButton = document.getElementById('back-button');
    const moodInput = document.getElementById('mood-input');
    const emojiButtons = document.querySelectorAll('.emoji-btn');

    const reflectionTitle = document.getElementById('reflection-title');
    const reflectionText = document.getElementById('reflection-text');

    // Helper: switch screens
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    // Start button → mood log page
    startButton.addEventListener('click', () => {
        showScreen(moodLogPage);
    });

    // Emoji → add to text area
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            moodInput.value += button.textContent + " ";
            moodInput.focus();
        });
    });

    // Submit → send mood to backend
    submitButton.addEventListener('click', () => {
        const mood = moodInput.value.trim();
        if (!mood) {
            alert("Please enter or select a mood before reflecting.");
            return;
        }

        showScreen(processingPage);

        fetch('http://127.0.0.1:5000/reflect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood_entry: mood }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { 
                    throw new Error(err.error || 'Server error'); 
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                reflectionTitle.textContent = "Time to reflect.";
                reflectionText.textContent = data.reflection_question;
                showScreen(reflectionPage);
            } else {
                alert("Error: " + (data.error || "Unknown error"));
                showScreen(moodLogPage);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("⚠️ Could not connect to the backend. Make sure Flask server is running.");
            showScreen(moodLogPage);
        });
    });

    // Back button → reset and go home
    backButton.addEventListener('click', () => {
        moodInput.value = '';
        showScreen(landingPage);
    });
});
