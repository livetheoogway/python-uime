tailwind.config = {
    theme: {
        extend: {
            colors: {
                clifford: '#da373d',
            }
        }
    }
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
    updateActiveLink();

    // Listen for hash changes to update the active link
    window.addEventListener('hashchange', updateActiveLink);

    function updateActiveLink() {
        // Remove the shadow from all results
        document.querySelectorAll('.func').forEach(function (result) {
            result.classList.remove('shadow-xl');
        });

        // Remove the active class from all links
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.classList.remove('border-slate-400');
            link.classList.remove('text-slate-900');
        });

        // Add the active class to the link that matches the current hash
        var activeLink = document.querySelector('a[href="' + window.location.hash + '"]');
        if (activeLink) {
            activeLink.classList.add('border-slate-400');
            activeLink.classList.add('text-slate-900');
        }
        let func = window.location.hash.substring(1);
        console.log("func:" + func);
        // shadow on the function result
        var activeFunction = document.getElementById(func);
        if (activeFunction) {
            activeFunction.classList.add('shadow-xl');
        }
    }

    const tabs = document.querySelectorAll('.tab-content');
    const sidebars = document.querySelectorAll('.sidebar');
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            // add group=group_id to the url
            const urlParams = new URLSearchParams(window.location.search);
            group=this.getAttribute('href').substring(1)
            urlParams.set('group', group);
            window.history.pushState(
                {},
                '',
                window.location.pathname + '?' + urlParams.toString()
            );

            const targetId = this.getAttribute('href').substring(1); // Remove '#' from href
            const target = document.getElementById(targetId);
            const targetSidebar = document.getElementById(targetId + "-sidebar");

            tabs.forEach(tab => tab.classList.add('hidden'));
            sidebars.forEach(tab => tab.classList.add('hidden'));
            navLinks.forEach(link => link.classList.remove('bg-gray-100', 'text-indigo-950', 'font-semibold', 'hover:bg-gray-300')); // Remove active styles

            if (target) {
                target.classList.remove('hidden');
                targetSidebar.classList.remove('hidden');
                this.classList.add('bg-gray-100', 'text-indigo-950', 'font-semibold', 'hover:bg-gray-300'); // Add active styles
            }

            var form = document.getElementById('global-vars-form-'+group);
            form.addEventListener('submit', function (event) {
                event.preventDefault(); // Prevent default form submission
                saveGlobalVars(form);
            });
        });
    });

    // if query param group has a value, show the tab with the id of the value
    const urlParams = new URLSearchParams(window.location.search);
    let group = urlParams.get('group');
    if (!group) {
        group = tabs[0].id
    }

    const target = document.getElementById(group);
    const targetSidebar = document.getElementById(group + "-sidebar");
    const navLink = document.querySelector(`nav a[href="#${group}"]`);
    target.classList.remove('hidden');
    targetSidebar.classList.remove('hidden');
    navLink.classList.add('bg-gray-100', 'text-indigo-950', 'font-semibold', 'hover:bg-gray-300'); // Add active styles

    document.querySelectorAll('form').forEach(function (form) {
        if (form.id.startsWith('global-vars-form')) { // Skip the global vars form
            return;
        }
        form.onsubmit = function (event) {
            event.preventDefault();
            executeFunction(form, this.closest('.tab-content').id);
        };
    });

    const form = document.getElementById('global-vars-form-' + group);
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        saveGlobalVars(form);
    });

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
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function executeFunction(form, group) {
    const funcName = form.id.replace('-form', '');
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