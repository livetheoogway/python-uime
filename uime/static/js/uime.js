tailwind.config = {
    theme: {
        extend: {
            colors: {
                clifford: '#da373d',
            }
        }
    }
}

function openGlobalsSlideOver(event) {
    event.stopPropagation(); // Prevent the click from propagating up to the document
    document.getElementById('globalVarSlideOver').classList.add('open');
}

function closeGlobalsSlideOver() {
    document.getElementById('globalVarSlideOver').classList.remove('open');
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function copyToClipboard(elementId) {
    var text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(function () {
        console.log('Copying to clipboard was successful!');
        // Optional: Change the icon to indicate success
    }, function (err) {
        console.error('Could not copy text: ', err);
    });
}

function formatOutput(resultElement, data) {
    if (typeof data === 'object') {
        // If the response is an object (including arrays), format it as JSON
        resultElement.textContent = JSON.stringify(data, null, 2);
    } else if (typeof data === 'string') {
        try {
            // If the response is a string, try to parse it as JSON
            const jsonData = JSON.parse(data);
            resultElement.textContent = JSON.stringify(jsonData, null, 2);
        } catch (e) {
            // If it's not JSON, just display the raw string
            resultElement.textContent = data;
        }
    } else {
        // For other data types (number, boolean), convert to string
        resultElement.textContent = String(data);
    }
}


// JavaScript for handling form submissions
document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll('.tab-content');
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1); // Remove '#' from href
            const target = document.getElementById(targetId);

            tabs.forEach(tab => tab.classList.add('hidden'));
            navLinks.forEach(link => link.classList.remove('bg-gray-700', 'text-white')); // Remove active styles

            if (target) {
                target.classList.remove('hidden');
                this.classList.add('bg-gray-700', 'text-white'); // Add active styles
            }
        });
    });

    // Show the first tab by default
    if (tabs.length > 0) {
        tabs[0].classList.remove('hidden');
        navLinks[0].classList.add('bg-gray-700', 'text-white'); // Add active styles
    }

    document.querySelectorAll('form').forEach(function (form) {
        if (form.id === 'global-vars-form') { // Skip the global vars form
            return;
        }
        form.onsubmit = function (event) {
            event.preventDefault();
            executeFunction(form, this.closest('.tab-content').id);
        };
    });

    var form = document.getElementById('global-vars-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        saveGlobalVars(form);
    });

});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeGlobalsSlideOver();
    }
});
document.addEventListener('click', function (event) {
    var slideover = document.getElementById('globalVarSlideOver');
    // Check if the click is outside the slideover
    if (slideover.classList.contains('open') && !slideover.contains(event.target)) {
        closeGlobalsSlideOver();
    }
});

function saveGlobalVars(form) {
    var formData = new FormData(form);
    var object = {};
    formData.forEach(function (value, key) {
        object[key] = value;
    });
    var json = JSON.stringify(object);

    fetch('/globals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: json
    })
        .then(() => {
            parent.closeGlobalsSlideOver();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function executeFunction(form, group) {
    const funcName = form.id;
    const resultElement = document.getElementById(`${funcName}_result`);
    const resultSection = document.getElementById(`${funcName}_section`);
    const copyButton = document.getElementById(`${funcName}_copy`);
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch(`/function/${group}/${funcName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            resultSection.classList.remove('hidden');
            formatOutput(resultElement, data);
            if (copyButton) {  // Check if the element exists
                copyButton.classList.remove('hidden'); // Show the copy button
            }
            // resultElement.textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            console.error("We got an error:" + error)
            resultElement.textContent = 'Error: ' + error;
            if (copyButton) {  // Check if the element exists
                copyButton.classList.add('hidden'); // Hide the copy button in case of error
            }
        });
}